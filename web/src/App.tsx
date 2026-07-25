import {
  ArrowClockwise,
  ArrowSquareOut,
  BugBeetle,
  Check,
  CheckCircle,
  CircleNotch,
  Clock,
  Copy,
  CrownSimple,
  Cube,
  GithubLogo,
  ImageSquare,
  LockKey,
  PaintBrush,
  Pulse,
  ShieldCheck,
  Sparkle,
  TextT,
  Wallet,
  WarningCircle,
  X,
  type Icon,
} from "@phosphor-icons/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";

import "./App.css";
import { createColonyDataSource } from "./data/createDataSource";
import type {
  ColonyEventView,
  ColonySnapshot,
  LaneOutcome,
  Skill,
  TaskStatus,
  TaskView,
} from "./domain";
import { monadTestnet } from "./lib/web3";

const defaultGoal = "Restore one damaged family photograph and recover its story.";

const chamberCopy: Record<Exclude<Skill, "verify" | "rogue">, { title: string; subtitle: string }> = {
  repair: { title: "Repair Chamber", subtitle: "照片修复工坊" },
  color: { title: "Color Chamber", subtitle: "图像上色工坊" },
  story: { title: "Story Chamber", subtitle: "记忆叙事工坊" },
};

interface WorkflowStepDefinition {
  number: string;
  title: string;
  copy: string;
  icon: Icon;
}

const workflowSteps: WorkflowStepDefinition[] = [
  { number: "1", title: "Goal", copy: "Queen plans mission", icon: CrownSimple },
  { number: "2", title: "Split tasks", copy: "Three isolated taskIds", icon: Pulse },
  { number: "3", title: "Ant agents", copy: "Parallel wallet execution", icon: BugBeetle },
  { number: "4", title: "Verify", copy: "Guard validates outputs", icon: ShieldCheck },
  { number: "5", title: "Settle", copy: "Rewards credited in MON", icon: Cube },
];

