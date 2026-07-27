<div align="center">

# AntForge on Monad

**A settlement layer for autonomous agent swarms.**

One mission becomes a temporary, skill-matched machine workforce — verified and paid on Monad.

[![Public Demo](https://img.shields.io/badge/Public_Demo-Live_Settlement-00c896?style=flat-square)](https://antforge-monad.vercel.app/)
[![Explorer](https://img.shields.io/badge/Explorer-AntColony-836EF9?style=flat-square)](https://testnet.monadexplorer.com/address/0x028268f8fF62edc596f931E17E2Fb21015f5b0A2)
[![Onchain Evidence](https://img.shields.io/badge/Onchain-Evidence-111827?style=flat-square)](docs/04-monad-testnet-evidence.md)
[![English](https://img.shields.io/badge/English-Current-00c896?style=flat-square)](README.md)
[![Simplified Chinese](https://img.shields.io/badge/简体中文-README.zh--CN.md-lightgrey?style=flat-square)](README.zh-CN.md)

<br/>

<img
  src="docs/assets/antforge-product-hero.webp"
  alt="AntForge product vision: Queen Core coordinates Image, LLM, Guard, Storage, and Treasury workshops on Monad"
  width="100%"
/>

<sub>Product concept: Mission → temporary agent swarm → Guard verification → native MON settlement on Monad.</sub>

</div>

---

## Product Thesis

Most agent products optimize which single agent to select or call. AntForge addresses the next problem: **when one mission requires several skills, how can a temporary machine workforce form around it while keeping responsibilities, results, and payments verifiable?**

AntForge is **not another agent marketplace**. A marketplace focuses on discovery and exchange. AntForge provides a coordination and settlement protocol: it isolates tasks, enforces skill matching, records output commitments, authorizes Guard verification, and escrows and settles native MON on Monad.

The innovation is not one model or one agent. It is the protocol layer that lets autonomous agents establish a trusted economic relationship for the duration of a mission.

## Live Product

The product turns a mission into a complete, observable work loop:

```text
Mission + MON escrow
  → Queen plans isolated tasks
  → skill-matched Workers claim and execute
  → Workers commit output hashes
  → Guard verifies or rejects
  → rewards enter claimableRewards[worker]
  → Workers withdraw native MON
```

The Public Demo uses a simple example: a user submits an old photograph, and Queen creates three tasks — **Repair, Color, and Story**. Specialist Workers restore the image, colorize it, and write a commemorative story before Guard verification. This is an accessible protocol demonstration, not the boundary of the product. The core capability is verifiable coordination and settlement for any temporary mix of skills a mission requires.

[Open the Public Demo](https://antforge-monad.vercel.app/) · [Follow the frontend demo walkthrough](docs/07-frontend-demo-walkthrough.md)

## Why AntForge / Why Monad

Agent collaboration produces many task-level state updates and micro-settlements. AntForge isolates writes across independent tasks while modeling exclusive competition for the same task as an explicit conflict. This is a **parallel-friendly state design for Monad**, not an unmeasured performance claim.

| Mechanism | Protocol design | Why it matters |
| --- | --- | --- |
| **Swarm Lane** | `mapping(bytes32 taskId => Task)`; different Workers write to different task slots | Independent tasks can be claimed, submitted, and settled separately, reducing unnecessary shared-state contention |
| **Conflict Lane** | The `Open` state of one `taskId` is an exclusive resource | The first Worker wins the task; a competing transaction verifiably reverts |
| **Skill Guard** | `agents[worker].skills & task.requiredSkill` | The contract enforces skill eligibility instead of relying only on the UI or scheduler |
| **Deterministic IDs** | `keccak256(requester, colonyId, index, inputHash)` | Task IDs derive from context without a shared `nextTaskId++` counter |
| **Pull Settlement** | `claimableRewards[worker]` + `withdrawReward()` | Guard records the reward; each Worker independently withdraws native MON |
| **Pheromone Events** | Events cover the Colony, Task, Result, and Reward lifecycle | The frontend and Runner can recover state through log replay and incremental polling |

AntForge does not publish TPS or finality figures without supporting measurements, and it does not present “fast feedback” as proof of finality.

## Verifiable Onchain Proof

Onchain evidence is part of AntForge's trust model, not product decoration. The values below come from the repository deployment record and Monad Testnet Explorer.

| Item | Verifiable value |
| --- | --- |
| Network | Monad Testnet · Chain ID `10143` |
| Contract | [`0x028268f8fF62edc596f931E17E2Fb21015f5b0A2`](https://testnet.monadexplorer.com/address/0x028268f8fF62edc596f931E17E2Fb21015f5b0A2) |
| Deployment transaction | [`0xf0567983d07c3a5811d603612defb71b188856b44db840b895e164e4f941a00c`](https://testnet.monadexplorer.com/tx/0xf0567983d07c3a5811d603612defb71b188856b44db840b895e164e4f941a00c) |
| Deployment block | `47924433` |
| Runtime code | `5388` bytes |
| Source verification | MonadVision Sourcify `exact_match` |
| Public Demo | [https://antforge-monad.vercel.app/](https://antforge-monad.vercel.app/) (defaults to Live Settlement) |
| Machine-readable record | [`deployments/monad-testnet.json`](deployments/monad-testnet.json) |

### Repair Worker: a five-transaction vertical slice

| Step | Transaction | Receipt |
| --- | --- | --- |
| Create a Colony and escrow three `0.001 MON` rewards | [`0xd7b5690c0781520d8750d50aac3b6733735a98a7f091bac1232669f940574763`](https://testnet.monadexplorer.com/tx/0xd7b5690c0781520d8750d50aac3b6733735a98a7f091bac1232669f940574763) | Success |
| Repair Worker claims the task | [`0xf0c11cffbb2ea79b713d7b1fb6bd757361fa1622a4ba2ebe363a0b2c29c57f9a`](https://testnet.monadexplorer.com/tx/0xf0c11cffbb2ea79b713d7b1fb6bd757361fa1622a4ba2ebe363a0b2c29c57f9a) | Success |
| Worker submits the output commitment | [`0x2687798b5e875ccf3abc26cb1469d4fb1d798e7e39a3ccbb14158697730f433c`](https://testnet.monadexplorer.com/tx/0x2687798b5e875ccf3abc26cb1469d4fb1d798e7e39a3ccbb14158697730f433c) | Success |
| Guard verifies and records the reward | [`0xc6c8d6401ed2e6374660b5e6d1235cd441536cbe17dbacdaa8c5b671dc42987e`](https://testnet.monadexplorer.com/tx/0xc6c8d6401ed2e6374660b5e6d1235cd441536cbe17dbacdaa8c5b671dc42987e) | Success |
| Worker withdraws native MON | [`0xba439f5fa3eb5b76283ae5c88eaa91779ac89bb4c6338fd482008f25fb0da2c7`](https://testnet.monadexplorer.com/tx/0xba439f5fa3eb5b76283ae5c88eaa91779ac89bb4c6338fd482008f25fb0da2c7) | Success |

The recorded post-settlement reads show the task as `Settled`, the Worker's `claimableRewards = 0`, and the contract balance at `0`.

### Verifiable failure paths

- **Conflict Lane:**
  - The [winning claim transaction](https://testnet.monadexplorer.com/tx/0x1d632ec74a9e8e61748bf7912d2744ab72e128f53e9219ccc77fbe5f8c3743d1) succeeds.
  - The [competing transaction](https://testnet.monadexplorer.com/tx/0x5c8f5070a5db880178220027a4eeb6d3f6e725be2888cae745996643cb9b4061) reverts with `TaskNotOpen`.
- **Rogue Ant / Skill Guard:** pre-broadcast simulation returns `SkillMismatch`, so the operation is **not broadcast and has no transaction hash**. AntForge does not manufacture evidence for a transaction that never happened.

See [`docs/04-monad-testnet-evidence.md`](docs/04-monad-testnet-evidence.md) for complete receipts, role addresses, and browser verification records.

## What Is Real

| Layer | Current boundary |
| --- | --- |
| **Live** | Agent identities and skills on Monad Testnet; Requester, Worker, and Guard wallet signatures; MON escrow; task state; output hashes; events; reward accounting; refunds; and Worker withdrawals. Live mode reads real RPC data, logs, and receipts. Failures surface as real errors and **never silently fall back** to Mock. |
| **Deterministic Mock** | Queen's three-task plan and the Repair, Color, and Story image/text outputs. They are repeatable and clearly labeled for a stable demonstration; they do not represent real LLM, image-model, or tool execution. |
| **Future** | Real model and tool execution, result storage and availability proofs, multiple Guards, staking and challenge/dispute mechanisms, an open skill network, and portable agent reputation. These directions have not been delivered. |

## Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│ web/ · React 19 + Vite 8 + TypeScript + wagmi + viem        │
│ MockColonyDataSource │ MonadColonyDataSource                 │
│ mission UI · wallet writes · event replay · Explorer links   │
└────────────────────────────┬─────────────────────────────────┘
                             │ public RPC + Requester wallet
┌────────────────────────────▼─────────────────────────────────┐
│ AntColony.sol · Monad Testnet 10143                          │
│ agents · tasks · escrow · permissions · refunds · MON        │
└────────────────────────────┬─────────────────────────────────┘
                             │ events + local-only role keys
┌────────────────────────────▼─────────────────────────────────┐
│ agents/ · Node.js + TypeScript + viem                        │
│ Repair · Color · Story · Guard · Rogue                       │
│ backfill · polling · recovery journal · reconciliation       │
└──────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Contract | Solidity `0.8.28`, Monad Foundry, OpenZeppelin | Identity, skills, exact escrow, state machine, permissions, refunds, and native MON settlement |
| Agent Runtime | Node.js `20+`, TypeScript, viem `2.55` | Independent role wallets, event-driven execution, log replay, and reliable transaction broadcasting |
| Web App | React `19.2`, Vite `8.1`, Tailwind CSS `4.3`, wagmi `3.7`, viem `2.55` | Shared Mock/Live interface, Requester wallet actions, and onchain evidence |
| Hosting | Vercel | Static Web App only; it **does not host** Agent private keys or the Runner |

## Quick Start

### Prerequisites

- Node.js `20+` and npm
- [Monad Foundry](https://docs.monad.xyz/tooling-and-infra/toolkits/monad-foundry); this project was verified with `1.7.1-monad-v1.0.0`
- For Live mode: an injected wallet such as MetaMask or Rabby, plus a small amount of Testnet MON
- For deployment and the Runner: dedicated testnet wallets only; never use a mainnet private key

### Clone and run the full verification suite

```bash
git clone https://github.com/NeoWeb3Nova/monad-agent-ant-workshop.git
cd monad-agent-ant-workshop
git submodule update --init --recursive

cd contracts && forge fmt --check && forge build --sizes && forge test -vv && cd ..
cd agents && npm ci && npm run typecheck && npm run build && cd ..
cd web && npm ci && npm run lint && npm run build && cd ..
```

### Web: Mock mode

Vite uses `web/` as its environment directory. A fresh clone should create `web/.env`:

```bash
cd web
cp .env.example .env
# Keep VITE_DATA_MODE=mock
npm ci
npm run dev
```

Open `http://localhost:5173` and select **Release the swarm** to play the complete visual state machine. Mock mode does not invent transaction hashes, block numbers, or balances.

### Web: Live Settlement

Edit `web/.env`:

```dotenv
VITE_DATA_MODE=live
VITE_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
VITE_CHAIN_ID=10143
VITE_ANT_COLONY_ADDRESS=0x028268f8fF62edc596f931E17E2Fb21015f5b0A2
VITE_GUARD_ADDRESS=0xD6BFA77F707662A74CdA7C21dBb04e1a6cfddBc5
VITE_EXPLORER_URL=https://testnet.monadexplorer.com
VITE_DEPLOYMENT_BLOCK=47924433
```

```bash
cd web
npm run dev
```

After connecting a wallet and switching to Monad Testnet, **Create live colony** calls `createColony`, creates three tasks, and escrows `0.003 MON`. If the local Runner is online, it continues processing the tasks.

The public Vercel build uses the tracked public defaults in `web/.env.production` and currently defaults to `live`. Every `VITE_*` value is embedded in the browser build.

### Agent Runner

The Runner loads the repository-root `.env` first, then overlays `agents/.env`; process-level environment variables have the highest precedence.

```bash
cp .env.example .env
# Set ANT_COLONY_ADDRESS, RUNNER_FROM_BLOCK, and six testnet role private keys
cd agents
npm ci
npm run typecheck
npm run build

npm run agents:mock  # One-shot Swarm / Skill Guard / Conflict / Settlement demo
npm run agents:live  # Persistent TaskCreated listener and automatic task processing
```

`.runtime/` stores recovery cursors and the transaction journal and is ignored by Git.

### Foundry deployment

```bash
cd contracts
cp .env.example .env
# Set MONAD_RPC_URL and a Testnet-only DEPLOYER_PRIVATE_KEY
source .env

DEPLOYER=$(cast wallet address --private-key "$DEPLOYER_PRIVATE_KEY")
cast balance "$DEPLOYER" --rpc-url "$MONAD_RPC_URL"

forge script script/DeployAntColony.s.sol:DeployAntColony \
  --rpc-url "$MONAD_RPC_URL" \
  --broadcast \
  -vvvv
```

An address printed by the script is not deployment proof. Read the bytecode after deployment and verify the transaction receipt through Explorer or RPC:

```bash
cast code <address> --rpc-url "$MONAD_RPC_URL"
```

## Configuration

### Public Web variables

| Variable | Mock | Live | Description |
| --- | --- | --- | --- |
| `VITE_DATA_MODE` | Optional | Optional | `mock` / `live`; development defaults to Mock, while the tracked production configuration is Live |
| `VITE_MONAD_RPC_URL` | — | Optional | Browser-accessible Monad Testnet RPC; defaults to `https://testnet-rpc.monad.xyz` |
| `VITE_CHAIN_ID` | — | Optional | Defaults to `10143` |
| `VITE_ANT_COLONY_ADDRESS` | — | Required | Deployed `AntColony` address |
| `VITE_GUARD_ADDRESS` | — | Required | A registered Guard with the `VERIFY` skill |
| `VITE_EXPLORER_URL` | — | Optional | Explorer base URL; defaults to `https://testnet.monadexplorer.com` |
| `VITE_DEPLOYMENT_BLOCK` | — | Required | Positive log-replay start block |

Local Vite reads these values from `web/.env`; fresh clones should copy `web/.env.example`. Vercel uses the tracked public defaults in `web/.env.production`. **Never** place a private key, seed phrase, API secret, or any other secret in a `VITE_*` variable.

### Private Agent Runtime variables

| Variable | Required | Description |
| --- | --- | --- |
| `ANT_COLONY_ADDRESS` | Yes | Contract operated by the Runner |
| `MONAD_RPC_URL` | No | Monad Testnet RPC; defaults to `https://testnet-rpc.monad.xyz` |
| `MONAD_CHAIN_ID` | No | Defaults to `10143` |
| `MONAD_CHAIN_NAME` | No | Defaults to `Monad Testnet` |
| `MONAD_EXPLORER_URL` | No | Defaults to Monad Testnet Explorer |
| `RUNNER_FROM_BLOCK` | Recommended | Initial log-replay block; the deployment block is `47924433` |
| `POLLING_INTERVAL_MS` | No | Defaults to `800` |
| `TASK_REWARD_MON` | Mock CLI | Per-task reward; defaults to `0.001` |
| `AGENT_EXECUTION_MODE` | No | Defaults to `mock`; the MVP currently implements only `mock` output |
| `REQUESTER_PRIVATE_KEY` | Yes | Requester testnet wallet |
| `REPAIR_AGENT_PRIVATE_KEY` | Yes | Repair Worker testnet wallet |
| `COLOR_AGENT_PRIVATE_KEY` | Yes | Color Worker testnet wallet |
| `STORY_AGENT_PRIVATE_KEY` | Yes | Story Worker testnet wallet |
| `GUARD_AGENT_PRIVATE_KEY` | Yes | Guard testnet wallet |
| `ROGUE_AGENT_PRIVATE_KEY` | Yes | Wallet used to demonstrate the failure path |

Contract deployment needs only `MONAD_RPC_URL` and `DEPLOYER_PRIVATE_KEY`; see [`contracts/.env.example`](contracts/.env.example).

## Security and Limitations

### Implemented security boundaries

- **Exact escrow:** when a Colony is created, `msg.value` must equal the sum of all task rewards. The contract rejects direct transfers that bypass the workflow.
- **Skill and role authorization**:
  - Only active, skill-matched Workers may claim; only the assigned Worker may submit.
  - At Colony creation, `createColony` checks that the designated Guard is active and has the `VERIFY` skill.
  - Later, `verifyResult` and `rejectAndRefund` check only that `msg.sender` is the task's designated verifier address.
  - Only the Requester may cancel an expired task.
- **Pull payments:** Guard credits `claimableRewards`; Workers withdraw for themselves instead of receiving an arbitrary push payment during verification.
- **Refund paths:** a Guard rejection of a submitted result, or Requester cancellation of an expired unsettled task, returns that task's reward to the Requester.
- **Reentrancy protection:** fund flows update state before external calls and use OpenZeppelin `ReentrancyGuard`.
- **Private-key isolation:** Agent and deployment keys belong only in uncommitted local environment files. The static Vercel frontend holds none of them.

### Current limitations

- This hackathon prototype runs on Monad Testnet and is **not audited**; it must not hold mainnet assets.
- Queen planning and Worker image/text output remain deterministic mocks. The current deterministic Guard compares the expected output hash and checks task state plus Worker/verifier associations; it does not validate content format, URI/file availability, or semantic quality.
- Each Colony currently uses one designated Guard. There is no multi-Guard consensus, staking, challenge period, or dispute arbitration.
- The Runner is hosted in the local demo environment, not a decentralized execution network.
- The performance boundary is described above; the project makes no claim about economic-attack resilience or mainnet security.
- The repository root has no project-level `LICENSE`, `LICENSE.md`, or `COPYING`. SPDX identifiers in individual source files do not declare a license for the project as a whole.

## Built by Neo.Yun

<table>
<tr>
<td width="108" valign="top">
<img src="https://raw.githubusercontent.com/NeoWeb3Nova/sticker-pack-maker-skill/master/media/wechat-neo.png" alt="Neo.Yun" width="88">
</td>
<td valign="top">

**AI × Web3 Builder · Protocol Designer**

Neo.Yun builds working, verifiable, and reproducible systems from first principles. AntForge follows the same discipline: define the trust boundary first, then prove it with a working system and concrete evidence.

</td>
</tr>
</table>

The projects below demonstrate the builder's delivery experience; they are neither AntForge modules nor partners:

- **[OPC Agent Treasury](https://github.com/NeoWeb3Nova/opc-agent-treasury)** — third place in the AI × Web3 School Agentic Hackathon track; [official announcement](https://x.com/aiweb3school/status/2069726882988441643).
- **[Monad Builder Camp](https://github.com/NeoWeb3Nova/Web3SummerInternshipProgram-MonadBuilderCamp) / [MOSS](https://github.com/NeoWeb3Nova/moss)** — learning, building, and open-source contribution work in the Monad ecosystem.
- **[NeoDeFi](https://github.com/NeoWeb3Nova/NeoDeFi)** — onchain asset-management protocol and end-to-end product delivery.
- **MotionSeal** — protocol-design exploration for proof-of-movement commitments on Monad.

[GitHub](https://github.com/NeoWeb3Nova) · [Website](https://amshe.fun) · [X](https://x.com/NeoWeb3Nova) · [Telegram](https://t.me/neo_web3_nova)

## From MVP to Agent Economy

| Stage | Direction |
| --- | --- |
| **Today** | A reproducible Monad Testnet MVP for agent collaboration and native MON settlement: task isolation, skill constraints, Guard verification, refunds, Pull Settlement, Runner, and Public Demo. |
| **Next** | Integrate real model and tool execution, result storage, and availability proofs; explore more Guards, challenge mechanisms, and stronger execution reliability. |
| **Vision** | Build an open **Agent Swarm Execution Network** where agents discover work, prove skills, form temporary teams, and accumulate portable reputation across missions. |

`Next` and `Vision` describe future work. They are not shipped features or a commitment to a mainnet launch.

## Build With Us

AntForge is looking for collaborators who can help move the protocol from a verifiable MVP into real workflows:

| Partner category | What we can build together |
| --- | --- |
| **Agent frameworks** | Map framework-native agent capabilities to onchain skills, task claims, output commitments, and settlement adapters |
| **Verification / storage providers** | Result availability, content addressing, verifiable execution, proof aggregation, and Guard interfaces |
| **Monad ecosystem** | Native agent use cases, parallel-friendly state patterns, wallet/RPC/indexing infrastructure, and ecosystem integrations |
| **Design Partners** | Use real business missions to define task templates, acceptance criteria, failure paths, and settlement rules |

If you build agent infrastructure, verification layers, or storage services — or have a real workflow suited to temporary multi-agent collaboration — connect through [GitHub](https://github.com/NeoWeb3Nova), [X](https://x.com/NeoWeb3Nova), or [Telegram](https://t.me/neo_web3_nova).

## Documentation

| Document | Purpose |
| --- | --- |
| [Project Collaboration Guide](AGENTS.md) | Project scope, truthfulness rules, Monad constraints, and definition of done |
| [Product Ideation and Mechanism Baseline](docs/01-project-ideation.md) | Product concept and mechanism baseline |
| [Monad Testnet Evidence](docs/04-monad-testnet-evidence.md) | Deployment, transactions, RPC reads, and browser evidence |
| [3-Minute Product Demo Cue Card](docs/06-roadshow-cue-card.md) | Stage-ready three-minute product demo cue card |
| [Frontend Demo Walkthrough](docs/07-frontend-demo-walkthrough.md) | Step-by-step wallet, transaction, Runner, and Explorer workflow |
| [Contract Development Guide](contracts/README.md) | Contract development, testing, and deployment |
| [Agent Runtime Guide](agents/README.md) | Agent Runtime operation and recovery |
| [Web App Guide](web/README.md) | Mock and Live Web App usage |

## Contributing

1. Fork the repository and create a clearly scoped feature branch from `main`.
2. Keep the Live / Deterministic Mock / Future boundary explicit, and never commit private keys, seed phrases, or secrets.
3. Add Foundry tests for changes to the contract state machine, permissions, or fund flows.
4. Run the affected subsystem's formatting, type checking, linting, tests, and build.
5. Open a Pull Request that explains the change scope, trust boundary, and actual verification results.

See “Security and Limitations” for the current licensing and reuse boundary. For licensing requests, contact the maintainer through an Issue.

## Disclaimer

AntForge is a Monad Testnet prototype for research, development, and demonstration. It is not financial, investment, legal, or security advice. Do not send mainnet assets to this project's contracts or demo wallets. Onchain interactions are irreversible; independently verify the network, contract address, transaction parameters, and permissions before using any testnet wallet. Future directions may change, and the roadmap in this README is not a promise of product delivery, partnership, financing, or launch.
