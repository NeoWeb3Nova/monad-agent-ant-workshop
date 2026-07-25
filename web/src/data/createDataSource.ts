import type { ColonyDataSource, DataMode } from "../domain";
import { MockColonyDataSource } from "./MockColonyDataSource";

export function readDataMode(): DataMode {
  return import.meta.env.VITE_DATA_MODE === "live" ? "live" : "mock";
}

export function createMockDataSource(): ColonyDataSource {
  return new MockColonyDataSource();
}
