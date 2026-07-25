# AntColony contracts

Minimal Foundry project for the AntForge on Monad settlement contract.

## Setup

From the repository root:

```bash
git submodule update --init
cd contracts
cp .env.example .env
```

Keep `DEPLOYER_PRIVATE_KEY` limited to a dedicated Monad Testnet wallet.

## Verify locally

```bash
forge fmt --check
forge build --sizes
forge test -vv
```

## Deploy to Monad Testnet

Check the deployer address and balance before broadcasting:

```bash
source .env
DEPLOYER=$(cast wallet address --private-key "$DEPLOYER_PRIVATE_KEY")
printf 'deployer=%s\n' "$DEPLOYER"
cast balance "$DEPLOYER" --rpc-url "$MONAD_RPC_URL"
```

Deploy only after the balance check succeeds:

```bash
source .env
forge script script/DeployAntColony.s.sol:DeployAntColony \
  --rpc-url "$MONAD_RPC_URL" \
  --broadcast \
  -vvvv
```

The deployment script prints `ANT_COLONY_ADDRESS` and `VITE_ANT_COLONY_ADDRESS`. A simulated address is not proof of deployment; verify the resulting address with `cast code` and the Monad explorer before recording it.
