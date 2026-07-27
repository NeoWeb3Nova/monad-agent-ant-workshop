# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hackathon judges and potential technical partners evaluating AntForge during a short live roadshow; the presenter operates the interface while explaining the onchain workflow.

## Product Purpose

AntForge lets a requester fund one goal, split it into isolated Agent microtasks, observe specialist Workers execute them, let a Guard verify results, and settle real MON rewards on Monad Testnet.

## Positioning

AntForge demonstrates a Monad-native swarm execution and settlement mechanism: independent Agent wallets coordinate through task-scoped state and contract events instead of a single centralized Agent process.

## Operating Context

The primary scene is a 1440×900 or 1920×1080 desktop browser during a three-minute roadshow, with an injected requester wallet and a local event-driven Agent Runner. Mock Mode protects narrative continuity; Live Mode proves real contract state, transactions, events, and Explorer evidence.

## Capabilities and Constraints

Mock and Live share `ColonySnapshot` and one page. Live failure never silently falls back to Mock. Contracts, transactions, blocks, balances, Agent identities, and performance evidence must never be fabricated. The MVP exposes Queen, Repair, Color, Story, Guard, Treasury, Swarm Lane, Skill Guard, and Conflict Lane. Contracts and Agent Runner behavior are outside visual-redesign scope.

## Brand Commitments

The product name is AntForge on Monad / Agent 蚂蚁工坊. The underground ant-colony metaphor must map to real business state. Monad purple may identify the network and active execution, but evidence must remain clearer than atmosphere.

## Evidence on Hand

Real deployment and interaction evidence lives in `deployments/monad-testnet.json` and `docs/04-monad-testnet-evidence.md`. The frontend reads the deployed contract through the existing Monad adapter. The reference colony image comes from the user-owned `NeoWeb3Nova/frontend` repository. No unverified network-wide activity or reward totals exist and none may be invented.

## Product Principles

1. Runnable loop before decorative breadth.
2. Real onchain evidence before claims.
3. One goal and one visible workflow before extra features.
4. Mock chain-off intelligence honestly; never mock chain-on truth.
5. Every animation communicates Agent or contract state.

## Accessibility & Inclusion

Keyboard focus remains visible, state is not communicated by color alone, motion respects `prefers-reduced-motion`, and critical roadshow text stays readable without browser zoom.
