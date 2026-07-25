import { keccak256, stringToHex, type Hex } from "viem";

import { executionMode } from "./config.js";
import type { WorkerProfile } from "./workers.js";

export interface AgentOutput {
  outputHash: Hex;
  outputUri: string;
  summary: string;
}

export function generateOutput(taskId: Hex, worker: WorkerProfile): AgentOutput {
  if (executionMode !== "mock") {
    throw new Error("API execution adapter is not implemented in the MVP; use AGENT_EXECUTION_MODE=mock");
  }

  const summary = deterministicSummary(worker.role);
  const payload = JSON.stringify({
    version: 1,
    mode: "deterministic-mock",
    taskId,
    role: worker.role,
    worker: worker.address,
    summary,
  });

  return {
    outputHash: keccak256(stringToHex(payload)),
    outputUri: `mock://antforge/${taskId.slice(2)}/${worker.role}`,
    summary,
  };
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
