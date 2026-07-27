# AntForge Frontend Fusion Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild AntForge’s presentation layer around the new underground-colony reference while preserving every real Mock/Live, wallet, contract, event, and Explorer behavior.

**Architecture:** Keep `ColonyDataSource` and `ColonySnapshot` as the untouched authority. Recompose only the React presentation and CSS asset layers, localize the approved reference image, and derive every visible status from the existing snapshot. The page remains a single-screen operations cockpit on roadshow desktops and becomes a vertical flow below the desktop breakpoint.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4 import pipeline, wagmi, viem, Phosphor Icons, vanilla CSS asset layers.

**Approved design:** `docs/superpowers/specs/2026-07-27-antforge-frontend-fusion-redesign.md`

---

## Scope and file map

**Create:**

- `PRODUCT.md` — durable AntForge product truth, platform, users, evidence rules, and constraints.
- `DESIGN.md` — durable visual tokens, component vocabulary, responsive rules, and anti-references.
- `web/public/colony/antforge-reference-colony.webp` — project-owned optimized copy of the approved reference colony image.

**Modify:**

- `web/src/App.tsx` — presentation hierarchy, labels, semantic regions, evidence timeline, and compact proof-lane layout.
- `web/src/App.css` — core tokens, desktop grid, readable type scale, component states, and responsive layout.
- `web/src/visual-assets.css` — reference-image stage, masking, node positions, state-driven asset treatment, and motion.
- `web/src/image-assets.css` — preserve brand/Queen imagery while removing cascade rules that conflict with the new stage.
- `web/src/index.css` — global typography, scrolling, selection, and small-screen behavior.

**Do not modify:**

- `web/src/domain.ts`
- `web/src/data/*`
- `web/src/abi/*`
- `contracts/*`
- `agents/*`

The composition root remains `web/src/main.tsx`; it still mounts `Providers` and `App`, and `App` still constructs the source via `createColonyDataSource()`.

---

### Task 0: Design system lock

**Files:**
- Create: `PRODUCT.md`
- Create: `DESIGN.md`
- Read: `docs/superpowers/specs/2026-07-27-antforge-frontend-fusion-redesign.md`
- Read: `AGENTS.md`

- [ ] **Step 1: Create the durable product record**

Write `PRODUCT.md` with this confirmed structure:

```markdown
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
```

- [ ] **Step 2: Create the visual system authority**

Write `DESIGN.md` with these locked decisions:

```markdown
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
```

- [ ] **Step 3: Verify the lock files**

Run:

```bash
rg -n "T[B]D|T[O]DO|fake global|reward-farm|1440×900" PRODUCT.md DESIGN.md
```

Expected: no placeholder markers; expected anti-reference and viewport language is present.

- [ ] **Step 4: Commit the design lock**

```bash
git add PRODUCT.md DESIGN.md
git diff --cached --check
git commit -m "docs: lock AntForge product and visual system"
git push origin main
```

---

### Task 1: Localize and optimize the colony artwork

**Files:**
- Create: `web/public/colony/antforge-reference-colony.webp`
- Modify: `web/src/visual-assets.css`

- [ ] **Step 1: Extract the approved source URL from the reference repository**

Clone to a temporary directory and extract the first central colony image URL from `MainContent.tsx`:

```bash
rm -rf /tmp/neoweb3nova-frontend-audit
git clone --depth 1 https://github.com/NeoWeb3Nova/frontend.git /tmp/neoweb3nova-frontend-audit
python3 - <<'PY'
import re
from pathlib import Path
text = Path('/tmp/neoweb3nova-frontend-audit/src/components/MainContent.tsx').read_text()
url = re.search(r'src="(https://lh3\.googleusercontent\.com/aida-public/[^"]+)"', text).group(1)
Path('/tmp/antforge-colony-url.txt').write_text(url)
print(url)
PY
```

Expected: one `lh3.googleusercontent.com/aida-public/...` URL matching the approved central artwork.

- [ ] **Step 2: Download and convert the image into a project asset**

Use Pillow so no production package dependency is added:

```bash
python3 - <<'PY'
from io import BytesIO
from pathlib import Path
from urllib.request import urlopen
from PIL import Image
url = Path('/tmp/antforge-colony-url.txt').read_text().strip()
with urlopen(url, timeout=30) as response:
    source = Image.open(BytesIO(response.read())).convert('RGB')
source.save('web/public/colony/antforge-reference-colony.webp', 'WEBP', quality=90, method=6)
print(source.size)
PY
```

Expected: source dimensions `(512, 356)` and a non-empty WebP file.

- [ ] **Step 3: Verify the local asset and remote-dependency boundary**

Run:

```bash
file web/public/colony/antforge-reference-colony.webp
python3 - <<'PY'
from PIL import Image
im = Image.open('web/public/colony/antforge-reference-colony.webp')
assert im.format == 'WEBP'
assert im.size == (512, 356)
print(im.format, im.size)
PY
rg -n "googleusercontent|aida-public" web/src web/public --glob '!dist/**'
```

Expected: valid 512×356 WebP; no production source contains the remote URL.

- [ ] **Step 4: Point the stage at the local asset**

In `web/src/visual-assets.css`, replace the current stage background asset with:

```css
.colony-stage {
  background-color: var(--surface-root) !important;
  background-image:
    linear-gradient(180deg, rgba(8, 7, 18, 0.12), rgba(6, 7, 12, 0.54)),
    radial-gradient(circle at 50% 46%, transparent 34%, rgba(4, 5, 9, 0.34) 82%),
    url('/colony/antforge-reference-colony.webp') !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
```

Keep `ant-colony-diorama.svg` in the repository as the fallback asset; do not delete it.

- [ ] **Step 5: Commit the owned asset**

```bash
git add web/public/colony/antforge-reference-colony.webp web/src/visual-assets.css
git diff --cached --check
git commit -m "feat: localize AntForge colony artwork"
git push origin main
```

---

### Task 2: Recompose the truthful application shell

**Files:**
- Modify: `web/src/App.tsx`

- [ ] **Step 1: Preserve the composition root and business calls**

Before editing, verify these calls remain in `App` and must survive unchanged:

```bash
rg -n "createColonyDataSource|useSyncExternalStore|dataSource\.refresh|dataSource\.releaseSwarm|dataSource\.reset|switchChainAsync" web/src/App.tsx
```

Expected: all authority, refresh, release, reset, and network-switch paths are present.

- [ ] **Step 2: Simplify the header without losing truth**

Update `AppHeader` so it contains only:

```tsx
<header className="topbar">
  <a className="brand" href="#colony-stage" aria-label="AntForge home">
    {/* existing project-owned brand mark and bilingual brand copy */}
  </a>
  <p className="product-line">Autonomous swarm execution and settlement</p>
  <div className="topbar-actions">
    {/* existing mode, Runner, contract, and real wallet controls */}
  </div>
</header>
```

Do not add settings, notifications, avatar, static wallet, or a second decorative title.

- [ ] **Step 3: Make Mission Console content match real capability**

Keep the existing textarea and action functions, but change the primary-action helper copy from the AI cliché to truthful behavior:

```tsx
<small>
  {running
    ? "Agents are following contract events"
    : isLive
      ? "Fund three task-scoped rewards on Monad"
      : "Run the deterministic swarm simulation"}
</small>
```

Keep the task preview fixed to Repair, Color, Story, Verify. Do not add Priority, Storage, dollars, or editable marketplace controls.

- [ ] **Step 4: Make the Colony Stage a semantic live graph**

Give the central section a stable anchor and accessible label:

```tsx
<section
  aria-label="AntForge live colony execution graph"
  className="colony-stage"
  id="colony-stage"
>
```

Retain the six real nodes, `PheromoneNetwork`, state-derived status pills, Worker IDs, MON reward values, and real transaction links. Change chamber proof links to point directly to Explorer when both `transactionHash` and `explorerUrl` exist; otherwise render non-interactive truthful fallback copy.

Pass `snapshot.explorerUrl` into `TaskChamber` rather than using `href="#evidence"`.

- [ ] **Step 5: Remove decorative fake metric sparklines**

Change `MetricCard` to render only the real icon, label, and value:

