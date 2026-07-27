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
- `--text-muted: #817b8f`
- `--monad: #836ef9`
- `--monad-soft: #b9a8ff`
- `--success: #55d69e`
- `--warning: #e5b85f`
- `--danger: #f06f79`
- `--info: #72cde3`

Green means successful/online/settled, gold means MON or escrow, red means failure/rejection/conflict, and Monad purple means network or active execution.

## Typography

Use the existing local/system sans stack for reliability and a system monospace stack for addresses, hashes, blocks, and MON. Desktop body text is at least 12px, controls and primary states are 13–14px, panel titles are 18–20px, and no critical product text is below 11px. Numeric values use tabular figures.

## Layout and spacing

Use a 4px base rhythm with 8, 12, 16, 20, and 24px steps. Desktop side rails are approximately 300px. Use 10–14px inner radii and 16–18px outer panel radii; avoid pill shapes except compact status tokens. Do not shrink text to preserve three columns—reflow below the desktop breakpoint.

## Component vocabulary

- Header: brand, product line, mode, Runner, contract, wallet.
- Mission Console: goal, fixed task preview, escrow, one primary action, progress.
- Colony Stage: local authored image, six real state overlays, state-driven pheromone paths.
- Evidence Rail: five real metrics, event timeline, Explorer link, explicit empty/error state.
- Workflow Strip: five compact steps plus three proof lanes.

## Motion

Use 160–280ms transitions and transform/opacity. Pheromone and ant motion only run for active task routes. Reduced Motion disables all nonessential movement.

## Anti-references

Do not ship static wallets, fake blocks, fake balances, Active Ant totals, cumulative network rewards, dollar estimates, Priority controls, editable skill-marketplace controls, Storage/Scout features, emoji icons, dead links, generic AI gradients, reward-farm neon, or decorative glassmorphism.

## Responsive rules

At 1440×900 and larger, keep the roadshow cockpit in one viewport. Below 1180px, switch to a vertical document flow with Mission, Colony, Workflow, and Evidence. At 375px, preserve 44px controls, 16px form text, no horizontal page overflow, and a scrollable Colony Stage rather than unreadable overlays.