function App() {
  const dataSource = useMemo(() => createColonyDataSource(), []);
  const subscribe = useCallback(
    (listener: () => void) => dataSource.subscribe(listener),
    [dataSource],
  );
  const getSnapshot = useCallback(() => dataSource.getSnapshot(), [dataSource]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const [goal, setGoal] = useState(snapshot.goal || defaultGoal);
  const [actionError, setActionError] = useState("");
  const [copied, setCopied] = useState(false);

  const { address, chainId, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();

  useEffect(() => {
    void dataSource.refresh();
  }, [dataSource]);

  useEffect(() => {
    if (!snapshot.isRunning && snapshot.goal) setGoal(snapshot.goal);
  }, [snapshot.goal, snapshot.isRunning]);

  const isLive = snapshot.mode === "live";
  const wrongNetwork = isLive && isConnected && chainId !== monadTestnet.id;

  async function releaseSwarm() {
    setActionError("");
    try {
      if (!goal.trim()) throw new Error("Describe a goal before releasing the swarm.");
      if (isLive && !isConnected) throw new Error("Connect an injected wallet for Live settlement.");
      if (wrongNetwork) await switchChainAsync({ chainId: monadTestnet.id });
      await dataSource.releaseSwarm(goal.trim());
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    }
  }

  async function copyContract() {
    if (!snapshot.contractAddress) return;
    await navigator.clipboard.writeText(snapshot.contractAddress);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_500);
  }

  return (
    <div className="antforge-app">
      <AppHeader
        address={address}
        copied={copied}
        isConnected={isConnected}
        isConnecting={isConnecting}
        isLive={isLive}
        onConnect={() => connectors[0] && connect({ connector: connectors[0] })}
        onCopyContract={() => void copyContract()}
        onDisconnect={() => disconnect()}
        snapshot={snapshot}
      />

      <main className="dashboard-grid">
        <MissionPanel
          actionError={actionError}
          goal={goal}
          isLive={isLive}
          onGoalChange={setGoal}
          onRelease={() => void releaseSwarm()}
          onReset={() => dataSource.reset()}
          running={snapshot.isRunning}
          snapshot={snapshot}
          wrongNetwork={wrongNetwork}
        />

        <ColonyStage snapshot={snapshot} />

        <EvidenceSidebar
          onRefresh={() => void dataSource.refresh()}
          snapshot={snapshot}
        />

        <WorkflowConsole snapshot={snapshot} />
      </main>

      <a
        className="source-link"
        href="https://github.com/NeoWeb3Nova/monad-agent-ant-workshop"
        target="_blank"
        rel="noreferrer"
      >
        <GithubLogo weight="fill" /> Source <ArrowSquareOut />
      </a>
    </div>
  );
}

function AppHeader({
  address,
  copied,
  isConnected,
  isConnecting,
  isLive,
  onConnect,
  onCopyContract,
  onDisconnect,
  snapshot,
}: {
  address?: `0x${string}`;
  copied: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  isLive: boolean;
  onConnect: () => void;
  onCopyContract: () => void;
  onDisconnect: () => void;
  snapshot: ColonySnapshot;
}) {
  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="AntForge home">
        <span className="brand-mark"><BugBeetle weight="fill" /></span>
        <span className="brand-copy">
          <strong>AntForge</strong>
          <small>Agent 蚂蚁工坊</small>
        </span>
        <span className="monad-lockup"><Cube weight="fill" /> Built on Monad</span>
      </a>

      <div className="topbar-actions">
        <StatusBadge tone={isLive ? "green" : "purple"}>
          <span className="status-dot" />
          {isLive ? "Live settlement" : "Demo mode"}
        </StatusBadge>
        <StatusBadge tone={snapshot.runnerStatus === "offline" ? "yellow" : "neutral"}>
          Runner · {snapshot.runnerStatus}
        </StatusBadge>
        <button className="contract-chip" type="button" onClick={onCopyContract} disabled={!snapshot.contractAddress}>
          <LockKey weight="bold" />
          {snapshot.contractAddress ? shorten(snapshot.contractAddress, 5) : "Contract pending"}
          {copied ? <Check /> : <Copy />}
        </button>
        {isConnected ? (
          <button className="wallet-button" type="button" onClick={onDisconnect}>
            <Wallet weight="bold" /> {shorten(address)}
          </button>
        ) : (
          <button className="wallet-button" type="button" disabled={isConnecting} onClick={onConnect}>
            {isConnecting ? <CircleNotch className="spin" /> : <Wallet weight="bold" />}
            Connect wallet
          </button>
        )}
      </div>
    </header>
  );
}

