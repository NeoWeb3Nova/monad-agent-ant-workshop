import type { AgentView, ColonySnapshot, TaskView } from "../domain";

export const mockAgents: AgentView[] = [
  {
    id: "queen",
    name: "Dune Queen",
    role: "queen",
    skills: [],
    walletLabel: "Connected demo wallet",
  },
  {
    id: "repair-ant",
    name: "Repair Ant",
    role: "worker",
    skills: ["repair"],
    walletLabel: "Mock worker wallet A",
  },
  {
    id: "color-ant",
    name: "Color Ant",
    role: "worker",
    skills: ["color"],
    walletLabel: "Mock worker wallet B",
  },
  {
    id: "story-ant",
    name: "Story Ant",
    role: "worker",
    skills: ["story"],
    walletLabel: "Mock worker wallet C",
  },
  {
    id: "guard-ant",
    name: "Guard Ant",
    role: "guard",
    skills: ["verify"],
    walletLabel: "Mock guard wallet",
  },
  {
    id: "rogue-ant",
    name: "Rogue Ant",
    role: "rogue",
    skills: ["rogue"],
    walletLabel: "Mock rogue wallet",
  },
];

export const createMockTasks = (): TaskView[] => [
  {
    id: "repair-task",
    title: "Restore damaged portrait",
    skill: "repair",
    rewardMon: "0.001",
    status: "open",
  },
  {
    id: "color-task",
    title: "Rebuild period color palette",
    skill: "color",
    rewardMon: "0.001",
    status: "open",
  },
  {
    id: "story-task",
    title: "Write the recovered memory",
    skill: "story",
    rewardMon: "0.001",
    status: "open",
  },
];

export const createMockSnapshot = (): ColonySnapshot => ({
  mode: "mock",
  networkName: "Local deterministic simulation",
  runnerStatus: "simulated",
  goal: "Restore one damaged family photograph and recover its story.",
  colonyId: "mock-colony",
  totalBudgetMon: "0.003",
  agents: mockAgents.map((agent) => ({ ...agent, skills: [...agent.skills] })),
  tasks: createMockTasks(),
  events: [
    {
      id: "mock-ready",
      at: new Date().toISOString(),
      title: "Demo colony prepared",
      detail: "No blockchain transaction has been sent. Release the swarm to play the deterministic flow.",
      tone: "neutral",
    },
  ],
  swarmLane: { state: "idle", summary: "Three independent tasks are ready." },
  skillGuardLane: { state: "idle", summary: "Rogue Ant has not attempted a claim." },
  conflictLane: { state: "idle", summary: "Conflict claim has not started." },
  isRunning: false,
});
