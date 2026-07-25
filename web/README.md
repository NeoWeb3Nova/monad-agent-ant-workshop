# AntForge Web

Static React + Vite interface for the AntForge Agent coordination and native MON settlement demo.

## Modes

```text
VITE_DATA_MODE=mock  # deterministic browser-only demo; no fake hashes or blocks
VITE_DATA_MODE=live  # Monad Testnet events, wallet signatures, Receipts, and Explorer links
```

The app reads public `VITE_*` values from the repository-root `.env`. Vite only exposes variables with the `VITE_` prefix. Agent and deployer private keys must never use that prefix.

## Run

```bash
npm install
npm run dev
npm run build
```

## Required Live variables

```text
VITE_DATA_MODE=live
VITE_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
VITE_CHAIN_ID=10143
VITE_ANT_COLONY_ADDRESS=<deployed AntColony address>
VITE_GUARD_ADDRESS=<registered Guard address>
VITE_EXPLORER_URL=https://testnet.monadexplorer.com
VITE_DEPLOYMENT_BLOCK=<contract deployment block>
```

Live creation uses the injected wallet connector. The static frontend never receives Agent Runner keys and does not expose a signing HTTP API.

## Vercel

```text
Framework: Vite
Root Directory: web
Build Command: npm run build
Output Directory: dist
```