function MissionPanel({
  actionError,
  goal,
  isLive,
  onGoalChange,
  onRelease,
  onReset,
  running,
  snapshot,
  wrongNetwork,
}: {
  actionError: string;
  goal: string;
  isLive: boolean;
  onGoalChange: (goal: string) => void;
  onRelease: () => void;
  onReset: () => void;
  running: boolean;
  snapshot: ColonySnapshot;
  wrongNetwork: boolean;
}) {
  return (
    <aside className="panel mission-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-kicker"><Sparkle weight="fill" /> Create mission</span>
          <h2>Release one goal</h2>
        </div>
        <StatusBadge tone={isLive ? "green" : "purple"}>{isLive ? "Live" : "Mock"}</StatusBadge>
      </div>

      <div className="demo-photo">
        <div className="photo-before"><ImageSquare weight="fill" /></div>
        <div className="photo-arrow">→</div>
        <div className="photo-after"><Sparkle weight="fill" /></div>
        <span>Deterministic photo restoration demo</span>
      </div>

      <label className="field-label" htmlFor="queen-goal">
        Mission description <span>{goal.length}/180</span>
      </label>
      <textarea
        id="queen-goal"
        className="goal-input"
        maxLength={180}
        rows={6}
        value={goal}
        onChange={(event) => onGoalChange(event.target.value)}
      />

      <div className="skill-grid" aria-label="Queen task preview">
        <SkillChip icon={<ImageSquare weight="fill" />} label="Repair" />
        <SkillChip icon={<PaintBrush weight="fill" />} label="Color" />
        <SkillChip icon={<TextT weight="bold" />} label="Story" />
        <SkillChip icon={<ShieldCheck weight="fill" />} label="Verify" />
      </div>

      <div className="budget-card">
        <div>
          <small>Colony escrow</small>
          <strong>{snapshot.totalBudgetMon} MON</strong>
        </div>
        <div className="budget-breakdown">
          <span>3 independent tasks</span>
          <span>Pull-payment settlement</span>
        </div>
      </div>

      {(actionError || wrongNetwork) && (
        <div className="inline-alert" role="alert">
          <WarningCircle weight="fill" />
          {actionError || "Switch wallet to Monad Testnet before settlement."}
        </div>
      )}

      <button className="release-button" type="button" disabled={running} onClick={onRelease}>
        {running ? <CircleNotch className="spin" /> : <BugBeetle weight="fill" />}
        <span>
          <strong>{running ? "Colony working" : isLive ? "Create live colony" : "Release the swarm"}</strong>
          <small>{running ? "Agents are following pheromone events" : "Unleash autonomous agents"}</small>
        </span>
      </button>

      {!isLive && (
        <button className="reset-button" type="button" disabled={running} onClick={onReset}>
          <X /> Reset demo
        </button>
      )}

      <div className="efficiency-card">
        <span>Swarm progress</span>
        <strong>{taskProgress(snapshot.tasks)}%</strong>
        <div className="progress-track"><span style={{ width: `${taskProgress(snapshot.tasks)}%` }} /></div>
      </div>
    </aside>
  );
}

function ColonyStage({ snapshot }: { snapshot: ColonySnapshot }) {
  const repair = snapshot.tasks.find((task) => task.skill === "repair");
  const color = snapshot.tasks.find((task) => task.skill === "color");
  const story = snapshot.tasks.find((task) => task.skill === "story");
  const settled = snapshot.tasks.filter((task) => task.status === "settled").length;
  const submitted = snapshot.tasks.filter((task) => task.status === "submitted").length;

  return (
    <section className="colony-stage" id="top">
      <div className="sand-layer sand-one" />
      <div className="sand-layer sand-two" />
      <div className="colony-vignette" />

      <PheromoneNetwork tasks={snapshot.tasks} rogue={snapshot.skillGuardLane} />

      <div className="queen-core chamber-position queen-position">
        <div className="queen-crystal"><CrownSimple weight="fill" /></div>
        <strong>Queen Core</strong>
        <span>蚁后中枢</span>
        <small><span className="online-dot" /> {snapshot.tasks.length > 0 ? "Goal ingested" : "Awaiting mission"}</small>
      </div>

      <TaskChamber className="repair-position" skill="repair" task={repair} />
      <TaskChamber className="color-position" skill="color" task={color} />
      <TaskChamber className="story-position" skill="story" task={story} />

      <div className="guard-chamber chamber-position guard-position">
        <div className="chamber-title">
          <ShieldCheck weight="fill" />
          <span><strong>Guard Chamber</strong><small>守卫验证中心</small></span>
          <TaskStatusPill status={submitted > 0 ? "submitted" : settled > 0 ? "settled" : "open"} />
        </div>
        <div className="guard-shield"><ShieldCheck weight="duotone" /></div>
        <div className="verification-list">
          <span><Check /> Task relation</span>
          <span><Check /> Output hash</span>
          <span><Check /> Skill guard</span>
        </div>
      </div>

      <div className="treasury-chamber chamber-position treasury-position">
        <div className="chamber-title">
          <Cube weight="fill" />
          <span><strong>Treasury Chamber</strong><small>链上金库</small></span>
        </div>
        <div className="treasury-balance">
          <small>Escrow budget</small>
          <strong>{snapshot.totalBudgetMon} MON</strong>
        </div>
        <div className="ledger-row"><span>Reward credited</span><strong>{settled}/{snapshot.tasks.length || 3}</strong></div>
        <div className="ledger-row"><span>Settlement model</span><strong>Pull payment</strong></div>
      </div>

      <div className="rogue-gate chamber-position rogue-position" data-state={snapshot.skillGuardLane.state}>
        <WarningCircle weight="fill" />
        <span><strong>Rogue Gate</strong><small>{snapshot.skillGuardLane.summary}</small></span>
      </div>

      <div className="colony-caption">
        <span><Pulse weight="fill" /> Live colony topology</span>
        <strong>{snapshot.colonyId === "mock-colony" ? "Mock Colony" : shorten(snapshot.colonyId, 8)}</strong>
      </div>
    </section>
  );
}

