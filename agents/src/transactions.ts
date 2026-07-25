import type { Hash, TransactionReceipt } from "viem";

import { antColonyAbi } from "./abi/antColonyAbi.js";
import {
  contractAddress,
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
  sentAt: string;
  receiptAt: string;
  inclusionLatencyMs: number;
  status: TransactionReceipt["status"];
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

export async function executeWrite(input: WriteRequest): Promise<TransactionRecord> {
  const simulation = await publicClient.simulateContract({
    account: input.wallet.account,
    address: contractAddress,
    abi: antColonyAbi,
    functionName: input.functionName,
    args: input.args ?? [],
    ...(input.value === undefined ? {} : { value: input.value }),
  } as never);

  const sentAtMs = Date.now();
  const sentAt = new Date(sentAtMs).toISOString();
  let transactionHash: Hash;
  try {
    transactionHash = await input.wallet.writeContract(simulation.request);
  } catch (error) {
    throw new TransactionExecutionError(
      `${input.label} failed before a transaction hash was returned: ${renderError(error)}`,
    );
  }

  let receipt: TransactionReceipt;
  try {
    receipt = await publicClient.waitForTransactionReceipt({
      hash: transactionHash,
      confirmations: 1,
      timeout: 120_000,
    });
  } catch (error) {
    throw new TransactionExecutionError(
      `${input.label} broadcast as ${transactionHash}, but receipt resolution is ambiguous: ${renderError(error)}`,
      transactionHash,
    );
  }

  const receiptAtMs = Date.now();
  const transaction = await publicClient.getTransaction({ hash: transactionHash });
  const record: TransactionRecord = {
    label: input.label,
    account: input.wallet.account.address,
    transactionHash,
    blockNumber: receipt.blockNumber,
    gasLimit: transaction.gas,
    sentAt,
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
