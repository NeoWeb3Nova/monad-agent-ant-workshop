export type DataMode = "mock" | "live";
export type RunnerStatus = "online" | "offline" | "unknown" | "simulated";
export type TaskStatus =
  | "open"
  | "claimed"
  | "submitted"
  | "settled"
  | "rejected"
  | "cancelled";

export type AgentRole = "queen" | "worker" | "guard" | "rogue";
export type Skill = "repair" | "color" | "story" | "verify" | "rogue";

export interface AgentView {
  id: string;
  name: string;
  role: AgentRole;
  skills: Skill[];
  walletAddress?: `0x${string}`;
  walletLabel: string;
}

export interface TaskView {
  id: string;
  title: string;
  skill: Skill;
  rewardMon: string;
  status: TaskStatus;
  workerId?: string;
  outputSummary?: string;
  transactionHash?: `0x${string}`;
  blockNumber?: bigint;
  gasLimit?: bigint;
  inclusionLatencyMs?: number;
}

export type EventTone = "neutral" | "success" | "warning" | "danger";

export interface ColonyEventView {
  id: string;
  at: string;
  title: string;
  detail: string;
  tone: EventTone;
  transactionHash?: `0x${string}`;
  blockNumber?: bigint;
  gasLimit?: bigint;
  inclusionLatencyMs?: number;
}

export interface LaneOutcome {
  state: "idle" | "running" | "passed" | "failed";
  summary: string;
}

export interface ColonySnapshot {
  mode: DataMode;
  networkName: string;
  contractAddress?: `0x${string}`;
  explorerUrl?: string;
  runnerStatus: RunnerStatus;
  goal: string;
  colonyId: string;
  totalBudgetMon: string;
  agents: AgentView[];
  tasks: TaskView[];
  events: ColonyEventView[];
  swarmLane: LaneOutcome;
  skillGuardLane: LaneOutcome;
  conflictLane: LaneOutcome;
  isRunning: boolean;
}

export interface ColonyDataSource {
  readonly mode: DataMode;
  getSnapshot(): ColonySnapshot;
  subscribe(listener: () => void): () => void;
  releaseSwarm(goal: string): Promise<void>;
  refresh(): Promise<void>;
  reset(): void;
}
