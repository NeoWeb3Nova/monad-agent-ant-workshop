# AntForge Design System

## Register

Operate: a dark evidence-first Web3 operations cockpit for a live technical demonstration, not a marketing landing page or token dashboard.

## Thesis

The underground colony is the live execution graph. The interface refuses fake global statistics, reward-farm neon, and decorative cards disconnected from task state.

## First viewport

A compact 64px status header sits above a three-column workspace: 300px Mission Console, flexible Colony Stage, and 300px Evidence Rail. A compact Workflow Strip sits under the Colony Stage. At 1440×900, mission input, all six real nodes, workflow progression, chain metrics, and the event timeline remain visible without browser zoom.

## Color tokens

- `--surface-root: #080910`
- `--surface-panel: #11131b`
- `--surface-raised: #171923`
- `--surface-inset: #0b0d14`
- `--border-subtle: rgba(190, 181, 218, 0.14)`
- `--border-strong: rgba(183, 157, 255, 0.34)`
- `--text-primary: #f5f3f8`
- `--text-secondary: #bbb6c7`
- `--text-muted: #938ca1`
- `--monad: #836ef9`
- `--monad-soft: #b9a8ff`
- `--success: #55d69e`
- `--warning: #e5b85f`
- `--danger: #f06f79`
- `--info: #72cde3`

Green means successful/online/settled, gold means MON or escrow, red means failure/rejection/conflict, and Monad purple means network or active execution.

`--text-muted` has 5.42:1 contrast on `--surface-raised` and is approved for 12px secondary metadata. Muted text must not carry critical, actionable, or status content.

## Typography

Use the existing local/system sans stack for reliability and a system monospace stack for addresses, hashes, blocks, and MON. Desktop body text is at least 12px, controls and primary states are 13–14px, panel titles are 18–20px, and no critical product text is below 11px. Numeric values use tabular figures.

## Layout and spacing

Use a 4px base rhythm with 8, 12, 16, 20, and 24px steps. Desktop side rails are approximately 300px. Use 10–14px inner radii and 16–18px outer panel radii; avoid pill shapes except compact status tokens. Do not shrink text to preserve three columns—reflow below the desktop breakpoint.

## Component vocabulary

- Header: brand, product line, mode, Runner, contract, wallet.
- Mission Console: goal, fixed task preview, escrow, one primary action, progress.
- Colony Stage: pixel-redacted production artwork at `web/public/colony/antforge-reference-colony.webp`; six state overlays—Queen, Repair, Color, Story, Guard, Treasury—and state-driven pheromone paths.
- Evidence Rail: five metrics—Network, Tasks settled, Escrow budget, Last inclusion, Latest block—plus event timeline and supported Explorer links.
- Workflow Strip: five steps—Goal, Split tasks, Ant agents, Verify, Settle—and three proof lanes—Swarm Lane, Skill Guard, Conflict Lane.

Every node, metric, step, and lane derives from `ColonySnapshot` or existing helpers. Loading is explicitly labelled and invents no value; empty data renders an unavailable/no-events state and no unsupported link; errors expose the real wallet, RPC, or contract failure with retry and never imply success or silently substitute Mock. Clearly labelled synthetic Mock values may support the demo but must never be styled or described as Monad Testnet facts; Live evidence may never be fabricated.

The artwork authority is `NeoWeb3Nova/frontend` revision `441886c3f7bbf93b82cacf67cb4bb4afa8084b96`, source path `src/components/MainContent.tsx`. The immutable source bytes are preserved at `web/public/colony/antforge-reference-colony-source.webp` with SHA-256 `394b6bb0e47c40449131fbe29a515c49ba01394a2aa3b7e9b412bbd8c6ec7ab5`. Production uses the derived backdrop at `web/public/colony/antforge-reference-colony.webp` with SHA-256 `7505f01f42226160e20ebf214b03dc468a43ae79fb9b85567c199ba984134566`. The committed `web/scripts/prepare-colony-art.py` transformation is exact: with Pillow 12.1.1, convert to RGB, apply `GaussianBlur(radius=8)` at the intrinsic 512×356 size, blend 50% with `#080910`, then encode WebP with quality 90 and method 6. Baked labels, numbers, controls, and charts are unreadable in the pixels before CSS scaling; CSS supplies only global tint/vignette and foreground z-index, never chamber-coordinate redaction masks.

## Motion

Use 160–280ms transitions and transform/opacity. Pheromone and ant motion only run for active task routes. Reduced Motion disables all nonessential movement.

## Anti-references

Do not ship hard-coded placeholder addresses presented as connected or Live, fake blocks, fake balances, Active Ant totals, cumulative network rewards, dollar estimates, Priority controls, editable skill-marketplace controls, Storage/Scout features, emoji icons, dead links, generic AI gradients, reward-farm neon, or decorative glassmorphism. Authoritative configured Agent addresses are allowed and must retain their real source and state.

## Responsive rules

At 1440×900 and larger, keep the roadshow cockpit in one viewport. At 1370px and below, switch to a vertical document flow with Mission, Colony, Workflow, and Evidence; this content-driven breakpoint prevents settled node cards from colliding around 1280px without shrinking text. At 640px and below, preserve 44px controls, 16px form text, and no horizontal page overflow. The Colony Stage keeps a 680px internal canvas with horizontal stage scrolling so every node stays readable rather than being compressed.
