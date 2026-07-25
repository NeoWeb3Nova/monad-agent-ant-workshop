import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import {
  encodeFunctionData,
  keccak256,
  type Hash,
  type Hex,
  type TransactionReceipt,
} from "viem";

import { antColonyAbi } from "./abi/antColonyAbi.js";
import {
  contractAddress,
  pollingIntervalMs,
  publicClient,
  type AgentWallet,
} from "./config.js";

export type WriteFunctionName =
  | "registerAgent"
  | "createColony"
  | "claimTask"
  | "submitResult"
  | "verifyResult"
  | "rejectAndRefund"
  | "cancelExpiredTask"
  | "withdrawReward";

export interface WriteRequest {
  label: string;
  wallet: AgentWallet;
  functionName: WriteFunctionName;
  args?: readonly unknown[];
  value?: bigint;
}

export interface TransactionRecord {
  label: string;
  account: `0x${string}`;
  transactionHash: Hash;
  blockNumber: bigint;
  gasLimit: bigint;
  nonce: number;
  sentAt: string;
  receiptAt: string;
  inclusionLatencyMs: number;
  status: TransactionReceipt["status"];
}

interface PendingTransaction {
  label: string;
  account: `0x${string}`;
  transactionHash: Hash;
  nonce: number;
  gasLimit: string;
  serializedTransaction: Hex;
  signedAt: string;
  sentAt?: string;
}

export class TransactionExecutionError extends Error {
  constructor(
    message: string,
    readonly transactionHash?: Hash,
    readonly receipt?: TransactionReceipt,
  ) {
    super(message);
    this.name = "TransactionExecutionError";
  }
}

const walletQueues = new Map<string, Promise<unknown>>();

export function executeWrite(input: WriteRequest): Promise<TransactionRecord> {
  return enqueueWallet(input.wallet.account.address, () => executeWriteUnlocked(input));
}

async function executeWriteUnlocked(input: WriteRequest): Promise<TransactionRecord> {
  await reconcilePending(input.wallet);

  await publicClient.simulateContract({
    account: input.wallet.account,
    address: contractAddress,
    abi: antColonyAbi,
    functionName: input.functionName,
    args: input.args ?? [],
    ...(input.value === undefined ? {} : { value: input.value }),
  } as never);

  const data = encodeFunctionData({
    abi: antColonyAbi,
    functionName: input.functionName,
    args: input.args ?? [],
  } as never);
  const prepared = await input.wallet.prepareTransactionRequest({
    account: input.wallet.account,
    to: contractAddress,
    data,
    ...(input.value === undefined ? {} : { value: input.value }),
  });
  const serializedTransaction = await input.wallet.signTransaction(prepared);
  const transactionHash = keccak256(serializedTransaction);
  const gasLimit = prepared.gas;
  if (gasLimit === undefined) {
    throw new TransactionExecutionError(`${input.label} prepared without a gas limit`, transactionHash);
  }

  const pending: PendingTransaction = {
    label: input.label,
    account: input.wallet.account.address,
    transactionHash,
    nonce: prepared.nonce,
    gasLimit: gasLimit.toString(),
    serializedTransaction,
    signedAt: new Date().toISOString(),
  };
  await savePending(pending);

  const sentAtMs = Date.now();
  pending.sentAt = new Date(sentAtMs).toISOString();
  await savePending(pending);

  let sendError: unknown;
  try {
    const returnedHash = await input.wallet.sendRawTransaction({ serializedTransaction });
    if (returnedHash.toLowerCase() !== transactionHash.toLowerCase()) {
      throw new Error(`RPC returned unexpected hash ${returnedHash}`);
    }
  } catch (error) {
    sendError = error;
  }

  let receipt: TransactionReceipt;
  try {
    receipt = await publicClient.waitForTransactionReceipt({
      hash: transactionHash,
      confirmations: 1,
      timeout: sendError ? 15_000 : 120_000,
      pollingInterval: pollingIntervalMs,
    });
  } catch (receiptError) {
    throw new TransactionExecutionError(
      `${input.label} has an unresolved signed transaction ${transactionHash}: ${renderError(
        sendError ?? receiptError,
      )}`,
      transactionHash,
    );
  }

  const receiptAtMs = Date.now();
  await removePending(input.wallet.account.address);
  const record: TransactionRecord = {
    label: input.label,
    account: input.wallet.account.address,
    transactionHash,
    blockNumber: receipt.blockNumber,
    gasLimit,
    nonce: prepared.nonce,
    sentAt: pending.sentAt,
    receiptAt: new Date(receiptAtMs).toISOString(),
    inclusionLatencyMs: receiptAtMs - sentAtMs,
    status: receipt.status,
  };

  console.log(JSON.stringify(toSerializableRecord(record)));

  if (receipt.status !== "success") {
    throw new TransactionExecutionError(
      `${input.label} reverted on-chain in ${transactionHash}`,
      transactionHash,
      receipt,
    );
  }

  return record;
}

