import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain, getAddress, type Address } from "viem";

function readTrimmedEnv(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

function readChainId(value: string | undefined): number {
  const chainId = Number(readTrimmedEnv(value, "10143"));
  if (!Number.isSafeInteger(chainId) || chainId <= 0) {
    throw new Error("VITE_CHAIN_ID must be a positive integer.");
  }
  return chainId;
}

export const monadRpcUrl = readTrimmedEnv(
  import.meta.env.VITE_MONAD_RPC_URL,
  "https://testnet-rpc.monad.xyz",
);
export const monadExplorerUrl = readTrimmedEnv(
  import.meta.env.VITE_EXPLORER_URL,
  "https://testnet.monadexplorer.com",
);

export const monadTestnet = defineChain({
  id: readChainId(import.meta.env.VITE_CHAIN_ID),
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: [monadRpcUrl] },
  },
  blockExplorers: {
    default: { name: "Monad Explorer", url: monadExplorerUrl },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  connectors: [injected()],
  transports: {
    [monadTestnet.id]: http(monadRpcUrl, { retryCount: 3, timeout: 20_000 }),
  },
});

export function readContractAddress(): Address | undefined {
  const value = import.meta.env.VITE_ANT_COLONY_ADDRESS?.trim();
  return value ? getAddress(value) : undefined;
}

export function readGuardAddress(): Address | undefined {
  const value = import.meta.env.VITE_GUARD_ADDRESS?.trim();
  return value ? getAddress(value) : undefined;
}