function TaskChamber({
  className,
  skill,
  task,
}: {
  className: string;
  skill: Exclude<Skill, "verify" | "rogue">;
  task?: TaskView;
}) {
  const copy = chamberCopy[skill];
  const IconComponent = skill === "repair" ? ImageSquare : skill === "color" ? PaintBrush : TextT;

  return (
    <article className={`task-chamber chamber-position ${className}`} data-status={task?.status ?? "open"}>
      <div className="chamber-title">
        <IconComponent weight="fill" />
        <span><strong>{copy.title}</strong><small>{copy.subtitle}</small></span>
        <TaskStatusPill status={task?.status ?? "open"} />
      </div>

      <div className={`artifact-preview artifact-${skill}`}>
        <IconComponent weight="duotone" />
        <span>{task?.outputSummary ?? task?.title ?? "Waiting for Queen"}</span>
      </div>

      <div className="chamber-meta">
        <span><small>Reward</small><strong>{task?.rewardMon ?? "0.001"} MON</strong></span>
        <span><small>Worker</small><strong>{task?.workerId ? shorten(task.workerId) : "Unclaimed"}</strong></span>
      </div>

      {task?.transactionHash ? (
        <a className="chamber-proof" href="#evidence">
          {shorten(task.transactionHash, 6)} <ArrowSquareOut />
        </a>
      ) : (
        <span className="chamber-proof muted">{task?.status === "open" ? "Awaiting claim" : "Simulation only"}</span>
      )}
    </article>
  );
}

