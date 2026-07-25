import "dotenv/config";

import {
  createPublicClient,
  createWalletClient,
  defineChain,
  getAddress,
  http,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

function readRequired(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function readPositiveInteger(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

const rpcUrl = process.env.MONAD_RPC_URL?.trim() || "https://testnet-rpc.monad.xyz";
const chainId = readPositiveInteger("MONAD_CHAIN_ID", 10143);
const chainName = process.env.MONAD_CHAIN_NAME?.trim() || "Monad Testnet";
const explorerUrl = process.env.MONAD_EXPLORER_URL?.trim() || "https://testnet.monadexplorer.com";

export const pollingIntervalMs = readPositiveInteger("POLLING_INTERVAL_MS", 800);
export const executionMode = process.env.AGENT_EXECUTION_MODE?.trim() || "mock";

if (executionMode !== "mock") {
  throw new Error("Only AGENT_EXECUTION_MODE=mock is implemented in the MVP");
}

export const antForgeChain = defineChain({
  id: chainId,
  name: chainName,
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
  blockExplorers: { default: { name: `${chainName} Explorer`, url: explorerUrl } },
});

export const contractAddress: Address = getAddress(readRequired("ANT_COLONY_ADDRESS"));

export const publicClient = createPublicClient({
  chain: antForgeChain,
  pollingInterval: pollingIntervalMs,
  transport: http(rpcUrl, { retryCount: 3, timeout: 20_000 }),
});

function readPrivateKey(name: string): Hex {
  const value = readRequired(name);
  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error(`${name} must be a 32-byte 0x-prefixed private key`);
  }
  return value as Hex;
}

export function walletFromEnv(name: string) {
  const account = privateKeyToAccount(readPrivateKey(name));
  return createWalletClient({
    account,
    chain: antForgeChain,
    // Never retry eth_sendRawTransaction implicitly. Receipt/status reads may retry via publicClient.
    transport: http(rpcUrl, { retryCount: 0, timeout: 20_000 }),
  });
}

export type AgentWallet = ReturnType<typeof walletFromEnv>;

export async function assertContractReady(): Promise<void> {
  const code = await publicClient.getCode({ address: contractAddress });
  if (!code || code === "0x") {
    throw new Error(`No contract bytecode at ${contractAddress} on chain ${chainId}`);
  }
}
