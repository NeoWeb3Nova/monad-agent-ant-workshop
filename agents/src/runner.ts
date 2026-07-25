import { keccak256, stringToHex, type Address, type Hex } from "viem";

import { antColonyAbi } from "./abi/antColonyAbi.js";
import {
  assertContractReady,
  contractAddress,
  pollingIntervalMs,
  publicClient,
} from "./config.js";
import { generateOutput } from "./outputs.js";
import { executeWrite, renderError } from "./transactions.js";
import {
  loadSwarmWallets,
  SKILLS,
  workerForSkill,
  type WorkerProfile,
} from "./workers.js";

const TASK_OPEN = 1;
const TASK_CLAIMED = 2;
const TASK_SUBMITTED = 3;
const TASK_SETTLED = 4;

const processingTasks = new Set<Hex>();
const workerQueues = new Map<string, Promise<void>>();
let guardQueue: Promise<void> = Promise.resolve();

async function main(): Promise<void> {
  await assertContractReady();
  const swarm = loadSwarmWallets();

  await Promise.all([
    ...swarm.workers.map((worker) =>
      executeWrite({
        label: `runner:register:${worker.role}`,
        wallet: worker.wallet,
        functionName: "registerAgent",
        args: [worker.skill, profileHash(worker.label)],
      }),
    ),
    executeWrite({
      label: "runner:register:guard",
      wallet: swarm.guard,
      functionName: "registerAgent",
      args: [SKILLS.verify, profileHash("Guard Ant")],
    }),
    executeWrite({
      label: "runner:register:rogue",
      wallet: swarm.rogue,
      functionName: "registerAgent",
      args: [SKILLS.rogue, profileHash("Rogue Ant")],
    }),
  ]);

  const fromBlock = readFromBlock();
  console.log(
    JSON.stringify({
      event: "runner-ready",
      chainId: publicClient.chain.id,
      contractAddress,
      pollingIntervalMs,
      fromBlock: fromBlock?.toString() ?? "latest",
      workers: swarm.workers.map((worker) => ({
        role: worker.role,
        address: worker.address,
        skill: worker.skill.toString(),
      })),
      guard: swarm.guard.account.address,
    }),
  );

  const unwatch = publicClient.watchContractEvent({
    address: contractAddress,
    abi: antColonyAbi,
    eventName: "TaskCreated",
    pollingInterval: pollingIntervalMs,
    ...(fromBlock === undefined ? {} : { fromBlock }),
    onLogs: (logs) => {
      for (const log of logs) {
        const taskId = log.args.taskId;
        const skill = log.args.skill;
        if (!taskId || skill === undefined) continue;

        const worker = workerForSkill(swarm.workers, skill);
        if (!worker) {
          console.log(JSON.stringify({ event: "task-unmatched", taskId, requiredSkill: skill.toString() }));
          continue;
        }

        enqueueWorker(worker, async () => {
          await processTask(taskId, worker, swarm.guard);
        });
      }
    },
    onError: (error) => {
      console.error(`TaskCreated watcher error: ${renderError(error)}`);
    },
  });

  const shutdown = (signal: string) => {
    console.log(`Stopping AntForge runner after ${signal}`);
    unwatch();
    process.exitCode = 0;
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

async function processTask(
  taskId: Hex,
  worker: WorkerProfile,
  guard: ReturnType<typeof loadSwarmWallets>["guard"],
): Promise<void> {
  if (processingTasks.has(taskId)) return;
  processingTasks.add(taskId);

  try {
    let task = await readTask(taskId);
    if (task.status !== TASK_OPEN) {
      console.log(JSON.stringify({ event: "task-skipped", taskId, status: task.status }));
      return;
    }

    await executeWrite({
      label: `runner:claim:${worker.role}`,
      wallet: worker.wallet,
      functionName: "claimTask",
      args: [taskId],
    });

    task = await readTask(taskId);
    if (task.status !== TASK_CLAIMED || task.worker.toLowerCase() !== worker.address.toLowerCase()) {
      throw new Error(`Claim receipt did not produce the expected worker/state for ${taskId}`);
    }

    const output = generateOutput(worker);
    await executeWrite({
      label: `runner:submit:${worker.role}`,
      wallet: worker.wallet,
      functionName: "submitResult",
      args: [taskId, output.outputHash, output.outputUri],
    });

    task = await readTask(taskId);
    if (task.status !== TASK_SUBMITTED) {
      throw new Error(`Submit receipt did not produce Submitted state for ${taskId}`);
    }

    await enqueueGuard(async () => {
      const beforeVerify = await readTask(taskId);
      if (beforeVerify.status !== TASK_SUBMITTED) return;

      await executeWrite({
        label: `runner:verify:${worker.role}`,
        wallet: guard,
        functionName: "verifyResult",
        args: [taskId],
      });
    });

    task = await readTask(taskId);
    if (task.status !== TASK_SETTLED) {
      throw new Error(`Guard receipt did not produce Settled state for ${taskId}`);
    }

    const reward = await publicClient.readContract({
      address: contractAddress,
      abi: antColonyAbi,
      functionName: "claimableRewards",
      args: [worker.address],
    });
    if (reward > 0n) {
      await executeWrite({
        label: `runner:withdraw:${worker.role}`,
        wallet: worker.wallet,
        functionName: "withdrawReward",
      });
    }

    console.log(JSON.stringify({ event: "task-complete", taskId, worker: worker.address }));
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "task-failed",
        taskId,
        worker: worker.address,
        reason: renderError(error),
      }),
    );
  } finally {
    processingTasks.delete(taskId);
  }
}

async function readTask(taskId: Hex): Promise<{ worker: Address; status: number }> {
  const task = await publicClient.readContract({
    address: contractAddress,
    abi: antColonyAbi,
    functionName: "tasks",
    args: [taskId],
  });
  return { worker: task[2], status: task[9] };
}

function enqueueWorker(worker: WorkerProfile, action: () => Promise<void>): void {
  const key = worker.address.toLowerCase();
  const previous = workerQueues.get(key) ?? Promise.resolve();
  const next = previous.then(action, action).finally(() => {
    if (workerQueues.get(key) === next) workerQueues.delete(key);
  });
  workerQueues.set(key, next);
}

function enqueueGuard(action: () => Promise<void>): Promise<void> {
  const next = guardQueue.then(action, action);
  guardQueue = next.catch(() => undefined);
  return next;
}

function readFromBlock(): bigint | undefined {
  const raw = process.env.RUNNER_FROM_BLOCK?.trim();
  if (!raw) return undefined;
  const value = BigInt(raw);
  if (value < 0n) throw new Error("RUNNER_FROM_BLOCK cannot be negative");
  return value;
}

function profileHash(label: string): Hex {
  return keccak256(stringToHex(`antforge-profile:${label}`));
}

main().catch((error) => {
  console.error(`AntForge runner failed to start: ${renderError(error)}`);
  process.exitCode = 1;
});
