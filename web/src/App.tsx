import {
  Pulse,
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
  LockKey,
  Play,
  ShieldCheck,
  Wallet,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";

import "./App.css";
import { createColonyDataSource } from "./data/createDataSource";
import type {
  AgentView,
  ColonyEventView,
  LaneOutcome,
  TaskView,
} from "./domain";
import { monadTestnet } from "./lib/web3";

const defaultGoal = "Restore one damaged family photograph and recover its story.";

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

  const isLive = snapshot.mode === "live";
  const wrongNetwork = isLive && isConnected && chainId !== monadTestnet.id;
  const settledCount = snapshot.tasks.filter((task) => task.status === "settled").length;

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
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="AntForge home">
          <span className="brand-mark"><BugBeetle weight="fill" /></span>
          <span>AntForge</span>
          <span className="brand-version">on Monad</span>
        </a>

        <div className="topbar-actions">
          <StatusBadge tone={isLive ? "green" : "blue"}>
            <span className="status-dot" />
            {isLive ? "Live settlement" : "Mock settlement"}
          </StatusBadge>
          <StatusBadge tone="neutral">Agent execution · Mock</StatusBadge>
          {isConnected ? (
            <button className="wallet-button" type="button" onClick={() => disconnect()}>
              <Wallet weight="bold" /> {shorten(address)}
            </button>
          ) : (
            <button
              className="wallet-button"
              type="button"
              disabled={isConnecting || connectors.length === 0}
              onClick={() => connectors[0] && connect({ connector: connectors[0] })}
            >
              {isConnecting ? <CircleNotch className="spin" /> : <Wallet weight="bold" />}
              Connect wallet
            </button>
          )}
        </div>
      </header>

      <main id="top">
        <section className="hero-section reveal">
          <div className="hero-copy">
            <div className="eyebrow"><Pulse weight="bold" /> Monad-native agent coordination</div>
            <h1>Release a goal.<br /><em>Let the colony settle it.</em></h1>
            <p className="hero-lede">
              Queen decomposes one goal into independent work. Worker Agents claim in parallel,
              Guard validates the result, and Monad records every contribution and reward.
            </p>

            <div className="composer" data-running={snapshot.isRunning}>
              <div className="composer-label">
                <CrownSimple weight="fill" /> Queen goal
                <span>{goal.length}/180</span>
              </div>
              <textarea
                aria-label="Goal for the Agent colony"
                maxLength={180}
                rows={3}
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
              />
              <div className="composer-footer">
                <div className="task-preview" aria-label="Queen task preview">
                  <span>Repair</span><span>Color</span><span>Story</span>
                </div>
                <button
                  className="primary-button"
                  type="button"
                  disabled={snapshot.isRunning}
                  onClick={() => void releaseSwarm()}
                >
                  {snapshot.isRunning ? <CircleNotch className="spin" /> : <Play weight="fill" />}
                  {snapshot.isRunning ? "Colony working" : isLive ? "Create live colony" : "Release the swarm"}
                </button>
              </div>
            </div>
            {actionError && <div className="inline-alert" role="alert"><WarningCircle weight="fill" />{actionError}</div>}
            {wrongNetwork && (
              <div className="inline-alert" role="status">
                <WarningCircle weight="fill" />Switch wallet to Monad Testnet before settlement.
              </div>
            )}
          </div>

          <aside className="pulse-card" aria-label="Colony status summary">
            <div className="window-bar"><span /><span /><span /><strong>COLONY PULSE</strong></div>
            <div className="pulse-visual">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="queen-node"><CrownSimple weight="fill" /><span>Queen</span></div>
              {snapshot.agents.filter((agent) => agent.role === "worker").map((agent, index) => (
                <div className={`worker-node worker-${index + 1}`} key={agent.id}>
                  <BugBeetle weight="fill" /><span>{agent.skills[0]}</span>
                </div>
              ))}
            </div>
            <div className="pulse-stats">
              <Metric value={`${settledCount}/${snapshot.tasks.length}`} label="tasks settled" />
              <Metric value={`${snapshot.totalBudgetMon} MON`} label="escrow budget" />
              <Metric value={snapshot.runnerStatus} label="runner status" />
            </div>
          </aside>
        </section>

        <section className="proof-strip reveal" aria-label="Runtime proof summary">
          <ProofItem icon={<Cube weight="fill" />} label="Network" value={snapshot.networkName} />
          <ProofItem icon={<LockKey weight="fill" />} label="Contract" value={snapshot.contractAddress ? shorten(snapshot.contractAddress, 6) : "Not deployed"} />
          <ProofItem icon={<Pulse weight="fill" />} label="Pheromone" value="TaskCreated event" />
          <ProofItem icon={<ShieldCheck weight="fill" />} label="Settlement" value="Pull payment" />
        </section>

        <section className="workspace-section reveal">
          <div className="section-heading">
            <div><span className="section-index">01</span><h2>Colony workspace</h2></div>
            <p>Each task owns an isolated state slot. Different wallets can work without sharing a global task counter.</p>
          </div>

          <div className="workspace-grid">
            <div className="map-card surface-card">
              <div className="card-heading">
                <div><span className="card-kicker">Live topology</span><h3>Agent map</h3></div>
                <StatusBadge tone={snapshot.runnerStatus === "offline" ? "yellow" : "green"}>{snapshot.runnerStatus}</StatusBadge>
              </div>
              <div className="agent-list">
                {snapshot.agents.map((agent) => <AgentRow agent={agent} key={agent.id} />)}
              </div>
            </div>

            <div className="tasks-panel">
              {snapshot.tasks.map((task, index) => (
                <TaskCard
                  explorerUrl={snapshot.explorerUrl}
                  index={index}
                  key={task.id}
                  task={task}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="lanes-section reveal">
          <div className="section-heading">
            <div><span className="section-index">02</span><h2>Monad proof lanes</h2></div>
            <p>Client concurrency is shown separately from chain-enforced conflict and skill constraints.</p>
          </div>
          <div className="lane-grid">
            <LaneCard number="A" title="Swarm lane" subtitle="Different wallets · different tasks" outcome={snapshot.swarmLane} icon={<Pulse weight="fill" />} />
            <LaneCard number="B" title="Skill Guard" subtitle="Rogue Ant · wrong skill" outcome={snapshot.skillGuardLane} icon={<ShieldCheck weight="fill" />} />
            <LaneCard number="C" title="Conflict lane" subtitle="Two wallets · one task" outcome={snapshot.conflictLane} icon={<LockKey weight="fill" />} />
          </div>
        </section>

        <section className="evidence-section reveal">
          <div className="section-heading">
            <div><span className="section-index">03</span><h2>Event evidence</h2></div>
            <div className="evidence-actions">
              {snapshot.contractAddress && (
                <button className="text-button" type="button" onClick={() => void copyContract()}>
                  {copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy contract"}
                </button>
              )}
              <button className="text-button" type="button" onClick={() => void dataSource.refresh()}>
                <ArrowClockwise />Refresh
              </button>
              {snapshot.mode === "mock" && (
                <button className="text-button" type="button" onClick={() => dataSource.reset()}>
                  <X />Reset demo
                </button>
              )}
            </div>
          </div>
          <div className="evidence-card surface-card">
            <div className="evidence-header">
              <span>EVENT</span><span>DETAIL</span><span>CHAIN PROOF</span>
            </div>
            <div className="event-list" aria-live="polite">
              {snapshot.events.map((event) => (
                <EventRow event={event} explorerUrl={snapshot.explorerUrl} key={event.id} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="brand"><span className="brand-mark"><BugBeetle weight="fill" /></span><span>AntForge</span></div>
        <p>Agent micro-task coordination and native MON settlement.</p>
        <a href="https://github.com/NeoWeb3Nova/monad-agent-ant-workshop" target="_blank" rel="noreferrer">
          <GithubLogo weight="fill" /> Source <ArrowSquareOut />
        </a>
      </footer>
    </div>
  );
}

function StatusBadge({ children, tone }: { children: React.ReactNode; tone: "green" | "blue" | "yellow" | "neutral" }) {
  return <span className={`status-badge tone-${tone}`}>{children}</span>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><strong>{value}</strong><span>{label}</span></div>;
}

function ProofItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="proof-item"><span className="proof-icon">{icon}</span><span><small>{label}</small><strong>{value}</strong></span></div>;
}

function AgentRow({ agent }: { agent: AgentView }) {
  const roleIcon = agent.role === "queen" ? <CrownSimple weight="fill" /> : agent.role === "guard" ? <ShieldCheck weight="fill" /> : agent.role === "rogue" ? <WarningCircle weight="fill" /> : <BugBeetle weight="fill" />;
  return (
    <div className={`agent-row role-${agent.role}`}>
      <span className="agent-avatar">{roleIcon}</span>
      <span className="agent-copy"><strong>{agent.name}</strong><small>{agent.walletAddress ? shorten(agent.walletAddress) : agent.walletLabel}</small></span>
      <span className="skill-tag">{agent.skills[0] || agent.role}</span>
    </div>
  );
}

function TaskCard({ task, index, explorerUrl }: { task: TaskView; index: number; explorerUrl?: string }) {
  const statusIcon = task.status === "settled" ? <CheckCircle weight="fill" /> : task.status === "rejected" || task.status === "cancelled" ? <X weight="bold" /> : task.status === "open" ? <Clock /> : <CircleNotch className={task.status !== "submitted" ? "spin" : ""} />;
  return (
    <article className="task-card" style={{ "--delay": `${index * 80}ms` } as React.CSSProperties}>
      <div className="task-topline"><span className={`task-status status-${task.status}`}>{statusIcon}{task.status}</span><span className="task-number">0{index + 1}</span></div>
      <div className="task-icon"><BugBeetle weight="fill" /></div>
      <h3>{task.title}</h3>
      <p>Skill requirement <strong>{task.skill}</strong></p>
      {task.outputSummary && <p className="output-summary">{task.outputSummary}</p>}
      <div className="task-meta"><span><small>Reward</small>{task.rewardMon} MON</span><span><small>Worker</small>{task.workerId || "Unclaimed"}</span></div>
      {task.transactionHash ? (
        <a className="tx-link" href={`${explorerUrl}/tx/${task.transactionHash}`} target="_blank" rel="noreferrer">
          {shorten(task.transactionHash, 6)} <ArrowSquareOut />
        </a>
      ) : <span className="mock-proof">{task.status === "open" ? "Awaiting action" : "Simulation only"}</span>}
    </article>
  );
}

function LaneCard({ number, title, subtitle, outcome, icon }: { number: string; title: string; subtitle: string; outcome: LaneOutcome; icon: React.ReactNode }) {
  return (
    <article className={`lane-card lane-${outcome.state}`}>
      <div className="lane-number">{number}</div><span className="lane-icon">{icon}</span>
      <h3>{title}</h3><p>{subtitle}</p>
      <div className="lane-outcome">{outcome.state === "passed" ? <CheckCircle weight="fill" /> : outcome.state === "failed" ? <WarningCircle weight="fill" /> : outcome.state === "running" ? <CircleNotch className="spin" /> : <Clock />}
        <span><strong>{outcome.state}</strong><small>{outcome.summary}</small></span>
      </div>
    </article>
  );
}

function EventRow({ event, explorerUrl }: { event: ColonyEventView; explorerUrl?: string }) {
  return (
    <div className="event-row">
      <div className="event-title"><span className={`event-dot tone-${event.tone}`} /><span><strong>{event.title}</strong><small>{formatEventTime(event.at)}</small></span></div>
      <p>{event.detail}</p>
      <div className="chain-proof">
        {event.transactionHash ? <>
          <a href={`${explorerUrl}/tx/${event.transactionHash}`} target="_blank" rel="noreferrer">{shorten(event.transactionHash, 6)} <ArrowSquareOut /></a>
          <small>{event.blockNumber !== undefined ? `Block ${event.blockNumber}` : "Mined"}{event.gasLimit !== undefined ? ` · Gas ${event.gasLimit}` : ""}</small>
        </> : <span>{event.title.toLowerCase().includes("error") ? "Live RPC error" : "No chain transaction"}</span>}
      </div>
    </div>
  );
}

function shorten(value?: string, size = 4) {
  if (!value) return "Unknown";
  return `${value.slice(0, size + 2)}…${value.slice(-size)}`;
}

function formatEventTime(value: string) {
  if (value.startsWith("Block")) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default App;
