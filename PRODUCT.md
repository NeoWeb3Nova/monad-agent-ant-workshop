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

Mock and Live share `ColonySnapshot` and one page. Clearly labelled synthetic Mock values are allowed for a deterministic demo, but they may never be presented as Monad Testnet facts or evidence. Live evidence—including contracts, transactions, blocks, balances, Agent identities, and performance claims—may never be fabricated, and Live failure never silently falls back to Mock. Contracts and Agent Runner behavior are outside visual-redesign scope.

The required UI inventory is six nodes (Queen, Repair, Color, Story, Guard, Treasury), five metrics (Network, Tasks settled, Escrow budget, Last inclusion, Latest block), five workflow steps (Goal, Split tasks, Ant agents, Verify, Settle), and three proof lanes (Swarm Lane, Skill Guard, Conflict Lane). All values and states derive from `ColonySnapshot` or existing helpers. Loading is labelled without inventing values; empty data uses an explicit unavailable/no-events state and omits unsupported links; errors identify the real wallet, RPC, or contract failure and offer retry without implying success.

## Brand Commitments

The product name is AntForge on Monad / Agent 蚂蚁工坊. The underground ant-colony metaphor must map to real business state. Monad purple may identify the network and active execution, but evidence must remain clearer than atmosphere.

## Evidence on Hand

Real deployment and interaction evidence lives in `deployments/monad-testnet.json` and `docs/04-monad-testnet-evidence.md`. The frontend reads the deployed contract through the existing Monad adapter. Production uses the UI-free colony artwork at `web/public/colony/antforge-reference-colony.webp`, a 1501×1047 WebP with SHA-256 `5c9430fd8617694a97210f492884f570a357f41844cbfb2a468c187c8b2034af`. It contains no baked labels, metrics, or synthetic evidence overlays; CSS adds only a light tint/vignette. No unverified network-wide activity or reward totals exist and none may be invented.

## Product Principles

1. Runnable loop before decorative breadth.
2. Real onchain evidence before claims.
3. One goal and one visible workflow before extra features.
4. Label synthetic Mock values as demo data; reserve Monad Testnet claims for Live evidence.
5. Every animation communicates Agent or contract state.

## Accessibility & Inclusion

Keyboard focus remains visible, state is not communicated by color alone, motion respects `prefers-reduced-motion`, and critical roadshow text stays readable without browser zoom.