function PheromoneNetwork({ tasks, rogue }: { tasks: TaskView[]; rogue: LaneOutcome }) {
  const routeActive = (skill: Exclude<Skill, "verify" | "rogue">) => {
    const task = tasks.find((item) => item.skill === skill);
    return Boolean(task && task.status !== "open");
  };
  const guardActive = tasks.some((task) => task.status === "submitted" || task.status === "settled");
  const treasuryActive = tasks.some((task) => task.status === "settled");

  const routes = [
    { id: "queen-repair", path: "M500 118 C420 150 340 175 224 220", active: routeActive("repair"), error: false },
    { id: "queen-color", path: "M500 118 C585 148 655 175 780 220", active: routeActive("color"), error: false },
    { id: "queen-story", path: "M500 118 C395 245 300 350 220 475", active: routeActive("story"), error: false },
    { id: "repair-guard", path: "M224 220 C310 315 390 365 500 405", active: guardActive, error: false },
    { id: "color-guard", path: "M780 220 C690 310 610 365 500 405", active: guardActive, error: false },
    { id: "story-guard", path: "M220 475 C325 470 410 445 500 405", active: guardActive, error: false },
    { id: "guard-treasury", path: "M500 405 C610 465 690 485 790 495", active: treasuryActive, error: false },
    { id: "rogue-repair", path: "M500 655 C430 535 320 350 224 220", active: rogue.state !== "idle", error: rogue.state === "passed" },
  ];

  return (
    <svg className="pheromone-network" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id="purple-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="pheromone-gradient">
          <stop offset="0%" stopColor="#836ef9" />
          <stop offset="55%" stopColor="#d8b4fe" />
          <stop offset="100%" stopColor="#63e6ff" />
        </linearGradient>
      </defs>

      {routes.map((route) => (
        <g key={route.id}>
          <path d={route.path} className="pheromone-track" />
          <path
            d={route.path}
            className="pheromone-pulse"
            data-active={route.active}
            data-error={route.error}
          />
          {route.active && (
            <g className="moving-ant">
              <circle r="8" className="ant-glow" />
              <BugBeetleSvg />
              <animateMotion dur={route.error ? "2.2s" : "4.2s"} repeatCount="indefinite" rotate="auto" path={route.path} />
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

function BugBeetleSvg() {
  return (
    <g transform="translate(-8 -8) scale(.5)" className="ant-glyph">
      <ellipse cx="16" cy="10" rx="5" ry="6" />
      <ellipse cx="16" cy="21" rx="7" ry="8" />
      <path d="M12 5 8 1M20 5l4-4M9 15 2 11M23 15l7-4M9 23l-7 5M23 23l7 5" />
    </g>
  );
}

function EvidenceSidebar({
  onRefresh,
  snapshot,
}: {
  onRefresh: () => void;
  snapshot: ColonySnapshot;
}) {
  const settled = snapshot.tasks.filter((task) => task.status === "settled").length;
  const latestBlock = snapshot.events.reduce<bigint | undefined>((latest, event) => {
    if (event.blockNumber === undefined) return latest;
    return latest === undefined || event.blockNumber > latest ? event.blockNumber : latest;
  }, undefined);
  const latency = snapshot.events.find((event) => event.inclusionLatencyMs !== undefined)?.inclusionLatencyMs;

  return (
    <aside className="panel evidence-sidebar" id="evidence">
      <div className="panel-heading compact-heading">
        <div><span className="panel-kicker"><Pulse weight="fill" /> Live system status</span><h2>Chain evidence</h2></div>
        <button className="icon-button" type="button" onClick={onRefresh} aria-label="Refresh data"><ArrowClockwise /></button>
      </div>

      <div className="metric-stack">
        <MetricCard icon={<Cube weight="fill" />} label="Network" value={snapshot.networkName} tone="purple" />
        <MetricCard icon={<CheckCircle weight="fill" />} label="Tasks settled" value={`${settled}/${snapshot.tasks.length || 3}`} tone="green" />
        <MetricCard icon={<LockKey weight="fill" />} label="Escrow budget" value={`${snapshot.totalBudgetMon} MON`} tone="gold" />
        <MetricCard icon={<Clock weight="fill" />} label="Last inclusion" value={latency !== undefined ? `${latency} ms` : "Waiting"} tone="blue" />
        <MetricCard icon={<Pulse weight="fill" />} label="Latest block" value={latestBlock?.toString() ?? "—"} tone="neutral" />
      </div>

      <div className="event-section">
        <div className="event-section-heading"><strong>Real-time pheromones</strong><span>{snapshot.events.length} events</span></div>
        <div className="event-feed" aria-live="polite">
          {snapshot.events.slice(0, 8).map((event) => (
            <EventRow event={event} explorerUrl={snapshot.explorerUrl} key={event.id} />
          ))}
          {snapshot.events.length === 0 && <div className="empty-events">No events observed yet.</div>}
        </div>
      </div>

      {snapshot.contractAddress && snapshot.explorerUrl && (
        <a className="explorer-button" href={`${snapshot.explorerUrl}/address/${snapshot.contractAddress}`} target="_blank" rel="noreferrer">
          View contract on Explorer <ArrowSquareOut />
        </a>
      )}
    </aside>
  );
}

function WorkflowConsole({ snapshot }: { snapshot: ColonySnapshot }) {
  const progress = workflowProgress(snapshot.tasks);

  return (
    <section className="workflow-console">
      <div className="workflow-steps">
        {workflowSteps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <div className="workflow-step" data-active={progress >= index + 1} key={step.number}>
              <span className="step-icon"><StepIcon weight="fill" /></span>
              <div><strong>{step.number} {step.title}</strong><small>{step.copy}</small></div>
              {index < workflowSteps.length - 1 && <span className="step-arrow">→</span>}
            </div>
          );
        })}
      </div>

      <div className="proof-lanes">
        <MiniLane label="Swarm lane" outcome={snapshot.swarmLane} />
        <MiniLane label="Skill Guard" outcome={snapshot.skillGuardLane} />
        <MiniLane label="Conflict lane" outcome={snapshot.conflictLane} />
      </div>
    </section>
  );
}

function MiniLane({ label, outcome }: { label: string; outcome: LaneOutcome }) {
  return (
    <div className="mini-lane" data-state={outcome.state} title={outcome.summary}>
      {outcome.state === "passed" ? <CheckCircle weight="fill" /> : outcome.state === "running" ? <CircleNotch className="spin" /> : outcome.state === "failed" ? <WarningCircle weight="fill" /> : <Clock />}
      <span><strong>{label}</strong><small>{outcome.state}</small></span>
    </div>
  );
}

function SkillChip({ icon, label }: { icon: ReactNode; label: string }) {
  return <span className="skill-chip">{icon}{label}</span>;
}

function StatusBadge({ children, tone }: { children: ReactNode; tone: "green" | "purple" | "yellow" | "neutral" }) {
  return <span className={`status-badge tone-${tone}`}>{children}</span>;
}

function TaskStatusPill({ status }: { status: TaskStatus }) {
  return <span className={`task-status status-${status}`}>{status}</span>;
}

function MetricCard({ icon, label, tone, value }: { icon: ReactNode; label: string; tone: string; value: string }) {
  return (
    <div className="metric-card">
      <span className={`metric-icon metric-${tone}`}>{icon}</span>
      <span><small>{label}</small><strong>{value}</strong></span>
      <span className="metric-sparkline"><i /><i /><i /><i /><i /></span>
    </div>
  );
}

function EventRow({ event, explorerUrl }: { event: ColonyEventView; explorerUrl?: string }) {
  return (
    <div className="event-row">
      <span className={`event-dot tone-${event.tone}`} />
      <div className="event-copy">
        <strong>{event.title}</strong>
        <small>{formatEventTime(event.at)}</small>
        <p>{event.detail}</p>
        {event.transactionHash && explorerUrl && (
          <a href={`${explorerUrl}/tx/${event.transactionHash}`} target="_blank" rel="noreferrer">
            {shorten(event.transactionHash, 6)} <ArrowSquareOut />
          </a>
        )}
      </div>
    </div>
  );
}

function workflowProgress(tasks: TaskView[]) {
  if (tasks.length === 0) return 1;
  if (tasks.every((task) => task.status === "settled")) return 5;
  if (tasks.some((task) => task.status === "submitted")) return 4;
  if (tasks.some((task) => task.status === "claimed")) return 3;
  return 2;
}

function taskProgress(tasks: TaskView[]) {
  if (tasks.length === 0) return 0;
  const weights: Record<TaskStatus, number> = {
    open: 15,
    claimed: 40,
    submitted: 72,
    settled: 100,
    rejected: 100,
    cancelled: 100,
  };
  return Math.round(tasks.reduce((sum, task) => sum + weights[task.status], 0) / tasks.length);
}

function shorten(value?: string, size = 4) {
  if (!value) return "Unknown";
  return `${value.slice(0, size + 2)}…${value.slice(-size)}`;
}

function formatEventTime(value: string) {
  if (value.startsWith("Block")) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default App;
