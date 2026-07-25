import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { formatEther, keccak256, stringToHex, type Address, type Hex } from "viem";

import { antColonyAbi } from "./abi/antColonyAbi.js";
import {
  assertContractReady,
  contractAddress,
  pollingIntervalMs,
  publicClient,
  type AgentWallet,
} from "./config.js";
import { generateOutput, validateOutput } from "./outputs.js";
import {
  executeWrite,
  renderError,
  TransactionExecutionError,
} from "./transactions.js";
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
const TASK_REJECTED = 5;
const TASK_CANCELLED = 6;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const MAX_RUNTIME_RETRIES = 3;
const MAX_LOG_BLOCK_RANGE = 100n;

interface TaskState {
  worker: Address;
  verifier: Address;
  requiredSkill: bigint;
  outputHash: Hex;
  deadline: number;
  status: number;
}

const processingTasks = new Set<Hex>();
const retryAttempts = new Map<Hex, number>();
const workerQueues = new Map<string, Promise<void>>();
let guardQueue: Promise<void> = Promise.resolve();

async function main(): Promise<void> {
  await assertContractReady();
  const swarm = loadSwarmWallets();
  const fromBlock = await resolveFromBlock();

  await printWalletReadiness(swarm);
  await Promise.all([
    ...swarm.workers.map((worker) =>
      ensureAgentRegistered({
        label: `runner:register:${worker.role}`,
        wallet: worker.wallet,
        skills: worker.skill,
        metadataHash: profileHash(worker.label),
      }),
    ),
    ensureAgentRegistered({
      label: "runner:register:guard",
      wallet: swarm.guard,
      skills: SKILLS.verify,
      metadataHash: profileHash("Guard Ant"),
    }),
    ensureAgentRegistered({
      label: "runner:register:rogue",
      wallet: swarm.rogue,
      skills: SKILLS.rogue,
      metadataHash: profileHash("Rogue Ant"),
    }),
  ]);

  const backfillToBlock = await publicClient.getBlockNumber();
  const historicalLogs = await getTaskCreatedLogs(fromBlock, backfillToBlock);
  for (const log of historicalLogs) {
    dispatchTaskLog(log.args.taskId, log.args.skill, swarm);
  }

  console.log(
    JSON.stringify({
      event: "runner-ready",
      chainId: publicClient.chain.id,
      contractAddress,
      pollingIntervalMs,
      fromBlock: fromBlock.toString(),
      backfillToBlock: backfillToBlock.toString(),
      replayedTasks: historicalLogs.length,
      workers: swarm.workers.map((worker) => ({
        role: worker.role,
        address: worker.address,
        skill: worker.skill.toString(),
      })),
      guard: swarm.guard.account.address,
    }),
  );

  let nextWatchBlock = backfillToBlock + 1n;
  let stopped = false;
  let pollTimer: NodeJS.Timeout | undefined;
  const pollTaskCreated = async () => {
    if (stopped) return;
    try {
      const latestBlock = await publicClient.getBlockNumber();
      if (nextWatchBlock <= latestBlock) {
        const logs = await getTaskCreatedLogs(nextWatchBlock, latestBlock);
        for (const log of logs) {
          dispatchTaskLog(log.args.taskId, log.args.skill, swarm);
        }
        nextWatchBlock = latestBlock + 1n;
      }
    } catch (error) {
      console.error(`TaskCreated watcher error: ${renderError(error)}`);
    } finally {
      if (!stopped) pollTimer = setTimeout(pollTaskCreated, pollingIntervalMs);
    }
  };
  pollTimer = setTimeout(pollTaskCreated, 0);

  const shutdown = (signal: string) => {
    console.log(`Stopping AntForge runner after ${signal}`);
    stopped = true;
    if (pollTimer) clearTimeout(pollTimer);
    process.exitCode = 0;
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

async function ensureAgentRegistered(input: {
  label: string;
  wallet: AgentWallet;
  skills: bigint;
  metadataHash: Hex;
}): Promise<void> {
  const current = await publicClient.readContract({
    address: contractAddress,
    abi: antColonyAbi,
    functionName: "agents",
    args: [input.wallet.account.address],
  });
  if (current[2] && current[0] === input.skills && current[1] === input.metadataHash) {
    console.log(
      JSON.stringify({
        event: "agent-ready",
        label: input.label,
        address: input.wallet.account.address,
        registration: "already-current",
      }),
    );
    return;
  }
  await executeWrite({
    label: input.label,
    wallet: input.wallet,
    functionName: "registerAgent",
    args: [input.skills, input.metadataHash],
  });
}

async function getTaskCreatedLogs(fromBlock: bigint, toBlock: bigint) {
  if (fromBlock > toBlock) {
    throw new Error(`RUNNER_FROM_BLOCK ${fromBlock} is ahead of current block ${toBlock}`);
  }

  const firstChunkEnd =
    fromBlock + MAX_LOG_BLOCK_RANGE - 1n < toBlock
      ? fromBlock + MAX_LOG_BLOCK_RANGE - 1n
      : toBlock;
  const logs = await publicClient.getContractEvents({
    address: contractAddress,
    abi: antColonyAbi,
    eventName: "TaskCreated",
    fromBlock,
    toBlock: firstChunkEnd,
  });

  for (
    let chunkStart = firstChunkEnd + 1n;
    chunkStart <= toBlock;
    chunkStart += MAX_LOG_BLOCK_RANGE
  ) {
    const chunkEnd =
      chunkStart + MAX_LOG_BLOCK_RANGE - 1n < toBlock
        ? chunkStart + MAX_LOG_BLOCK_RANGE - 1n
        : toBlock;
    logs.push(
      ...(await publicClient.getContractEvents({
        address: contractAddress,
        abi: antColonyAbi,
        eventName: "TaskCreated",
        fromBlock: chunkStart,
        toBlock: chunkEnd,
      })),
    );
  }
  return logs;
}

function dispatchTaskLog(
  taskId: Hex | undefined,
  skill: bigint | undefined,
  swarm: ReturnType<typeof loadSwarmWallets>,
): void {
  if (!taskId || skill === undefined) return;
  const worker = workerForSkill(swarm.workers, skill);
  if (!worker) {
    console.log(JSON.stringify({ event: "task-unmatched", taskId, requiredSkill: skill.toString() }));
    return;
  }
  enqueueWorker(worker, async () => processTask(taskId, worker, swarm.guard));
}

async function processTask(
  taskId: Hex,
  worker: WorkerProfile,
  guard: ReturnType<typeof loadSwarmWallets>["guard"],
): Promise<void> {
  if (processingTasks.has(taskId)) return;
  processingTasks.add(taskId);

  try {
    for (let transition = 0; transition < 5; transition += 1) {
      const task = await readTask(taskId);
      assertTaskAssignment(taskId, task, worker, guard.account.address);

      if (task.status === TASK_OPEN) {
        if (BigInt(task.deadline) <= BigInt(Math.floor(Date.now() / 1_000))) {
          throw new Error(`Task ${taskId} is already past its deadline`);
        }
        await executeWrite({
          label: `runner:claim:${worker.role}`,
          wallet: worker.wallet,
          functionName: "claimTask",
          args: [taskId],
        });
        continue;
      }

      if (task.status === TASK_CLAIMED) {
        if (task.worker.toLowerCase() !== worker.address.toLowerCase()) {
          console.log(JSON.stringify({ event: "task-owned-by-other-worker", taskId, worker: task.worker }));
          retryAttempts.delete(taskId);
          return;
        }
        const output = generateOutput(worker);
        await executeWrite({
          label: `runner:submit:${worker.role}`,
          wallet: worker.wallet,
          functionName: "submitResult",
          args: [taskId, output.outputHash, output.outputUri],
        });
        continue;
      }

      if (task.status === TASK_SUBMITTED) {
        if (task.worker.toLowerCase() !== worker.address.toLowerCase()) {
          throw new Error(`Submitted task ${taskId} belongs to unexpected worker ${task.worker}`);
        }
        await enqueueGuard(async () => {
          const beforeVerify = await readTask(taskId);
          assertTaskAssignment(taskId, beforeVerify, worker, guard.account.address);
          if (beforeVerify.status !== TASK_SUBMITTED) return;
          if (!validateOutput(beforeVerify.outputHash, worker)) {
            await executeWrite({
              label: `runner:reject:${worker.role}`,
              wallet: guard,
              functionName: "rejectAndRefund",
              args: [taskId, keccak256(stringToHex("antforge-invalid-deterministic-output"))],
            });
            return;
          }
          await executeWrite({
            label: `runner:verify:${worker.role}`,
            wallet: guard,
            functionName: "verifyResult",
            args: [taskId],
          });
        });
        continue;
      }

      if (task.status === TASK_SETTLED) {
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
        retryAttempts.delete(taskId);
        console.log(JSON.stringify({ event: "task-complete", taskId, worker: worker.address }));
        return;
      }

      if (task.status === TASK_REJECTED || task.status === TASK_CANCELLED) {
        retryAttempts.delete(taskId);
        console.log(JSON.stringify({ event: "task-terminal", taskId, status: task.status }));
        return;
      }

      console.log(JSON.stringify({ event: "task-skipped", taskId, status: task.status }));
      return;
    }
    throw new Error(`Task ${taskId} exceeded the bounded transition loop`);
  } catch (error) {
    const attempt = (retryAttempts.get(taskId) ?? 0) + 1;
    retryAttempts.set(taskId, attempt);
    console.error(
      JSON.stringify({
        event: "task-failed",
        ok: false,
        taskId,
        worker: worker.address,
        attempt,
        code: error instanceof TransactionExecutionError ? "TRANSACTION_UNRESOLVED" : "TASK_RECONCILE_FAILED",
        message: renderError(error),
        txHash: error instanceof TransactionExecutionError ? error.transactionHash ?? null : null,
      }),
    );
    if (attempt <= MAX_RUNTIME_RETRIES) {
      setTimeout(
        () => enqueueWorker(worker, async () => processTask(taskId, worker, guard)),
        pollingIntervalMs * 2,
      );
    }
  } finally {
    processingTasks.delete(taskId);
  }
}

async function readTask(taskId: Hex): Promise<TaskState> {
  const task = await publicClient.readContract({
    address: contractAddress,
    abi: antColonyAbi,
    functionName: "tasks",
    args: [taskId],
  });
  return {
    worker: task[2],
    verifier: task[3],
    requiredSkill: task[4],
    outputHash: task[6],
    deadline: task[8],
    status: task[9],
  };
}

function assertTaskAssignment(
  taskId: Hex,
  task: TaskState,
  worker: WorkerProfile,
  guardAddress: Address,
): void {
  if ((worker.skill & task.requiredSkill) === 0n) {
    throw new Error(`Configured worker skill does not match ${taskId}`);
  }
  if (task.verifier.toLowerCase() !== guardAddress.toLowerCase()) {
    throw new Error(`Task ${taskId} is assigned to a different verifier`);
  }
  if (task.status === TASK_OPEN && task.worker.toLowerCase() !== ZERO_ADDRESS) {
    throw new Error(`Open task ${taskId} unexpectedly has worker ${task.worker}`);
  }
}

function enqueueWorker(worker: WorkerProfile, action: () => Promise<void>): void {
  const key = worker.address.toLowerCase();
  const previous = workerQueues.get(key) ?? Promise.resolve();
  const next = previous.then(action, action);
  const tracked = next.finally(() => {
    if (workerQueues.get(key) === tracked) workerQueues.delete(key);
  });
  workerQueues.set(key, tracked);
}

function enqueueGuard(action: () => Promise<void>): Promise<void> {
  const next = guardQueue.then(action, action);
  guardQueue = next.catch(() => undefined);
  return next;
}

async function resolveFromBlock(): Promise<bigint> {
  const raw = process.env.RUNNER_FROM_BLOCK?.trim();
  if (raw) {
    const value = BigInt(raw);
    if (value < 0n) throw new Error("RUNNER_FROM_BLOCK cannot be negative");
    return value;
  }

  const path = resolve(
    ".runtime",
    `runner-${publicClient.chain.id}-${contractAddress.toLowerCase()}.block`,
  );
  try {
    const persisted = BigInt((await readFile(path, "utf8")).trim());
    if (persisted < 0n) throw new Error("Persisted runner block cannot be negative");
    return persisted;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const startBlock = await publicClient.getBlockNumber();
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${startBlock}\n`, { mode: 0o600 });
  return startBlock;
}

async function printWalletReadiness(swarm: ReturnType<typeof loadSwarmWallets>): Promise<void> {
  const roles = [
    { role: "requester", address: swarm.requester.account.address },
    ...swarm.workers.map((worker) => ({ role: worker.role, address: worker.address })),
    { role: "guard", address: swarm.guard.account.address },
    { role: "rogue", address: swarm.rogue.account.address },
  ];
  const balances = await Promise.all(
    roles.map(async (role) => ({
      ...role,
      balanceMon: formatEther(await publicClient.getBalance({ address: role.address })),
    })),
  );
  console.log(JSON.stringify({ event: "wallet-readiness", balances }));
}

function profileHash(label: string): Hex {
  return keccak256(stringToHex(`antforge-profile:${label}`));
}

main().catch((error) => {
  console.error(`AntForge runner failed to start: ${renderError(error)}`);
  process.exitCode = 1;
});
