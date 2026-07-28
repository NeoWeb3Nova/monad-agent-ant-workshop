# AntForge Targeted Colony Artwork Redaction Design

Date: 2026-07-28
Status: Approved direction; awaiting written-spec review

## Problem

The current production colony artwork applies `GaussianBlur(radius=8)` to the entire 512×356 source and blends the result 50% with `#080910`. This reliably hides baked demo labels, numbers, controls, and charts, but it also destroys the cave walls, central tunnel, Queen crystal, ants, and depth cues that make the homepage visually distinctive.

Truthfulness requires synthetic source pixels to be unreadable. It does not require global blur.

## Decision

Replace global blur with deterministic, source-coordinate targeted redaction.

The immutable source remains:

- `web/public/colony/antforge-reference-colony-source.webp`

The production derivative remains:

- `web/public/colony/antforge-reference-colony.webp`

`web/scripts/prepare-colony-art.py` will generate the derivative by applying fixed, feathered masks only to baked synthetic UI. The central tunnel, cave walls, Queen crystal, ants, chamber boundaries, and ambient lighting remain sharp.

## Redaction regions

Masks operate at the intrinsic 512×356 source size and must cover every readable synthetic label, number, chart, and control in these source regions:

1. Image Chamber: title/status, thumbnails, footer previews, and controls in the upper-left chamber.
2. Queen Core: baked title and status below the crystal; the crystal itself remains unmasked.
3. LLM Chamber: title/status, code panels, thumbnails, and controls in the upper-right chamber.
4. Guard Chamber: title/status, shield UI, worker row, and footer controls in the middle-left chamber.
5. Treasury Chamber: title/status, balance, USD estimate, chart, and controls in the middle-right chamber.
6. Storage Chamber: title/status, shelves presented as storage UI, and bottom statistics in the lower-left chamber.
7. Scout Ants: baked heading and count in the lower-middle chamber.
8. Worker Ants: baked heading and processing count in the lower-right chamber.

The script owns the masks. CSS must not implement chamber-coordinate redaction, because responsive cropping and scaling make CSS masks brittle.

## Pixel treatment

Within each mask:

- use feathered edges so redaction does not read as a rectangular patch;
- suppress legibility through localized blur and dark color blending;
- preserve coarse chamber lighting and color rather than painting flat black boxes;
- leave source RGB unchanged outside the masks before final WebP encoding; normal deterministic encoding differences are allowed.

Global processing must not apply Gaussian blur. A light, uniform dark tint may be applied in CSS solely for foreground-card contrast, but must not erase scene detail.

The transformation remains reproducible:

- fixed Pillow version;
- immutable source SHA-256;
- fixed intrinsic dimensions;
- explicit mask coordinates and feathering parameters;
- fixed WebP quality and method;
- documented output SHA-256.

## Foreground and data truth

React remains the sole source of visible task, worker, reward, transaction, and network state. Existing Queen, Repair, Color, Story, Guard, and Treasury overlays continue to derive from `ColonySnapshot`.

The production backdrop must not expose source-image values such as fake MON balances, USD estimates, Agent counts, storage statistics, processing counts, charts, or baked chamber statuses in either Mock or Live mode.

No changes are permitted to:

- `contracts/`;
- `agents/`;
- `web/src/domain.ts`;
- `web/src/data/*`;
- `web/src/abi/*`.

## CSS treatment

`web/src/visual-assets.css` may retain only a global tint/vignette and foreground ordering. The tint must be visibly lighter than the current 50% source-level blend and must not use `filter: blur(...)` or `backdrop-filter: blur(...)` on the colony artwork.

Foreground nodes must retain current contrast, readable states, Explorer evidence behavior, and responsive geometry.

## Acceptance criteria

### Asset truth

- Source SHA-256 remains unchanged.
- The script regenerates the committed derivative byte-for-byte.
- Every baked synthetic label, number, chart, and control is unreadable in the derivative at native size and at supported rendered sizes.
- No unsupported synthetic value is visible behind or between React overlays.

### Visual quality

- The Queen crystal, central tunnel spine, cave walls, ants, and chamber boundaries are visibly sharper than the current globally blurred derivative.
- The scene reads as an underground colony rather than an abstract purple haze.
- Local redaction edges do not appear as hard rectangles or obvious coordinate masks.
- Foreground node text remains legible against the clearer image.

### Responsive and interaction regression

Verify at 1440×900, 1440×1080, 1920×1080, and 375×812:

- no page overflow regression;
- no node overlap regression;
- no clipped critical text;
- Colony Stage internal scrolling remains intact on mobile;
- Mock `open → claimed → submitted → settled` remains intact;
- Live empty state remains truthful;
- Reduced Motion continues to disable nonessential animation;
- browser console and network contain no blocking errors.

### Static gates

- `npm run lint` passes with zero warnings/errors;
- `npm run build` passes;
- `git diff --check` passes;
- the Impeccable detector runs once after the UI change is complete.

## Scope

Expected implementation files:

- `web/scripts/prepare-colony-art.py`;
- `web/public/colony/antforge-reference-colony.webp`;
- `web/src/visual-assets.css` if the global tint requires adjustment;
- `PRODUCT.md` and `DESIGN.md` for final transformation parameters and hashes.

Do not change page structure, data flow, task state, contracts, Agent behavior, or unrelated styling.
