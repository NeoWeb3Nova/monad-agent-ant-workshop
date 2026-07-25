import type { ColonyDataSource, DataMode } from "../domain";
import { MockColonyDataSource } from "./MockColonyDataSource";
import { MonadColonyDataSource } from "./MonadColonyDataSource";

export function readDataMode(): DataMode {
  return import.meta.env.VITE_DATA_MODE === "live" ? "live" : "mock";
}

export function createColonyDataSource(): ColonyDataSource {
  return readDataMode() === "live"
    ? new MonadColonyDataSource()
    : new MockColonyDataSource();
}
