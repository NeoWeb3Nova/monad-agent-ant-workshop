# AntForge Targeted Colony Artwork Redaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace AntForge’s globally blurred Colony Stage backdrop with a deterministic, locally redacted derivative that keeps the underground scene sharp without exposing baked synthetic UI or values.

**Architecture:** Keep the immutable source asset and generate the production WebP through Pillow. Build a source-coordinate grayscale mask from explicit rounded regions, feather it, and composite a locally blurred/darkened layer only through that mask; leave the central tunnel and organic scene untouched before encoding. CSS supplies only a light global tint/vignette, while React remains the sole source of visible state and evidence.

**Tech Stack:** Python 3, Pillow 12.1.1, WebP, React 19, CSS, Vite 8, oxlint, Playwright/Chromium acceptance scripts.

**Specification:** `docs/superpowers/specs/2026-07-28-antforge-targeted-colony-art-redaction.md`

**TDD note:** `AGENTS.md` explicitly waives strict TDD for this hackathon frontend. Use deterministic script assertions, reproducibility checks, lint/build, rendered screenshots, DOM geometry checks, and visual review instead of blocking delivery on a new test framework.

---

## File map

- Modify `web/scripts/prepare-colony-art.py`: own fixed mask regions, feathering, localized pixel treatment, deterministic encoding, source/output hashes, and internal invariants.
- Modify `web/public/colony/antforge-reference-colony.webp`: generated production derivative only; never hand-edit it.
- Preserve `web/public/colony/antforge-reference-colony-source.webp`: immutable authority asset.
- Modify `web/src/visual-assets.css`: retain a light global tint/vignette and foreground ordering; never use whole-artwork blur or coordinate redaction.
- Modify `PRODUCT.md`: document the new output hash and transformation truthfully.
- Modify `DESIGN.md`: replace the global-blur contract with targeted-redaction rules and exact parameters.
- Do not modify `contracts/`, `agents/`, `web/src/domain.ts`, `web/src/data/`, or `web/src/abi/`.

---

### Task 0: Design and repository lock

**Files:**
- Read: `AGENTS.md`
- Read: `PRODUCT.md`
- Read: `DESIGN.md`
- Read: `docs/superpowers/specs/2026-07-28-antforge-targeted-colony-art-redaction.md`
- Read: `web/scripts/prepare-colony-art.py`
- Read: `web/src/visual-assets.css`

- [ ] **Step 1: Create an isolated implementation worktree**

Load `superpowers:using-git-worktrees`, then create a branch/worktree named `feature/targeted-colony-art-redaction` from the current `main`.

- [ ] **Step 2: Verify repository identity and clean baseline**

Run from the new worktree:

```bash
pwd
git rev-parse --show-toplevel
git remote -v
git status --short --branch --untracked-files=all
git rev-parse HEAD
git rev-parse origin/main
```

Expected: the worktree belongs to `NeoWeb3Nova/monad-agent-ant-workshop`, the branch is `feature/targeted-colony-art-redaction`, and no unrelated changes exist.

- [ ] **Step 3: Lock design constraints before editing**

Record these non-negotiable checks in the execution notes:

```text
Operate-mode evidence cockpit; preserve current layout and React state.
No global artwork blur.
No readable baked balances, counts, charts, controls, or statuses.
No generic AI gradients, reward-farm neon, glass-card redesign, or page-structure changes.
Central tunnel, Queen crystal, cave walls, chamber boundaries, and ants remain sharp.
```

- [ ] **Step 4: Capture baseline assets and build health**

Run:

```bash
sha256sum \
  web/public/colony/antforge-reference-colony-source.webp \
  web/public/colony/antforge-reference-colony.webp
python3 web/scripts/prepare-colony-art.py
cd web
npm run lint
npm run build
```

Expected baseline hashes:

```text
394b6bb0e47c40449131fbe29a515c49ba01394a2aa3b7e9b412bbd8c6ec7ab5  web/public/colony/antforge-reference-colony-source.webp
7505f01f42226160e20ebf214b03dc468a43ae79fb9b85567c199ba984134566  web/public/colony/antforge-reference-colony.webp
```

Expected: the current script reproduces the existing derivative byte-for-byte; lint and build exit `0`.

---

### Task 1: Implement deterministic targeted redaction

**Files:**
- Modify: `web/scripts/prepare-colony-art.py`
- Generate: `web/public/colony/antforge-reference-colony.webp`

- [ ] **Step 1: Replace global-processing constants with mask constants**

