# AntForge Agent Runtime

Local Node.js runtime for live AntForge wallet actions. It does not expose an HTTP API and never sends private keys to the browser.

## Modes

- `npm run agents:mock`: one-shot Swarm, Skill Guard, Conflict, settlement, and withdrawal demo.
- `npm run agents:live`: persistent `TaskCreated` watcher using deterministic mock outputs.

`AGENT_EXECUTION_MODE=mock` means only output generation is mocked. Contract state, wallet signatures, transactions, receipts, reward accounting, and native MON transfers are live on the configured chain.

## Setup

```bash
npm install
cp ../.env.example ../.env
npm run typecheck
npm run build
```

Populate the repository-root `.env` with the deployed contract address and six independent Testnet-only wallet keys. `agents/.env` remains supported as a local override. Explicit process variables take highest priority. Never reuse one wallet to impersonate multiple roles.

## Run

```bash
npm run agents:mock
npm run agents:live
```

Set `RUNNER_FROM_BLOCK=<deployment-block>` to replay `TaskCreated` logs from a known block. If omitted, the runner persists its first observed block under `.runtime/`. The live runner resumes `Open`, `Claimed`, `Submitted`, and `Settled` tasks by re-reading chain state before every transition.

Every wallet write is prepared and signed before broadcast. The runtime persists the nonce, raw signed transaction, and precomputed hash under `.runtime/` before sending. An ambiguous RPC response is reconciled or rebroadcast with the same raw transaction; it never creates a second business transaction blindly.

Each mined write emits one JSON line containing:

- `sentAt`
- `receiptAt`
- `transactionHash`
- `blockNumber`
- `gasLimit`
- `nonce`
- `inclusionLatencyMs`

The latency field is transaction inclusion latency, not a claim about Monad finality.