async function reconcilePending(wallet: AgentWallet): Promise<void> {
  const pending = await loadPending(wallet.account.address);
  if (!pending) return;

  let receipt: TransactionReceipt | undefined;
  try {
    receipt = await publicClient.getTransactionReceipt({ hash: pending.transactionHash });
  } catch {
    try {
      const returnedHash = await wallet.sendRawTransaction({
        serializedTransaction: pending.serializedTransaction,
      });
      if (returnedHash.toLowerCase() !== pending.transactionHash.toLowerCase()) {
        throw new Error(`RPC returned unexpected hash ${returnedHash}`);
      }
    } catch {
      // "already known" and timeout are ambiguous; resolve only through the known hash below.
    }
    try {
      receipt = await publicClient.waitForTransactionReceipt({
        hash: pending.transactionHash,
        confirmations: 1,
        timeout: 30_000,
        pollingInterval: pollingIntervalMs,
      });
    } catch (error) {
      throw new TransactionExecutionError(
        `Wallet ${pending.account} still has unresolved nonce ${pending.nonce}: ${renderError(error)}`,
        pending.transactionHash,
      );
    }
  }

  if (!receipt) {
    throw new TransactionExecutionError(
      `Wallet ${pending.account} did not resolve ${pending.transactionHash}`,
      pending.transactionHash,
    );
  }
  await removePending(wallet.account.address);
  console.log(
    JSON.stringify({
      event: "transaction-reconciled",
      label: pending.label,
      account: pending.account,
      transactionHash: pending.transactionHash,
      nonce: pending.nonce,
      blockNumber: receipt.blockNumber.toString(),
      status: receipt.status,
    }),
  );
}

function enqueueWallet<T>(account: `0x${string}`, action: () => Promise<T>): Promise<T> {
  const key = account.toLowerCase();
  const previous = walletQueues.get(key) ?? Promise.resolve();
  const next = previous.then(action, action);
  const tracked = next.finally(() => {
    if (walletQueues.get(key) === tracked) walletQueues.delete(key);
  });
  walletQueues.set(key, tracked);
  return tracked;
}

function journalPath(account: `0x${string}`): string {
  const root = process.env.AGENT_JOURNAL_PATH?.trim() || ".runtime";
  return resolve(root, `pending-${account.toLowerCase()}.json`);
}

async function loadPending(account: `0x${string}`): Promise<PendingTransaction | undefined> {
  try {
    return JSON.parse(await readFile(journalPath(account), "utf8")) as PendingTransaction;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function savePending(pending: PendingTransaction): Promise<void> {
  const path = journalPath(pending.account);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(pending, null, 2)}\n`, { mode: 0o600 });
}

async function removePending(account: `0x${string}`): Promise<void> {
  try {
    await unlink(journalPath(account));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

export function renderError(error: unknown): string {
  if (error instanceof Error) {
    const withShortMessage = error as Error & { shortMessage?: string };
    return withShortMessage.shortMessage ?? error.message;
  }
  return String(error);
}

function toSerializableRecord(record: TransactionRecord) {
  return {
    event: "transaction-receipt",
    ...record,
    blockNumber: record.blockNumber.toString(),
    gasLimit: record.gasLimit.toString(),
  };
}
