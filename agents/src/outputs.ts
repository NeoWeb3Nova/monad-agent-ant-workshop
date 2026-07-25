import { keccak256, stringToHex, type Hex } from "viem";

import { executionMode } from "./config.js";
import type { WorkerProfile } from "./workers.js";

export interface AgentOutput {
  outputHash: Hex;
  outputUri: string;
  summary: string;
}

export function generateOutput(worker: WorkerProfile): AgentOutput {
  if (executionMode !== "mock") {
    throw new Error("Only the deterministic mock adapter is implemented in the MVP");
  }

  const summary = deterministicSummary(worker.role);
  const outputUri = `mock://antforge/v1/${worker.role}`;
  const payload = JSON.stringify({
    version: 1,
    mode: "deterministic-mock",
    role: worker.role,
    outputUri,
    summary,
  });

  return {
    outputHash: keccak256(stringToHex(payload)),
    outputUri,
    summary,
  };
}

export function validateOutput(outputHash: Hex, worker: WorkerProfile): boolean {
  return generateOutput(worker).outputHash.toLowerCase() === outputHash.toLowerCase();
}

function deterministicSummary(role: WorkerProfile["role"]): string {
  switch (role) {
    case "repair":
      return "Restored scratches and balanced damaged regions.";
    case "color":
      return "Applied period-aware color tones to the restored image.";
    case "story":
      return "Generated a concise archival story from the image context.";
  }
}
