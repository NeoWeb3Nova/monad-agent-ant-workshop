# AntForge Five-Slide Roadshow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify a five-slide, speaker-led, animated HTML roadshow deck for AntForge using the approved “Ant Colony Battle Map” design.

**Architecture:** Create one independent HTML file with inline CSS, JavaScript, and Data URL project artwork. A fixed 1920×1080 stage contains exactly five stacked `.slide` sections; a small controller handles stage scaling, navigation, progress, reduced motion, URL hashes, and inline editing. The deck reads no application state and does not modify the Web App, Agent Runner, or contracts.

**Tech Stack:** Semantic HTML5, CSS3, vanilla JavaScript, embedded WebP/SVG assets, Playwright-compatible browser verification.

---

## File Map

- Create: `docs/09-antforge-ant-colony-roadshow.html` — complete five-slide presentation and runtime.
- Reference only: `docs/superpowers/specs/2026-07-25-antforge-five-slide-roadshow-design.md` — approved content and visual constraints.
- Reference only: `docs/04-monad-testnet-evidence.md` — contract, network, transaction, and final-state facts.
- Reference only: `web/public/branding/antforge-queen-core.webp` — Queen visual embedded into the HTML.
- Reference only: `web/public/ants/ant-worker.svg`, `ant-guard.svg`, `ant-rogue.svg` — role visuals embedded into the HTML.
- Preserve untouched: `docs/08-antforge-3min-roadshow.html` — pre-existing untracked file outside this implementation.

## Task 0: Design System Lock

**Files:**
- Read: `docs/superpowers/specs/2026-07-25-antforge-five-slide-roadshow-design.md`

- [ ] Confirm the product register is a live hackathon roadshow deck, not a reusable product dashboard.
- [ ] Lock the palette to obsidian/deep sand, sand-gold paths, Monad purple events, restrained green settlement, and red failure states.
- [ ] Lock typography to a distinctive Latin display face, a readable Chinese body face, and a mono evidence face from Google Fonts.
- [ ] Preserve the anti-references: no generic purple-on-white gradient, reward-farm neon, decorative glassmorphism, emoji structure icons, oversized rounded cards, or unrelated particles.
- [ ] Use imagery only when it explains Queen, Worker, Guard, Rogue, task paths, or settlement.

## Task 1: Build the Single-File Deck

**Files:**
- Create: `docs/09-antforge-ant-colony-roadshow.html`

- [ ] Embed the complete `viewport-base.css` fixed-stage rules in the presentation stylesheet.
- [ ] Define theme tokens, Chinese-safe typography, atmospheric sand layers, task tunnels, role markers, status nodes, proof rows, and navigation chrome.
- [ ] Embed the Queen, Worker, Guard, and Rogue artwork as Data URLs so the final deck remains a single file.
- [ ] Implement exactly five sections with the approved content:
  1. `一个目标，唤醒一支蚁群`
  2. `会生成，不等于会协作`
  3. `一笔交易，唤醒整座蚁穴`
  4. `把可并行的任务分开，把必须排他的冲突留下`
  5. `不是承诺，是链上回执`
- [ ] Keep slide 3’s truth boundary explicit: deterministic mock outputs versus live on-chain identity, escrow, state, receipts, and MON settlement.
- [ ] Keep slide 5 facts aligned with `docs/04-monad-testnet-evidence.md`: Chain ID `10143`, contract `0x028268f8fF62edc596f931E17E2Fb21015f5b0A2`, Sourcify `exact_match`, and final state `Settled / rewards 0 / balance 0`.
- [ ] Add `SlidePresentation` with uniform 1920×1080 scaling, arrows, Space, Page Up/Down, wheel throttling, touch swipes, buttons, page count, progress bar, and hash navigation.
- [ ] Add `InlineEditor` with `E` shortcut, top-left hover hotzone using a 400 ms grace period, `contenteditable`, localStorage persistence, and `Ctrl/Cmd+S` saving.
- [ ] Add `prefers-reduced-motion` support and semantic labels.

## Task 2: Run Static Contract Checks

**Files:**
- Test: `docs/09-antforge-ant-colony-roadshow.html`

- [ ] Parse the HTML with Python and assert:
  - exactly five `.slide` sections;
  - one active slide at startup;
  - the stage is 1920×1080;
  - no `display: none` slide switching;
  - all required chain facts and truth-boundary terms exist;
  - no local `src` asset paths remain.
- [ ] Run `git diff --check` and confirm no whitespace errors.

Run:

```bash
python - <<'PY'
from pathlib import Path
from html.parser import HTMLParser
p = Path('docs/09-antforge-ant-colony-roadshow.html')
text = p.read_text()
class Slides(HTMLParser):
    def __init__(self):
        super().__init__(); self.slides = 0; self.active = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs); classes = a.get('class', '').split()
        if tag == 'section' and 'slide' in classes:
            self.slides += 1
            self.active += int('active' in classes)
s = Slides(); s.feed(text)
assert (s.slides, s.active) == (5, 1)
for needle in ['width: 1920px', 'height: 1080px', '10143', '0x028268f8fF62edc596f931E17E2Fb21015f5b0A2', 'exact_match', 'deterministic mock', 'LIVE']:
    assert needle in text, needle
assert 'src="web/' not in text and 'src="../' not in text
print('PASS: 5 slides, fixed stage, embedded assets, evidence present')
PY
git diff --check
```

Expected: `PASS: 5 slides, fixed stage, embedded assets, evidence present` and no diff-check output.

## Task 3: Browser and Visual Verification

**Files:**
- Test: `docs/09-antforge-ant-colony-roadshow.html`

- [ ] Serve the repository locally with `python -m http.server 4173`.
- [ ] Open `http://127.0.0.1:4173/docs/09-antforge-ant-colony-roadshow.html` in a browser.
- [ ] Verify slide navigation from 1 through 5 and back with buttons and keyboard.
- [ ] Inspect all five slides at a 1280×720 viewport for text clipping, overflow, panel overlap, broken imagery, and illegible contrast.
- [ ] Inspect at least the cover and mechanism slide at a phone viewport to confirm letterboxing without content reflow.
- [ ] Read browser console output and require zero uncaught JavaScript errors.
- [ ] Test `E` editing mode and confirm editable text toggles without breaking slide navigation.
- [ ] Stop the local server after verification.

## Task 4: Final Repository Verification and Commit

**Files:**
- Add: `docs/09-antforge-ant-colony-roadshow.html`
- Preserve: `docs/08-antforge-3min-roadshow.html`

- [ ] Run repository identity and scope checks:

```bash
pwd
git rev-parse --show-toplevel
git remote -v
git status --short --branch --untracked-files=all
git diff --check
git diff --cached --check
```

- [ ] Stage only `docs/09-antforge-ant-colony-roadshow.html`.
- [ ] Commit with `docs: add AntForge colony roadshow deck`.
- [ ] Push `main` to `origin`.
- [ ] Confirm local and remote commit SHAs match and report the artifact path, slide count, navigation, editing shortcut, verification results, and untouched pre-existing untracked file.
