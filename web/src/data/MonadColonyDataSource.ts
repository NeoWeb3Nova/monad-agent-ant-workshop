import {
  getAccount,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";
import {
  createPublicClient,
  encodeAbiParameters,
  formatEther,
  http,
  keccak256,
  parseEventLogs,
  parseEther,
  stringToHex,
  zeroAddress,
  type Address,
  type Hash,
  type Hex,
  type Log,
} from "viem";

import { antColonyAbi } from "../abi/antColonyAbi";
import type {
  AgentView,
  ColonyDataSource,
  ColonyEventView,
  ColonySnapshot,
  Skill,
  TaskStatus,
  TaskView,
} from "../domain";
import {
  monadExplorerUrl,
  monadRpcUrl,
  monadTestnet,
  readContractAddress,
  readGuardAddress,
  wagmiConfig,
} from "../lib/web3";

const SKILLS = {
  repair: 1n << 0n,
  color: 1n << 1n,
  story: 1n << 2n,
} as const;

const taskStatus: TaskStatus[] = [
  "open",
  "open",
  "claimed",
  "submitted",
  "settled",
  "rejected",
  "cancelled",
];

const taskTitle: Record<Skill, string> = {
  repair: "Restore damaged portrait",
  color: "Rebuild period color palette",
  story: "Write the recovered memory",
  verify: "Verify submitted artifact",
  rogue: "Unknown task",
};

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(monadRpcUrl, { retryCount: 3, timeout: 20_000 }),
  pollingInterval: 800,
});

const MAX_LOG_BLOCK_RANGE = 100n;

interface LocalMetric {
  sentAt: string;
  receiptAt: string;
  inclusionLatencyMs: number;
  gasLimit: bigint;
}

function requiredAddress(value: Address | undefined, name: string): Address {
  if (!value) throw new Error(`${name} is required in Live Mode.`);
  return value;
}

function shortAddress(address: Address): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function skillFromBits(bits: bigint): Skill {
  if ((bits & SKILLS.repair) !== 0n) return "repair";
  if ((bits & SKILLS.color) !== 0n) return "color";
  if ((bits & SKILLS.story) !== 0n) return "story";
  return "rogue";
}

function displayError(error: unknown): string {
  if (error instanceof Error) {
    const withShortMessage = error as Error & { shortMessage?: string };
    return withShortMessage.shortMessage ?? error.message;
  }
  return String(error);
}

function hasTaskId<T extends { args: { taskId?: Hex } }>(
  log: T,
): log is T & { args: { taskId: Hex } } {
  return Boolean(log.args.taskId);
}

function emptyLiveSnapshot(contractAddress?: Address): ColonySnapshot {
  return {
    mode: "live",
    networkName: "Monad Testnet",
    contractAddress,
    explorerUrl: monadExplorerUrl,
    runnerStatus: "unknown",
    goal: "Create a live Colony from the connected wallet.",
    colonyId: "No live colony loaded",
    totalBudgetMon: "0",
    agents: [],
    tasks: [],
    events: [],
    swarmLane: { state: "idle", summary: "Waiting for live task events." },
    skillGuardLane: { state: "idle", summary: "No live SkillMismatch evidence loaded." },
    conflictLane: { state: "idle", summary: "No live TaskNotOpen evidence loaded." },
    isRunning: false,
  };
}

export class MonadColonyDataSource implements ColonyDataSource {
  readonly mode = "live" as const;
  private snapshot = emptyLiveSnapshot(readContractAddress());
  private readonly listeners = new Set<() => void>();
  private readonly localMetrics = new Map<Hash, LocalMetric>();
  private readonly historicalLogs: Log[] = [];
  private contractReady = false;
  private historicalLogsDirty = false;
  private nextLogBlock?: bigint;
  private intervalId?: number;
  private refreshInFlight?: Promise<void>;