```tsx
function MetricCard({ icon, label, tone, value }: MetricCardProps) {
  return (
    <div className="metric-card">
      <span className={`metric-icon metric-${tone}`}>{icon}</span>
      <span><small>{label}</small><strong>{value}</strong></span>
    </div>
  );
}
```

The five values remain derived from `snapshot`, `events`, and `tasks`; do not create trend data.

- [ ] **Step 6: Keep events and proof lanes honest**

Retain `EventRow` Explorer links only when both hash and Explorer base URL exist. Keep the empty event message. Proof lanes continue to read `snapshot.swarmLane`, `snapshot.skillGuardLane`, and `snapshot.conflictLane` without synthesizing success.

- [ ] **Step 7: Run compile and lint checks**

Run:

```bash
cd web
npm run lint
npm run build
```

Expected: both exit 0. If `tsc -b` emits only attributable `.tsbuildinfo` or compiled config artifacts, remove only those newly generated ephemeral files before continuing.

- [ ] **Step 8: Commit the shell recomposition**

```bash
git add web/src/App.tsx
git diff --cached --check
git commit -m "refactor: clarify AntForge operations shell"
git push origin main
```

---

### Task 3: Rebuild the desktop hierarchy and state styling

**Files:**
- Modify: `web/src/App.css`
- Modify: `web/src/visual-assets.css`
- Modify: `web/src/image-assets.css`
- Modify: `web/src/index.css`

- [ ] **Step 1: Replace the root token layer**

At the top of `App.css`, define the approved semantic tokens from `DESIGN.md`, including:

```css
:root {
  --surface-root: #080910;
  --surface-panel: #11131b;
  --surface-raised: #171923;
  --surface-inset: #0b0d14;
  --border-subtle: rgba(190, 181, 218, 0.14);
  --border-strong: rgba(183, 157, 255, 0.34);
  --text-primary: #f5f3f8;
  --text-secondary: #bbb6c7;
  --text-muted: #817b8f;
  --monad: #836ef9;
  --monad-soft: #b9a8ff;
  --success: #55d69e;
  --warning: #e5b85f;
  --danger: #f06f79;
  --info: #72cde3;
  --mono: "SFMono-Regular", "Cascadia Code", "Liberation Mono", monospace;
}
```

Map legacy variable names to the new tokens only where needed during the transition; do not scatter duplicate raw colors through components.

- [ ] **Step 2: Establish the roadshow grid**

Implement the desktop shell:

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: 300px minmax(640px, 1fr) 300px;
  grid-template-rows: minmax(0, 1fr) 112px;
  gap: 12px;
  height: calc(100dvh - 64px);
  padding: 12px;
}
```

The Mission and Evidence rails span both rows. The central stage and Workflow occupy the middle column. Use `min-height: 0` on nested grid/flex children so event scrolling does not grow the page.

- [ ] **Step 3: Raise the readable type floor**

Update critical labels and values so:

```css
.panel-kicker,
.field-label,
.metric-card small,
.event-section-heading span,
.chamber-title small,
.chamber-meta small {
  font-size: 11px;
}

.goal-input,
.event-copy p,
.metric-card strong,
.chamber-meta strong,
.workflow-step small,
.mini-lane strong {
  font-size: 12px;
}

