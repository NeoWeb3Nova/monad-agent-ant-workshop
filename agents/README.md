# AntForge Agent Runtime

Local Node.js runtime for live AntForge wallet actions. It does not expose an HTTP API and never sends private keys to the browser.

## Modes

- `npm run agents:mock`: one-shot Swarm, Skill Guard, Conflict, settlement, and withdrawal demo.
- `npm run agents:live`: persistent `TaskCreated` watcher using deterministic mock outputs.

`AGENT_EXECUTION_MODE=mock` means only output generation is mocked. Contract state, wallet signatures, transactions, receipts, reward accounting, and native MON transfers are live on the configured chain.

## Setup

```bash
npm install
cp .env.example .env
npm run typecheck
npm run build
```

Populate `.env` with the deployed contract address and six independent Testnet-only wallet keys. Never reuse one wallet to impersonate multiple roles.

## Run

```bash
npm run agents:mock
npm run agents:live
```

Set `RUNNER_FROM_BLOCK=<deployment-block>` to replay `TaskCreated` logs from a known block. The live runner re-reads task state before every action and serializes transactions per wallet to avoid nonce races.

Each successful write emits one JSON line containing:

- `sentAt`
- `receiptAt`
- `transactionHash`
- `blockNumber`
- `gasLimit`
- `inclusionLatencyMs`

The latency field is transaction inclusion latency, not a claim about Monad finality.
