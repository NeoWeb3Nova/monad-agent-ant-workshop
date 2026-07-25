import type {
  ColonyDataSource,
  ColonyEventView,
  ColonySnapshot,
  TaskStatus,
} from "../domain";
import { createMockSnapshot } from "./mockState";

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const workerByTask: Record<string, string> = {
  "repair-task": "repair-ant",
  "color-task": "color-ant",
  "story-task": "story-ant",
};

const outputByTask: Record<string, string> = {
  "repair-task": "Deterministic repair artifact prepared offchain.",
  "color-task": "Deterministic color study prepared offchain.",
  "story-task": "Deterministic memory narrative prepared offchain.",
};

export class MockColonyDataSource implements ColonyDataSource {
  readonly mode = "mock" as const;
  private snapshot = createMockSnapshot();
  private readonly listeners = new Set<() => void>();

  getSnapshot(): ColonySnapshot {
    return this.snapshot;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async refresh(): Promise<void> {
    this.emit();
  }

  reset(): void {
    if (this.snapshot.isRunning) return;
    this.snapshot = createMockSnapshot();
    this.emit();
  }

  async releaseSwarm(goal: string): Promise<void> {
    if (this.snapshot.isRunning) return;

    this.snapshot = {
      ...createMockSnapshot(),
      goal: goal.trim() || createMockSnapshot().goal,
      isRunning: true,
      swarmLane: { state: "running", summary: "Workers are matching skills." },
      skillGuardLane: { state: "running", summary: "Rogue claim simulation is pending." },
      conflictLane: { state: "running", summary: "Two wallets will contest one task." },
      events: [],
    };
    this.addEvent("Swarm released", "Mock Queen opened three independent tasks.", "neutral");

    await wait(320);
    this.snapshot = {
      ...this.snapshot,
      skillGuardLane: {
        state: "passed",
        summary: "Rogue Ant was blocked by the skill requirement before any mock broadcast.",
      },
    };
    this.addEvent(
      "Skill Guard blocked Rogue Ant",
      "This is a deterministic mock failure. It has no transaction hash or Receipt.",
      "warning",
    );

    await wait(320);
    this.setAllTasks("claimed");
    this.addEvent(
      "Three workers claimed in parallel",
      "Repair, Color, and Story Ant now own separate task slots.",
      "neutral",
    );

    await wait(460);
    this.setAllTasks("submitted");
    this.addEvent(
      "Outputs committed",
      "Each worker produced a deterministic offchain artifact summary.",
      "neutral",
    );

    await wait(420);
    this.snapshot = {
      ...this.snapshot,
      conflictLane: {
        state: "passed",
        summary: "Repair Ant won the contested claim. Backup claimant was rejected.",
      },
    };
    this.addEvent(
      "Conflict resolved deterministically",
      "Only one mock claimant can own the contested task slot.",
      "warning",
    );

    await wait(420);
    this.setAllTasks("settled");
    this.snapshot = {
      ...this.snapshot,
      isRunning: false,
      swarmLane: {
        state: "passed",
        summary: "Three tasks settled and mock rewards were withdrawn.",
      },
    };
    this.addEvent(
      "Guard accepted all outputs",
      "Mock rewards are shown as settled. No MON moved in Demo Mode.",
      "success",
    );
  }

  private setAllTasks(status: TaskStatus): void {
    this.snapshot = {
      ...this.snapshot,
      tasks: this.snapshot.tasks.map((task) => ({
        ...task,
        status,
        workerId: status === "open" ? undefined : workerByTask[task.id],
        outputSummary:
          status === "submitted" || status === "settled"
            ? outputByTask[task.id]
            : undefined,
      })),
    };
    this.emit();
  }

  private addEvent(
    title: string,
    detail: string,
    tone: ColonyEventView["tone"],
  ): void {
    const event: ColonyEventView = {
      id: `mock-${this.snapshot.events.length + 1}`,
      at: new Date().toISOString(),
      title,
      detail,
      tone,
    };
    this.snapshot = { ...this.snapshot, events: [event, ...this.snapshot.events] };
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}