.panel-heading h2 {
  font-size: 19px;
}
```

No critical Mission, Colony, Workflow, or Evidence text may remain at 5–8px. Decorative source attribution may be 10px but must stay legible.

- [ ] **Step 4: Convert the stage overlays into compact labels**

Use the reference image as the large chamber storytelling layer. Restyle `.task-chamber`, `.guard-chamber`, and `.treasury-chamber` as compact high-contrast overlays rather than opaque cards. Keep rewards and Worker data legible, but reduce decorative previews so they do not cover the artwork.

Node positioning must map to the artwork:

```css
.queen-position { left: 50%; top: 14%; }
.repair-position { left: 25%; top: 29%; }
.color-position { left: 74%; top: 29%; }
.story-position { left: 24%; top: 68%; }
.guard-position { left: 25%; top: 50%; }
.treasury-position { left: 74%; top: 50%; }
.rogue-position { left: 72%; top: 82%; }
```

Fine-tune only after browser inspection. The final acceptance criterion is no overlap among real overlays at the required desktop viewports.

- [ ] **Step 5: Reduce visual noise and preserve semantic color**

Remove static fake sparklines, excessive chamber ant decals, and ambient ants that compete with the background. Keep route ants only when `PheromoneNetwork` marks a route active. Use green solely for settled/online/success, gold for MON, red for failed/rejected, and purple for network/active execution.

- [ ] **Step 6: Resolve CSS cascade conflicts**

Because `main.tsx` loads `App.css`, `visual-assets.css`, then `image-assets.css`, inspect the final cascade. Remove or narrow any `!important` rule in `visual-assets.css` or `image-assets.css` that silently undoes the new grid, stage, node sizing, or type scale.

Run:

```bash
rg -n "!important|font-size: [5-8]px|metric-sparkline" web/src/App.css web/src/visual-assets.css web/src/image-assets.css
```

Expected: only justified asset-layer overrides remain; no critical 5–8px typography and no sparkline styles remain.

- [ ] **Step 7: Run static checks**

```bash
cd web
npm run lint
npm run build
```

Expected: both exit 0.

- [ ] **Step 8: Commit the desktop visual system**

```bash
git add web/src/App.css web/src/visual-assets.css web/src/image-assets.css web/src/index.css
git diff --cached --check
git commit -m "feat: rebuild AntForge colony dashboard hierarchy"
git push origin main
```

---

### Task 4: Responsive, accessibility, and interaction hardening

**Files:**
- Modify: `web/src/App.tsx`
- Modify: `web/src/App.css`
- Modify: `web/src/visual-assets.css`
- Modify: `web/src/index.css`

- [ ] **Step 1: Implement the desktop-to-document breakpoint**

At widths below 1180px, switch from three-column cockpit to a vertical flow:

```css
@media (max-width: 1180px) {
  body { overflow: auto; }
  .antforge-app { overflow: visible; }
  .dashboard-grid {
    display: flex;
    height: auto;
    flex-direction: column;
  }
  .mission-panel { order: 1; }
  .colony-stage { order: 2; min-height: 680px; }
  .workflow-console { order: 3; }
  .evidence-sidebar { order: 4; }
}
```

Do not preserve three columns by shrinking text.

- [ ] **Step 2: Implement the mobile layout**

At 640px and below:

```css
@media (max-width: 640px) {
  .topbar { min-height: 60px; height: auto; padding: 10px 12px; }
  .product-line,
  .contract-chip,
  .topbar .status-badge:not(:first-child) { display: none; }
  .dashboard-grid { padding: 8px; }
  .goal-input { min-height: 120px; font-size: 16px; }
  .colony-stage {
    min-height: 760px;
    overflow-x: auto;
    background-size: auto 100% !important;
  }
  .workflow-steps,
  .proof-lanes { grid-template-columns: 1fr; }
}
```

Every button and icon-button hit area is at least 44×44px. The page must have no horizontal body overflow.

- [ ] **Step 3: Add accessibility structure**

Add a skip link before the header:

```tsx
<a className="skip-link" href="#colony-stage">Skip to colony status</a>
```

Ensure icon-only refresh has `aria-label`, event updates retain `aria-live="polite"`, the action error retains `role="alert"`, the current mode has readable text, and state pills include text rather than color alone.

- [ ] **Step 4: Harden focus, disabled, and reduced-motion states**

Use visible `:focus-visible` rings, `cursor: not-allowed` for disabled controls, press feedback, and 160–280ms transitions. In the reduced-motion query, disable route motion, Queen breathing, spinner rotation where a static loading label is present, and ambient image movement.

- [ ] **Step 5: Run the Impeccable mechanical detector once**

Run only after UI edits are complete:

```bash
node /home/neo/.hermes/skills/creative/impeccable/scripts/detect.mjs --json \
  web/src/App.tsx \
  web/src/App.css \
  web/src/index.css \
  web/src/visual-assets.css \
  web/src/image-assets.css
