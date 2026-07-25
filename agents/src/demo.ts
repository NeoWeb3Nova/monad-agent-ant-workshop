import {
  encodeAbiParameters,
  formatEther,
  keccak256,
  parseEther,
  stringToHex,
  type Hex,
} from "viem";

import { antColonyAbi } from "./abi/antColonyAbi.js";
import {
  assertContractReady,
  contractAddress,
  publicClient,
} from "./config.js";
import { generateOutput } from "./outputs.js";
import {
  executeWrite,
  renderError,
  type TransactionRecord,
} from "./transactions.js";
import {
  loadSwarmWallets,
  SKILLS,
  type WorkerProfile,
} from "./workers.js";

interface DemoTask {
  taskId: Hex;
  requiredSkill: bigint;
  inputHash: Hex;
  reward: bigint;
  deadline: bigint;
  worker: WorkerProfile;
}

async function main(): Promise<void> {
  await assertContractReady();
  const swarm = loadSwarmWallets();
  assertDistinctWallets([
    swarm.requester.account.address,
    ...swarm.workers.map((worker) => worker.address),
    swarm.guard.account.address,
    swarm.rogue.account.address,
  ]);

  console.log(`AntForge demo on chain ${publicClient.chain.id}`);
  console.log(`Contract: ${contractAddress}`);
  console.log(`Requester: ${swarm.requester.account.address}`);

  const records: TransactionRecord[] = [];
  records.push(
    ...(await Promise.all([
      ...swarm.workers.map((worker) =>
        executeWrite({
          label: `register:${worker.role}`,
          wallet: worker.wallet,
          functionName: "registerAgent",
          args: [worker.skill, profileHash(worker.label)],
        }),
      ),
      executeWrite({
        label: "register:guard",
        wallet: swarm.guard,
        functionName: "registerAgent",
        args: [SKILLS.verify, profileHash("Guard Ant")],
      }),
      executeWrite({
        label: "register:rogue",
        wallet: swarm.rogue,
        functionName: "registerAgent",
        args: [SKILLS.rogue, profileHash("Rogue Ant")],
      }),
    ])),
  );

  const reward = parseEther(process.env.TASK_REWARD_MON?.trim() || "0.001");
  if (reward <= 0n) throw new Error("TASK_REWARD_MON must be greater than zero");

  const colonyId = keccak256(stringToHex(`antforge-swarm-${Date.now()}`));
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3_600);
  const tasks = createTasks(swarm.requester.account.address, colonyId, deadline, reward, swarm.workers);

  records.push(
    await executeWrite({
      label: "create:swarm-colony",
      wallet: swarm.requester,
      functionName: "createColony",
      args: [
        colonyId,
        tasks.map(({ taskId, requiredSkill, inputHash, reward: taskReward, deadline: taskDeadline }) => ({
          taskId,
          requiredSkill,
          inputHash,
          reward: taskReward,
          deadline: taskDeadline,
        })),
        swarm.guard.account.address,
      ],
      value: reward * BigInt(tasks.length),
    }),
  );

  await proveSkillGuard(tasks[0]!, swarm.rogue);

  const claimResults = await Promise.allSettled(
    tasks.map((task) =>
      executeWrite({
        label: `claim:${task.worker.role}`,
        wallet: task.worker.wallet,
        functionName: "claimTask",
        args: [task.taskId],
      }),
    ),
  );
  records.push(...requireAllFulfilled("swarm claims", claimResults));

  const submitResults = await Promise.allSettled(
    tasks.map((task) => {
      const output = generateOutput(task.worker);
      return executeWrite({
        label: `submit:${task.worker.role}`,
        wallet: task.worker.wallet,
        functionName: "submitResult",
        args: [task.taskId, output.outputHash, output.outputUri],
      });
    }),
  );
  records.push(...requireAllFulfilled("swarm submissions", submitResults));

  for (const task of tasks) {
    records.push(
      await executeWrite({
        label: `verify:${task.worker.role}`,
        wallet: swarm.guard,
        functionName: "verifyResult",
        args: [task.taskId],
      }),
    );
  }

  const withdrawResults = await Promise.allSettled(
    tasks.map((task) =>
      executeWrite({
        label: `withdraw:${task.worker.role}`,
        wallet: task.worker.wallet,
        functionName: "withdrawReward",
      }),
    ),
  );
  records.push(...requireAllFulfilled("worker withdrawals", withdrawResults));

  for (const worker of swarm.workers) {
    const remaining = await publicClient.readContract({
      address: contractAddress,
      abi: antColonyAbi,
      functionName: "claimableRewards",
      args: [worker.address],
    });
    if (remaining !== 0n) {
      throw new Error(`${worker.label} has a non-zero reward balance after withdrawal`);
    }
  }

  const conflictRecords = await runConflictLane(swarm, reward, deadline);
  records.push(...conflictRecords);

  printSummary(records, reward, tasks.length);
}

async function proveSkillGuard(
  repairTask: DemoTask,
  rogue: ReturnType<typeof loadSwarmWallets>["rogue"],
): Promise<void> {
  try {
    await executeWrite({
      label: "skill-guard:rogue-claim",
      wallet: rogue,
      functionName: "claimTask",
      args: [repairTask.taskId],
    });
  } catch (error) {
    console.log(
      JSON.stringify({
        event: "skill-guard",
        outcome: "blocked-before-broadcast",
        taskId: repairTask.taskId,
        rogue: rogue.account.address,
        reason: renderError(error),
      }),
    );
    return;
  }
  throw new Error("Skill Guard failed: Rogue Ant claimed the repair task");
}