Use these source-coordinate regions as the first deterministic mask definition:

```python
from dataclasses import dataclass
from PIL import Image, ImageDraw, ImageFilter, ImageChops

@dataclass(frozen=True)
class RedactionRegion:
    name: str
    box: tuple[int, int, int, int]
    radius: int

REDACTION_REGIONS = (
    RedactionRegion("image-chamber", (18, 18, 224, 132), 18),
    RedactionRegion("queen-label", (216, 66, 302, 99), 10),
    RedactionRegion("llm-chamber", (322, 18, 506, 133), 18),
    RedactionRegion("guard-chamber", (12, 133, 242, 249), 18),
    RedactionRegion("treasury-chamber", (322, 134, 508, 261), 18),
    RedactionRegion("storage-chamber", (10, 250, 250, 356), 18),
    RedactionRegion("scout-label", (278, 272, 392, 311), 12),
    RedactionRegion("worker-label", (393, 272, 511, 311), 12),
)

LOCAL_BLUR_RADIUS = 6
MASK_FEATHER_RADIUS = 8
BLEND_COLOR = "#080910"
LOCAL_BLEND_AMOUNT = 0.62
WEBP_QUALITY = 90
WEBP_METHOD = 6
```

The Queen mask must stay below the crystal; Scout/Worker masks must stay above the ants.

- [ ] **Step 2: Add a deterministic feathered-mask builder**

Implement this interface:

```python
def build_redaction_mask() -> Image.Image:
    mask = Image.new("L", EXPECTED_SIZE, 0)
    draw = ImageDraw.Draw(mask)
    for region in REDACTION_REGIONS:
        draw.rounded_rectangle(region.box, radius=region.radius, fill=255)
    return mask.filter(ImageFilter.GaussianBlur(radius=MASK_FEATHER_RADIUS))
```

Add assertions that:

```python
mask = build_redaction_mask()
assert mask.mode == "L"
assert mask.size == EXPECTED_SIZE
assert mask.getpixel((256, 36)) == 0       # Queen crystal remains clear
assert mask.getpixel((256, 120)) == 0      # central tunnel remains clear
assert mask.getpixel((256, 220)) == 0      # central tunnel remains clear
assert mask.getpixel((335, 330)) == 0      # Scout ants remain clear
assert mask.getpixel((455, 330)) == 0      # Worker ants remain clear
assert mask.getpixel((70, 42)) > 0         # Image title is redacted
assert mask.getpixel((370, 42)) > 0        # LLM title is redacted
assert mask.getpixel((382, 218)) > 0       # Treasury values/chart are redacted
```

If feathering causes a protected point to become nonzero, tighten the adjacent region rather than deleting the protected-point assertion.

- [ ] **Step 3: Composite only through the mask**

Implement:

```python
def build_backdrop(source: Image.Image) -> Image.Image:
    mask = build_redaction_mask()
    local_blur = source.filter(ImageFilter.GaussianBlur(radius=LOCAL_BLUR_RADIUS))
    local_redaction = Image.blend(
        local_blur,
        Image.new("RGB", EXPECTED_SIZE, BLEND_COLOR),
        LOCAL_BLEND_AMOUNT,
    )
    backdrop = Image.composite(local_redaction, source, mask)
    assert backdrop.mode == "RGB"
    assert backdrop.size == EXPECTED_SIZE
    return backdrop
```

Before WebP encoding, prove fully unmasked source pixels are unchanged:

```python
mask = build_redaction_mask()
difference = ImageChops.difference(source, backdrop)
outside_selector = mask.point(lambda value: 255 if value == 0 else 0)
outside = Image.composite(
    difference,
    Image.new("RGB", EXPECTED_SIZE),
    outside_selector,
)
assert outside.getbbox() is None
```

This assertion tests only fully unmasked pixels where mask value is exactly `0`; do not weaken it into a no-op.

- [ ] **Step 4: Generate and pin the new output hash**

Temporarily print the computed hash, run the script once, then set `OUTPUT_SHA256` to that exact value and rerun:

```bash
python3 web/scripts/prepare-colony-art.py
sha256sum web/public/colony/antforge-reference-colony.webp
python3 web/scripts/prepare-colony-art.py
sha256sum web/public/colony/antforge-reference-colony.webp
```

Expected: both final hashes are identical, and the script’s `OUTPUT_SHA256` assertion passes. Do not invent or manually type a plausible hash; use the real generated value.

- [ ] **Step 5: Inspect the derivative before continuing**

Load both files with `vision_analyze`:

```text
web/public/colony/antforge-reference-colony-source.webp
web/public/colony/antforge-reference-colony.webp
```

Acceptance:

- Queen crystal, central spine, rock edges, chamber boundaries, and visible ants are sharp;
- all eight baked UI regions are unreadable;
- no hard rectangular mask edges are visible;
- no source value such as `1,248.65 MON`, `$2,172.86`, `428`, `1.2K`, `2.45 GB`, `6 Exploring`, or `22 Processing` remains legible.

If any synthetic text remains readable, adjust only the implicated region, feather, local blur, or local blend. Regenerate and repeat this visual check; do not restore global blur.

- [ ] **Step 6: Commit the asset transformation**

```bash
git status --short --branch --untracked-files=all
git diff --check
git add -- web/scripts/prepare-colony-art.py web/public/colony/antforge-reference-colony.webp
git diff --cached --check
git commit -m "fix: preserve sharp colony artwork"
```

Expected staged scope: exactly the generator and generated derivative. The immutable source must not change.

---

### Task 2: Lighten global atmosphere and synchronize design truth

**Files:**
- Modify: `web/src/visual-assets.css`
- Modify: `PRODUCT.md`
- Modify: `DESIGN.md`

- [ ] **Step 1: Reduce the global CSS tint without changing layout**

Keep the artwork background order and `background-size: cover`. Replace only the tint strengths with:

```css
.colony-canvas {
  background-image:
    linear-gradient(180deg, rgba(8, 9, 16, 0.06), rgba(8, 9, 16, 0.18)),
    radial-gradient(circle at 50% 46%, transparent 48%, rgba(8, 9, 16, 0.2) 100%),
    url('/colony/antforge-reference-colony.webp'),
    url('/colony/ant-colony-diorama.svg');
}
```

Keep `.colony-canvas::after` as a light atmospheric overlay and keep foreground card `backdrop-filter: blur(3px)`. That card-local blur is permitted because it protects text contrast; do not apply blur to `.colony-canvas` or its artwork layer.

- [ ] **Step 2: Update `PRODUCT.md` with exact generated evidence**

Replace the global-blur description with the real source hash, real output hash, Pillow version, `REDACTION_REGIONS`, `LOCAL_BLUR_RADIUS`, `MASK_FEATHER_RADIUS`, `LOCAL_BLEND_AMOUNT`, WebP quality, and method from the final script.

State explicitly:

```text
The production derivative uses fixed source-coordinate feathered masks over baked synthetic UI. Organic cave pixels and the central tunnel are not globally blurred; CSS adds only a light tint/vignette.
```

- [ ] **Step 3: Update `DESIGN.md` component and artwork rules**

Change “pixel-redacted production artwork” to “target-redacted sharp production artwork” and replace the exact global-blur paragraph with the final local-mask parameters and output hash.

Retain these constraints:

```text
React is the only visible authority for task and chain state.
CSS never owns chamber-coordinate redaction.
No source-image fake value may remain readable.
```

- [ ] **Step 4: Run static checks and the Impeccable detector once**

Run:

```bash
cd web
npm run lint
npm run build
cd ..
git diff --check
node /home/neo/.hermes/skills/creative/impeccable/scripts/detect.mjs --json \
  web/src/visual-assets.css PRODUCT.md DESIGN.md
```

Expected: lint/build exit `0`, `git diff --check` is clean, and the detector reports no blocking finding. Investigate real detector findings; do not add suppressions for introduced defects.

- [ ] **Step 5: Commit CSS and documentation truth**

```bash
git add -- web/src/visual-assets.css PRODUCT.md DESIGN.md
git diff --cached --check
git commit -m "docs: document targeted colony redaction"
```

Expected staged scope: exactly the CSS and two design-truth documents.

---

### Task 3: Rendered desktop, mobile, and truth-boundary acceptance

**Files:**
- Verify: `web/src/App.tsx`
- Verify: `web/src/App.css`
- Verify: `web/src/visual-assets.css`
- Verify: `web/public/colony/antforge-reference-colony.webp`
- Do not commit temporary screenshots or Playwright scripts.

- [ ] **Step 1: Build independent Live and Mock production outputs**

Run Live from the normal environment and build Mock explicitly:

```bash
cd web
npm run build
VITE_DATA_MODE=mock npx vite build --outDir /tmp/antforge-targeted-redaction-mock --emptyOutDir
npm run preview -- --host 0.0.0.0 --port 4173
npx vite preview --host 0.0.0.0 --port 4174 --outDir /tmp/antforge-targeted-redaction-mock
```