```

Expected: no critical findings for inaccessible controls, fake content, unreadable type, or decorative-only motion. Fix material findings before continuing; do not run the detector a second time.

- [ ] **Step 6: Run static checks**

```bash
cd web
npm run lint
npm run build
```

Expected: both exit 0.

- [ ] **Step 7: Commit responsive hardening**

```bash
git add web/src/App.tsx web/src/App.css web/src/index.css web/src/visual-assets.css web/src/image-assets.css
git diff --cached --check
git commit -m "fix: harden AntForge responsive dashboard"
git push origin main
```

---

### Task 5: Browser acceptance and finish review

**Files:**
- Verify: `web/dist/*`
- Update if rendered tokens drift: `DESIGN.md`

- [ ] **Step 1: Build production output**

```bash
cd web
npm run lint
npm run build
```

Expected: lint and production build exit 0.

- [ ] **Step 2: Start the production preview on a verified free port**

```bash
cd web
npm run preview -- --host 0.0.0.0 --port 4173
```

Run it as a tracked background process. Verify `curl -fsS http://127.0.0.1:4173/` returns 200 and the page title is `AntForge on Monad` before inspecting.

- [ ] **Step 3: Verify roadshow desktop viewports**

Inspect at 1440×900, 1440×1080, and 1920×1080. For each viewport verify:

- header stays on one row;
- Mission input, primary action, six real nodes, Workflow, five evidence metrics, and event feed are visible;
- no real node overlaps another;
- no critical text requires browser zoom;
- the reference image does not produce duplicate labels that obscure React state;
- mode, Runner, contract, and wallet controls remain truthful;
- body has no overflow in the one-screen roadshow view.

- [ ] **Step 4: Verify mobile and reduced motion**

Inspect a 375×812 viewport. Verify single-column order Mission → Colony → Workflow → Evidence, 44px controls, 16px textarea text, no horizontal body overflow, and readable states. Emulate Reduced Motion and verify decorative movement is disabled.

- [ ] **Step 5: Exercise the Mock workflow**

Use Mock Mode and click `Release the swarm`. Verify the real Snapshot-driven sequence renders:

```text
open → claimed → submitted → settled
```

Confirm events appear without transaction hashes, Demo Mode remains visible, and no UI copy claims MON moved.

- [ ] **Step 6: Inspect Live read-only state**

Load Live Mode without sending a transaction. Verify the page reads the configured Monad Testnet contract, displays real events and Explorer links where available, and shows real errors instead of Mock fallback. Do not trigger `Create live colony` during automated acceptance because it is side-effectful and requires wallet consent plus real MON.

- [ ] **Step 7: Check console and dead-link boundaries**

Verify browser console has no blocking errors. Scope scans to product source and exclude plans/generated output:

```bash
rg -n 'href="#"|googleusercontent|Active Ants|Total Rewards|Priority|Storage Chamber' \
  web/src web/public \
  --glob '!dist/**' --glob '!node_modules/**'
```

Expected: no dead link, remote reference, or forbidden fake feature copy in product source.

- [ ] **Step 8: Run independent finish review**

Dispatch a fresh reviewer with the original request, approved spec, `PRODUCT.md`, `DESIGN.md`, changed UI paths, and desktop/mobile screenshots. Fix Critical and Important findings, then rerun lint, build, and affected browser checks.

- [ ] **Step 9: Synchronize exact tokens if the build changed them**

If final browser iteration altered durable tokens, spacing, breakpoints, or component rules, update `DESIGN.md` to match the shipped implementation. Do not document transient one-off values.

- [ ] **Step 10: Final repository verification and commit**

```bash
pwd
git rev-parse --show-toplevel
git remote -v
git status --short --branch --untracked-files=all
git diff --check
git add DESIGN.md web/src/App.tsx web/src/App.css web/src/index.css web/src/visual-assets.css web/src/image-assets.css web/public/colony/antforge-reference-colony.webp
git diff --cached --check
git commit -m "feat: complete AntForge frontend fusion redesign"
git push origin main
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
test "$LOCAL" = "$REMOTE"
git status --short --branch --untracked-files=all
```

Expected: local and `origin/main` SHAs match and the worktree is clean.