  getSnapshot(): ColonySnapshot {
    return this.snapshot;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    if (!this.intervalId) {
      this.intervalId = window.setInterval(() => void this.refresh(), 5_000);
    }
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0 && this.intervalId) {
        window.clearInterval(this.intervalId);
        this.intervalId = undefined;
      }
    };
  }

  async refresh(): Promise<void> {
    if (this.refreshInFlight) return this.refreshInFlight;
    this.refreshInFlight = this.loadSnapshot().finally(() => {
      this.refreshInFlight = undefined;
    });
    return this.refreshInFlight;
  }

  reset(): void {
    void this.refresh();
  }

  async releaseSwarm(goal: string): Promise<void> {
    const contractAddress = requiredAddress(
      readContractAddress(),
      "VITE_ANT_COLONY_ADDRESS",
    );
    const verifier = requiredAddress(readGuardAddress(), "VITE_GUARD_ADDRESS");
    const account = getAccount(wagmiConfig);
    if (!account.isConnected || !account.address) {
      throw new Error("Connect an injected wallet before creating a live Colony.");
    }
    if (account.chainId !== monadTestnet.id) {
      throw new Error(`Switch the wallet to Monad Testnet (${monadTestnet.id}).`);
    }
    const requester = account.address;

    const inputLabels = ["repair", "color", "story"] as const;
    const inputHashes: Record<(typeof inputLabels)[number], Hex> = {
      repair: keccak256(stringToHex(`${goal.trim()}::repair`)),
      color: keccak256(stringToHex(`${goal.trim()}::color`)),
      story: keccak256(stringToHex(`${goal.trim()}::story`)),
    };
    const colonyId = keccak256(
      encodeAbiParameters(
        [
          { type: "address" },
          { type: "uint256" },
          { type: "bytes32" },
        ],
        [requester, BigInt(Date.now()), keccak256(stringToHex(goal.trim()))],
      ),
    );
    const reward = parseEther("0.001");
    const deadline = Math.floor(Date.now() / 1_000) + 3_600;
    const tasks = inputLabels.map((label, index) => ({
      taskId: keccak256(
        encodeAbiParameters(
          [
            { type: "address" },
            { type: "bytes32" },
            { type: "uint256" },
            { type: "bytes32" },
          ],
          [requester, colonyId, BigInt(index), inputHashes[label]],
        ),
      ),
      requiredSkill: SKILLS[label],
      inputHash: inputHashes[label],
      reward,
      deadline,
    }));
    const parameters = {
      address: contractAddress,
      abi: antColonyAbi,
      functionName: "createColony" as const,
      args: [colonyId, tasks, verifier] as const,
      value: reward * BigInt(tasks.length),
      account: requester,
    };

    await publicClient.simulateContract(parameters);
    const sentAtMs = Date.now();
    const sentAt = new Date(sentAtMs).toISOString();
    const transactionHash = await writeContract(wagmiConfig, parameters);
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash: transactionHash,
      confirmations: 1,
      timeout: 120_000,
    });
    const receiptAtMs = Date.now();
    const transaction = await publicClient.getTransaction({ hash: transactionHash });
    if (receipt.status !== "success") {
      throw new Error(`createColony reverted: ${transactionHash}`);
    }

    this.localMetrics.set(transactionHash, {
      sentAt,
      receiptAt: new Date(receiptAtMs).toISOString(),
      inclusionLatencyMs: receiptAtMs - sentAtMs,
      gasLimit: transaction.gas,
    });
    await this.refresh();
  }

  private async loadSnapshot(): Promise<void> {
    const contractAddress = readContractAddress();
    if (!contractAddress) {
      this.setError("VITE_ANT_COLONY_ADDRESS is missing. Live Mode did not fall back to Mock.");
      return;
    }

    try {
      if (!this.contractReady) {
        const code = await publicClient.getBytecode({ address: contractAddress });
        if (!code || code === "0x") {
          throw new Error(`No contract bytecode at ${contractAddress} on Monad Testnet.`);
        }
        this.contractReady = true;
      }
      const deploymentBlock = import.meta.env.VITE_DEPLOYMENT_BLOCK?.trim();
      if (!deploymentBlock || !/^\d+$/.test(deploymentBlock) || BigInt(deploymentBlock) <= 0n) {
        throw new Error("VITE_DEPLOYMENT_BLOCK must be the non-zero AntColony deployment block.");
      }
      const fromBlock = BigInt(deploymentBlock);
      const latestBlock = await publicClient.getBlockNumber();
      if (fromBlock > latestBlock) {
        throw new Error(`VITE_DEPLOYMENT_BLOCK ${fromBlock} is ahead of block ${latestBlock}.`);
      }
      this.nextLogBlock ??= fromBlock;
      for (
        let chunkStart = this.nextLogBlock;
        chunkStart <= latestBlock;
        chunkStart += MAX_LOG_BLOCK_RANGE
      ) {
        const chunkEnd =
          chunkStart + MAX_LOG_BLOCK_RANGE - 1n < latestBlock
            ? chunkStart + MAX_LOG_BLOCK_RANGE - 1n
            : latestBlock;
        const logs = await publicClient.getLogs({
          address: contractAddress,
          fromBlock: chunkStart,
          toBlock: chunkEnd,
        });
        this.historicalLogsDirty ||= logs.length > 0;
        this.historicalLogs.push(...logs);
        this.nextLogBlock = chunkEnd + 1n;
      }
      if (!this.historicalLogsDirty && this.historicalLogs.length > 0) return;
      const decodedLogs = parseEventLogs({
        abi: antColonyAbi,
        logs: this.historicalLogs,
        strict: true,
      });
      const colonies = decodedLogs.filter((log) => log.eventName === "ColonyCreated");
      const latestColony = colonies.at(-1);
      if (
        !latestColony?.args.colonyId ||
        !latestColony.args.requester ||
        latestColony.blockNumber === null ||
        !latestColony.transactionHash
      ) {
        this.snapshot = {
          ...emptyLiveSnapshot(contractAddress),
          events: [
            {
              id: "live-empty",
              at: "Current RPC state",
              title: "Contract connected",
              detail: "No ColonyCreated event exists in the configured block range.",
              tone: "neutral",
            },
          ],
        };
        this.historicalLogsDirty = false;
        this.emit();
        return;
      }

      const eventFromBlock = latestColony.blockNumber;
      const currentColonyLogs = decodedLogs.filter(
        (log) => log.blockNumber !== null && log.blockNumber >= eventFromBlock,
      );
      const created = currentColonyLogs.filter((log) => log.eventName === "TaskCreated");
      const claimed = currentColonyLogs.filter((log) => log.eventName === "TaskClaimed");
      const submitted = currentColonyLogs.filter((log) => log.eventName === "ResultSubmitted");
      const verified = currentColonyLogs.filter((log) => log.eventName === "ResultVerified");
      const credited = currentColonyLogs.filter((log) => log.eventName === "RewardCredited");
      const rejected = currentColonyLogs.filter((log) => log.eventName === "TaskRejected");
      const cancelled = currentColonyLogs.filter((log) => log.eventName === "TaskCancelled");

      const validCreated = created.filter(hasTaskId);
      const taskReads = await Promise.all(
        validCreated.map(async (log) => ({
          log,
          state: await publicClient.readContract({
            address: contractAddress,
            abi: antColonyAbi,
            functionName: "tasks",
            args: [log.args.taskId],
          }),
        })),
      );
      const colonyTasks = taskReads.filter(
        ({ state }) => state[0] === latestColony.args.colonyId,
      );
      const taskIds = new Set<Hex>(
        colonyTasks.map(({ log }) => log.args.taskId),
      );
      const latestTaskEvent = new Map<Hex, { hash: Hash; blockNumber: bigint }>();
      for (const log of [...created, ...claimed, ...submitted, ...verified, ...credited, ...rejected, ...cancelled]) {
        const taskId = log.args.taskId;
        if (taskId && taskIds.has(taskId) && log.transactionHash) {
          latestTaskEvent.set(taskId, {
            hash: log.transactionHash,
            blockNumber: log.blockNumber,
          });
        }
      }

      const tasks: TaskView[] = colonyTasks.map(({ log, state }) => {
        const skill = skillFromBits(state[4]);
        const evidence = latestTaskEvent.get(log.args.taskId);
        return {
          id: log.args.taskId,
          title: taskTitle[skill],
          skill,
          rewardMon: formatEther(state[7]),
          status: taskStatus[state[9]] ?? "cancelled",
          workerId: state[2] === zeroAddress ? undefined : state[2],
          outputSummary:
            state[6] === `0x${"0".repeat(64)}` ? undefined : `Output ${state[6].slice(0, 10)}...`,
          transactionHash: evidence?.hash,
          blockNumber: evidence?.blockNumber,
        };
      });

      const agents = this.buildAgents(
        latestColony.args.requester,
        colonyTasks.map(({ state }) => ({ worker: state[2], verifier: state[3], skill: state[4] })),
      );
      const events = this.buildEvents(
        latestColony.transactionHash,
        latestColony.blockNumber,
        [...created, ...claimed, ...submitted, ...verified, ...credited, ...rejected, ...cancelled]
          .filter(hasTaskId)
          .filter((log) => taskIds.has(log.args.taskId)),
      );
      const hasClaims = tasks.some((task) => task.status !== "open");
      const allSettled = tasks.length > 0 && tasks.every((task) => task.status === "settled");
      const totalBudget = tasks.reduce(
        (sum, task) => sum + Number.parseFloat(task.rewardMon),
        0,
      );

      this.snapshot = {
        mode: "live",
        networkName: "Monad Testnet",
        contractAddress,
        explorerUrl: monadExplorerUrl,
        runnerStatus: hasClaims ? "online" : "unknown",
        goal: "Live Colony reconstructed from Monad events.",
        colonyId: latestColony.args.colonyId,
        totalBudgetMon: totalBudget.toFixed(3),
        agents,
        tasks,
        events,
        swarmLane: {
          state: allSettled ? "passed" : hasClaims ? "running" : "idle",
          summary: allSettled
            ? "All live tasks settled."
            : hasClaims
              ? "Live workers are processing task slots."
              : "Waiting for the Agent Runner to claim tasks.",
        },
        skillGuardLane: {
          state: "idle",
          summary: "Live revert evidence is produced by the Agent CLI demo.",
        },
        conflictLane: {
          state: "idle",
          summary: "Live conflict evidence is produced by the Agent CLI demo.",
        },
        isRunning: hasClaims && !allSettled,
      };
      this.historicalLogsDirty = false;
      this.emit();
    } catch (error) {
      this.setError(displayError(error));
    }
  }

  private buildAgents(
    requester: Address,
    taskActors: Array<{ worker: Address; verifier: Address; skill: bigint }>,
  ): AgentView[] {
    const agents: AgentView[] = [
      {
        id: requester,
        name: "Dune Queen",
        role: "queen",
        skills: [],
        walletAddress: requester,
        walletLabel: shortAddress(requester),
      },
    ];
    const seen = new Set<Address>([requester]);
    for (const actor of taskActors) {
      if (actor.verifier !== zeroAddress && !seen.has(actor.verifier)) {
        seen.add(actor.verifier);
        agents.push({
          id: actor.verifier,
          name: "Guard Ant",
          role: "guard",
          skills: ["verify"],
          walletAddress: actor.verifier,
          walletLabel: shortAddress(actor.verifier),
        });
      }
      if (actor.worker !== zeroAddress && !seen.has(actor.worker)) {
        seen.add(actor.worker);
        const skill = skillFromBits(actor.skill);
        agents.push({
          id: actor.worker,
          name: `${taskTitle[skill].split(" ")[0]} Ant`,
          role: "worker",
          skills: [skill],
          walletAddress: actor.worker,
          walletLabel: shortAddress(actor.worker),
        });
      }
    }
    return agents;
  }

  private buildEvents(
    colonyHash: Hash,
    colonyBlock: bigint,
    taskLogs: Array<{
      eventName: string;
      transactionHash: Hash | null;
      blockNumber: bigint;
      args: { taskId?: Hex };
    }>,
  ): ColonyEventView[] {
    const colonyMetric = this.localMetrics.get(colonyHash);
    const events: ColonyEventView[] = [
      {
        id: `${colonyHash}-colony`,
        at: colonyMetric?.receiptAt ?? `Block ${colonyBlock}`,
        title: "Colony created on Monad",
        detail: colonyMetric
          ? `Wallet broadcast at ${colonyMetric.sentAt}. Receipt arrived at ${colonyMetric.receiptAt}.`
          : "Loaded from historical ColonyCreated evidence.",
        tone: "success",
        transactionHash: colonyHash,
        blockNumber: colonyBlock,
        gasLimit: colonyMetric?.gasLimit,
        inclusionLatencyMs: colonyMetric?.inclusionLatencyMs,
      },
    ];
    for (const log of taskLogs) {
      if (!log.transactionHash || !log.args.taskId) continue;
      events.push({
        id: `${log.transactionHash}-${log.eventName}-${log.args.taskId}`,
        at: `Block ${log.blockNumber}`,
        title: log.eventName.replace(/([A-Z])/g, " $1").trim(),
        detail: `Task ${log.args.taskId.slice(0, 10)}... emitted ${log.eventName}.`,
        tone:
          log.eventName === "TaskRejected" || log.eventName === "TaskCancelled"
            ? "danger"
            : log.eventName === "RewardCredited" || log.eventName === "ResultVerified"
              ? "success"
              : "neutral",
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
      });
    }
    return events.sort((a, b) => {
      const aBlock = a.blockNumber ?? 0n;
      const bBlock = b.blockNumber ?? 0n;
      return aBlock === bBlock ? 0 : aBlock > bBlock ? -1 : 1;
    });
  }

  private setError(message: string): void {
    this.snapshot = {
      ...emptyLiveSnapshot(readContractAddress()),
      events: [
        {
          id: "live-error",
          at: "Live RPC error",
          title: "Live Mode could not load",
          detail: message,
          tone: "danger",
        },
      ],
    };
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}
