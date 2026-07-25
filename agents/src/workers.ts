import type { Address } from "viem";

import { walletFromEnv, type AgentWallet } from "./config.js";

export const SKILLS = {
  imageRepair: 1n << 0n,
  imageColorize: 1n << 1n,
  storyWrite: 1n << 2n,
  verify: 1n << 3n,
  rogue: 1n << 4n,
} as const;

export type WorkerRole = "repair" | "color" | "story";

export interface WorkerProfile {
  role: WorkerRole;
  label: string;
  skill: bigint;
  wallet: AgentWallet;
  address: Address;
}

export interface SwarmWallets {
  requester: AgentWallet;
  workers: readonly WorkerProfile[];
  guard: AgentWallet;
  rogue: AgentWallet;
}

export function loadSwarmWallets(): SwarmWallets {
  const workers: WorkerProfile[] = [
    createWorker("repair", "Repair Ant", SKILLS.imageRepair, "REPAIR_AGENT_PRIVATE_KEY"),
    createWorker("color", "Color Ant", SKILLS.imageColorize, "COLOR_AGENT_PRIVATE_KEY"),
    createWorker("story", "Story Ant", SKILLS.storyWrite, "STORY_AGENT_PRIVATE_KEY"),
  ];

  return {
    requester: walletFromEnv("REQUESTER_PRIVATE_KEY"),
    workers,
    guard: walletFromEnv("GUARD_AGENT_PRIVATE_KEY"),
    rogue: walletFromEnv("ROGUE_AGENT_PRIVATE_KEY"),
  };
}

export function workerForSkill(workers: readonly WorkerProfile[], requiredSkill: bigint): WorkerProfile | undefined {
  return workers.find((worker) => (worker.skill & requiredSkill) !== 0n);
}

function createWorker(
  role: WorkerRole,
  label: string,
  skill: bigint,
  privateKeyEnv: string,
): WorkerProfile {
  const wallet = walletFromEnv(privateKeyEnv);
  return { role, label, skill, wallet, address: wallet.account.address };
}