Track preview servers through Hermes background processes and stop them after acceptance.

- [ ] **Step 2: Capture required screenshots**

Use Playwright/Chromium to capture:

```text
/tmp/antforge-targeted-redaction/live-1440x900.png
/tmp/antforge-targeted-redaction/live-1440x1080.png
/tmp/antforge-targeted-redaction/live-1920x1080.png
/tmp/antforge-targeted-redaction/live-375x812-reduced.png
/tmp/antforge-targeted-redaction/mock-settled-1440x900.png
```

For every viewport collect body overflow, node rectangles, critical leaf-text clipping, console errors, failed responses, running animations, and current mode.

- [ ] **Step 3: Verify geometry and accessibility**

Expected:

```text
desktop body overflowX = 0
desktop body overflowY = 0
six colony nodes
zero node-pair overlaps
mobile body overflowX = 0
mobile Colony Stage internal width = 680px
mobile textarea font-size = 16px
no critical control below 44px
Reduced Motion running nonessential animations = 0
critical-text clipping results = []
console errors = []
```

- [ ] **Step 4: Verify Mock and Live truth boundaries**

Mock must still show:

```text
Demo Mode
No MON moved in Demo Mode
open → claimed → submitted → settled
no Explorer transaction links for mock tasks
```

Live empty state must still show:

```text
Monad Testnet
NO TASK
Reward / Worker = —
Not created onchain
No tasks
explicit empty/no-events state
real contract Explorer link only
```

Inspect every screenshot for leaked baked source values. Any readable old chamber label, fake MON/USD amount, count, chart label, or storage statistic is blocking.

- [ ] **Step 5: Perform side-by-side visual review**

Compare the new screenshots with the pre-change screenshots and source asset. Approve only if:

- the underground colony and central tunnel are materially clearer;
- synthetic regions recede behind real React cards;
- foreground text contrast remains adequate;
- localized redaction does not look like black rectangles;
- mobile scrolling does not reveal unredacted source UI.

- [ ] **Step 6: Stop preview processes and run final branch checks**

```bash
git status --short --branch --untracked-files=all
git diff main...HEAD --check
git diff --quiet main...HEAD -- contracts agents web/src/domain.ts web/src/data web/src/abi
```

Expected: worktree clean, diff check passes, and forbidden scope is unchanged.

---

### Task 4: Review, integrate, and publish

**Files:**
- Review the entire `main...feature/targeted-colony-art-redaction` range.

- [ ] **Step 1: Run specification review**

Dispatch a read-only reviewer against:

```text
docs/superpowers/specs/2026-07-28-antforge-targeted-colony-art-redaction.md
PRODUCT.md
DESIGN.md
implementation diff
asset hashes
source/derivative images
required desktop/mobile screenshots
browser measurements
```

Expected: `READY` with zero Critical/Important findings. Fix any Critical/Important issue and rerun the review.

- [ ] **Step 2: Run independent quality/security review**

Review deterministic generation, masks, image quality, accessibility, truth boundaries, asset provenance, diff hygiene, and forbidden scope.

Expected: `APPROVED` with zero Critical/Important findings. Fix any Critical/Important issue and rerun both review gates if product behavior changes.

- [ ] **Step 3: Fast-forward into `main`**

From the primary worktree:

```bash
git fetch origin main
git status --short --branch --untracked-files=all
git merge --ff-only feature/targeted-colony-art-redaction
```

Expected: clean fast-forward with no merge commit.

- [ ] **Step 4: Reverify the merged result**

Run from merged `main`:

```bash
cd web
npm run lint
npm run build
cd ..
python3 web/scripts/prepare-colony-art.py
git diff --check
git status --short --branch --untracked-files=all
```

Repeat the key 1440×900 Live, 375×812 Reduced Motion, and Mock settled screenshot checks against merged `main`.

- [ ] **Step 5: Push and prove remote equality**

```bash
git push origin main
git fetch origin main
git rev-parse HEAD
git rev-parse origin/main
git ls-remote --heads origin main
git status --short --branch --untracked-files=all
```

Expected: all three SHA values are identical and status is `main...origin/main`.

- [ ] **Step 6: Clean the isolated worktree**

After proving the worktree is clean and merged:

```bash
git worktree remove .worktrees/targeted-colony-art-redaction
git worktree prune
git branch -d feature/targeted-colony-art-redaction
git worktree list --porcelain
git status --short --branch --untracked-files=all
```

Expected: only the primary worktree remains and `main` is clean.
