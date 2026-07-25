/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_MODE?: "mock" | "live";
  readonly VITE_MONAD_RPC_URL?: string;
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_ANT_COLONY_ADDRESS?: string;
  readonly VITE_GUARD_ADDRESS?: string;
  readonly VITE_EXPLORER_URL?: string;
  readonly VITE_DEPLOYMENT_BLOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
