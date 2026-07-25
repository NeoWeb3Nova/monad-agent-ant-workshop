import type { ColonyDataSource, DataMode } from "../domain";
import { MockColonyDataSource } from "./MockColonyDataSource";
import { MonadColonyDataSource } from "./MonadColonyDataSource";

export function readDataMode(): DataMode {
  const explicit = import.meta.env.VITE_DATA_MODE;
  if (explicit === "mock") return "mock";
  if (explicit === "live") return "live";
  // Production builds default to live settlement unless explicitly told otherwise.
  return import.meta.env.PROD ? "live" : "mock";
}

export function createColonyDataSource(): ColonyDataSource {
  return readDataMode() === "live"
    ? new MonadColonyDataSource()
    : new MockColonyDataSource();
}