async function runConflictLane(
  swarm: ReturnType<typeof loadSwarmWallets>,
  reward: bigint,
  deadline: bigint,
): Promise<TransactionRecord[]> {
  const [repairWorker, , storyWorker] = swarm.workers;
  if (!repairWorker || !storyWorker) throw new Error("Conflict lane requires repair and story workers");

  const records: TransactionRecord[] = [];
  records.push(
    await executeWrite({
      label: "conflict:register-backup-repair",
      wallet: storyWorker.wallet,
      functionName: "registerAgent",
      args: [storyWorker.skill | SKILLS.imageRepair, profileHash("Backup Repair Ant")],
    }),
  );

  const colonyId = keccak256(stringToHex(`antforge-conflict-${Date.now()}`));
  const inputHash = keccak256(stringToHex("contested-photo-repair"));
  const taskId = deriveTaskId(swarm.requester.account.address, colonyId, 0n, inputHash);

  records.push(
    await executeWrite({
      label: "conflict:create-colony",
      wallet: swarm.requester,
      functionName: "createColony",
      args: [
        colonyId,
        [{ taskId, requiredSkill: SKILLS.imageRepair, inputHash, reward, deadline }],
        swarm.guard.account.address,
      ],
      value: reward,
    }),
  );

  const contenders = [repairWorker, storyWorker] as const;
  const results = await Promise.allSettled(
    contenders.map((worker) =>
      executeWrite({
        label: `conflict:claim:${worker.label}`,
        wallet: worker.wallet,
        functionName: "claimTask",
        args: [taskId],
      }),
    ),
  );

  const winners = results.flatMap((result, index) =>
    result.status === "fulfilled" ? [{ worker: contenders[index]!, record: result.value }] : [],
  );
  const losers = results.flatMap((result, index) =>
    result.status === "rejected"
      ? [{ worker: contenders[index]!, reason: renderError(result.reason) }]
      : [],
  );

  if (winners.length !== 1 || losers.length !== 1) {
    throw new Error(`Conflict lane expected one winner and one loser, got ${winners.length}/${losers.length}`);
  }

  const winner = winners[0]!;
  records.push(winner.record);
  console.log(
    JSON.stringify({
      event: "conflict-lane",
      taskId,
      winner: winner.worker.address,
      loser: losers[0]!.worker.address,
      loserReason: losers[0]!.reason,
    }),
  );

  const output = generateOutput(winner.worker);
  records.push(
    await executeWrite({
      label: "conflict:submit-winner",
      wallet: winner.worker.wallet,
      functionName: "submitResult",
      args: [taskId, output.outputHash, output.outputUri],
    }),
  );
  records.push(
    await executeWrite({
      label: "conflict:verify-winner",
      wallet: swarm.guard,
      functionName: "verifyResult",
      args: [taskId],
    }),
  );
  records.push(
    await executeWrite({
      label: "conflict:withdraw-winner",
      wallet: winner.worker.wallet,
      functionName: "withdrawReward",
    }),
  );

  return records;
}

function createTasks(
  requester: `0x${string}`,
  colonyId: Hex,
  deadline: bigint,
  reward: bigint,
  workers: readonly WorkerProfile[],
): DemoTask[] {
  const descriptions = ["repair old photo", "color restored photo", "write archival story"];
  return workers.map((worker, index) => {
    const inputHash = keccak256(stringToHex(descriptions[index]!));
    return {
      taskId: deriveTaskId(requester, colonyId, BigInt(index), inputHash),
      requiredSkill: worker.skill,
      inputHash,
      reward,
      deadline,
      worker,
    };
  });
}

function deriveTaskId(
  requester: `0x${string}`,
  colonyId: Hex,
  subtaskIndex: bigint,
  inputHash: Hex,
): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { type: "address" },
        { type: "bytes32" },
        { type: "uint256" },
        { type: "bytes32" },
      ],
      [requester, colonyId, subtaskIndex, inputHash],
    ),
  );
}

function profileHash(label: string): Hex {
  return keccak256(stringToHex(`antforge-profile:${label}`));
}

function requireAllFulfilled(
  label: string,
  results: readonly PromiseSettledResult<TransactionRecord>[],
): TransactionRecord[] {
  const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
  if (failures.length > 0) {
    throw new Error(`${label} failed: ${failures.map((failure) => renderError(failure.reason)).join(" | ")}`);
  }
  return results.map((result) => (result as PromiseFulfilledResult<TransactionRecord>).value);
}

function assertDistinctWallets(addresses: readonly string[]): void {
  if (new Set(addresses.map((address) => address.toLowerCase())).size !== addresses.length) {
    throw new Error("Every AntForge role must use an independent wallet");
  }
}

function printSummary(records: readonly TransactionRecord[], reward: bigint, taskCount: number): void {
  const averageLatency = Math.round(
    records.reduce((total, record) => total + record.inclusionLatencyMs, 0) / records.length,
  );
  console.log(
    JSON.stringify({
      event: "demo-complete",
      blockchainSettlement: "live",
      agentExecution: "deterministic-mock",
      swarmTaskCount: taskCount,
      taskRewardMon: formatEther(reward),
      successfulTransactions: records.length,
      averageTransactionInclusionLatencyMs: averageLatency,
    }),
  );
}

main().catch((error) => {
  console.error(`AntForge demo failed: ${renderError(error)}`);
  process.exitCode = 1;
});
