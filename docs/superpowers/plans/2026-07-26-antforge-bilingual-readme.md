# AntForge Bilingual README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Chinese judge-first README with an English-primary, fully mirrored Chinese project homepage that persuades potential partners while preserving reproducible setup, honest Mock/Live boundaries, and verifiable Monad Testnet evidence.

**Architecture:** Keep the documentation surface deliberately small: `README.md` is the English source shown by GitHub, and `README.zh-CN.md` is a complete Chinese mirror with the same section order and facts. Both files reuse the existing product hero and link to deeper evidence and operator documents instead of duplicating every detail.

**Tech Stack:** GitHub Flavored Markdown, GitHub-compatible HTML, shields.io badges, Mermaid, Python 3 verification scripts, Git, Foundry, Node.js/npm, Monad JSON-RPC, browser verification.

---

## Scope and file map

- Modify: `README.md` — English primary project homepage.
- Create: `README.zh-CN.md` — complete Chinese mirror.
- Read only: `deployments/monad-testnet.json` — canonical network, contract, role, transaction, and browser-verification values.
- Read only: `web/package.json`, `agents/package.json`, `web/.env.example`, `agents/.env.example`, `contracts/.env.example`, `web/vite.config.ts` — canonical versions, scripts, configuration, and environment lookup behavior.
- Read only: `docs/04-monad-testnet-evidence.md`, `docs/07-frontend-demo-walkthrough.md` — deeper evidence and live operation links.
- Preserve untouched: `docs/08-antforge-3min-roadshow.html` — pre-existing untracked user file; never stage, edit, or delete it.

No product code, smart contract, runtime, frontend, deployment record, route, dependency, or asset changes are in scope.

## Content lock

Both READMEs must use this top-level order:

1. Hero and language selector
2. Product Thesis
3. Live Product
4. Why AntForge / Why Monad
5. Verifiable Onchain Proof
6. What Is Real
7. Architecture
8. Quick Start
9. Configuration
10. Security and Limitations
11. Built by Neo.Yun
12. From MVP to Agent Economy
13. Build With Us
14. Documentation
15. Contributing
16. Disclaimer

The following values are locked to repository evidence:

- Network: Monad Testnet, Chain ID `10143`.
- Contract: `0x028268f8fF62edc596f931E17E2Fb21015f5b0A2`.
- Deployment block: `47924433`.
- Deployment transaction: `0xf0567983d07c3a5811d603612defb71b188856b44db840b895e164e4f941a00c`.
- Source verification: MonadVision Sourcify `exact_match`.
- Public demo: `https://antforge-monad.vercel.app/`.
- Product hero: `docs/assets/antforge-product-hero.webp`.
- Live settlement / deterministic mock boundary: blockchain settlement is live; Queen planning and Agent image/text execution are deterministic mock.
- License: not declared; no MIT, Apache, or other license badge.
- Telegram: `https://t.me/neo_web3_nova`.
- Award evidence: OPC Agent Treasury received AI × Web3 School Agentic Hackathon track third place; link to `https://x.com/aiweb3school/status/2069726882988441643`.

---

### Task 1: Build the complete Chinese partner-facing README

**Files:**
- Create: `README.zh-CN.md`
- Reference: `README.md`
- Reference: `docs/superpowers/specs/2026-07-26-antforge-bilingual-readme-design.md`
- Reference: `deployments/monad-testnet.json`

- [ ] **Step 1: Re-check repository identity and working-tree ownership**

Run:

```bash
pwd
git rev-parse --show-toplevel
git remote -v
git status --short --branch --untracked-files=all
```

Expected:

- repository root is `/home/neo/workspace/projects/monad-agent-ant-workshop`;
- remote is `https://github.com/NeoWeb3Nova/monad-agent-ant-workshop.git`;
- `docs/08-antforge-3min-roadshow.html` remains untracked and untouched.

- [ ] **Step 2: Create the Chinese file from the current verified material**

Create `README.zh-CN.md` with the locked section order. Use the following exact positioning and content rules:

- Hero title: `AntForge on Monad`.
- Chinese positioning: `面向自治 Agent 蚁群的协作与结算层。`
- Supporting line: one Mission becomes a temporary workforce matched by skill, verified by a Guard, and settled in native MON.
- Primary buttons: Public Demo, Explorer, Onchain Evidence, English.
- Product thesis: contrast single-Agent selection with temporary, task-oriented machine workforces.
- Live Product: retain the mission → escrow → tasks → Workers → Guard → reward → withdrawal flow.
- Why Monad: one compact table containing Swarm Lane, Conflict Lane, Skill Guard, Deterministic IDs, Pull Settlement, and Pheromone Events.
- Proof: retain the contract/deployment table and the five-transaction Repair Worker vertical slice; keep the Conflict Lane reverted receipt and the Rogue Ant no-transaction explanation.
- Reality boundary: replace repeated prose with one `Live / Deterministic Mock / Future` table.
- Architecture: retain one compact ASCII architecture diagram and one responsibility table.
- Quick Start: preserve fresh-clone commands for full verification, Web Mock, Web Live, Runner, and contract deployment.
- Configuration: preserve public Web variables and private Agent variables in compact tables; state that Vite reads `web/.env` and Vercel uses tracked production defaults.
- Security: keep escrow, permissions, Pull Payment, refunds, reentrancy, private-key, testnet, audit, single-Guard, and license limitations.
- Founder module: include Neo.Yun’s avatar, positioning, four relevant proof points, and links without importing the profile README wholesale.
- Vision: use `Today / Next / Vision`; future capabilities must not read as delivered features.
- Partnership CTA: explicitly list Agent frameworks, verification/storage providers, Monad ecosystem projects, and Design Partners.

Use the GitHub avatar URL already exposed by the profile:

```html
<img src="https://avatars.githubusercontent.com/u/221855057?v=4" alt="Neo.Yun" width="88">
```

Use these contact links exactly:

```text
https://github.com/NeoWeb3Nova
https://amshe.fun
https://x.com/NeoWeb3Nova
https://www.youtube.com/@NeoWeb3Nova
https://t.me/neo_web3_nova
```

- [ ] **Step 3: Remove judge-first duplication without losing evidence**

Compare `README.zh-CN.md` with the current `README.md`. Ensure the Chinese version contains each unique technical fact only once, except the contract and Public Demo links, which may appear in both the hero and proof sections.

Do not copy these old structural patterns into the new file:

- a long manual table of contents;
- separate “delivered features” and “completion status” sections repeating the same claims;
- multiple explanations of the same Mock/Live boundary;
- pitch-script Q&A or stage narration;
- a license badge implying a declared license.

- [ ] **Step 4: Run Chinese README mechanical checks**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
p = Path('README.zh-CN.md')
s = p.read_text()
assert s.count('```') % 2 == 0, 'unbalanced fenced blocks'
for value in [
    'AntForge on Monad',
    '10143',
    '0x028268f8fF62edc596f931E17E2Fb21015f5b0A2',
    'Live',
    'Deterministic Mock',
    'Built by Neo.Yun',
    'https://t.me/neo_web3_nova',
]:
    assert value in s, value
print(f'PASS README.zh-CN.md: {len(s.splitlines())} lines, {s.count("```")} fence markers')
PY
git diff --check -- README.zh-CN.md
```

Expected: `PASS README.zh-CN.md...` and no `git diff --check` output.

- [ ] **Step 5: Review the Chinese narrative before localization**

Read the rendered order from top to bottom and confirm a potential partner can answer, before reaching Quick Start:

1. What economic coordination problem does AntForge solve?
2. What is already live on Monad?
3. What remains deterministic mock?
4. Why does the state design fit Monad?
5. Why is Neo.Yun credible to continue building it?
6. How can a partner engage?

Do not commit yet; the English and Chinese versions must land together so GitHub never points to a missing language mirror.

---

### Task 2: Rewrite the default README as a natural English primary version

**Files:**
- Modify: `README.md`
- Reference: `README.zh-CN.md`
- Reference: `web/package.json`
- Reference: `agents/package.json`
- Reference: `deployments/monad-testnet.json`

- [ ] **Step 1: Replace the current README with the English-primary structure**

Rewrite `README.md` using the same top-level order as `README.zh-CN.md`. The English must be idiomatic product and protocol writing rather than sentence-by-sentence translation.

Use these exact headline elements:

```text
AntForge on Monad
A settlement layer for autonomous agent swarms.
One mission becomes a temporary, skill-matched machine workforce — verified and paid on Monad.
```

The product thesis should communicate:

- most Agent products optimize choosing or calling one Agent;
- AntForge coordinates a temporary team around one mission;
- the protocol handles task isolation, skill matching, output commitments, verification, and native MON settlement;
- the innovation is the coordination and settlement layer, not a single model.

Use `Public Demo` rather than claiming the hosted page is a fully autonomous live AI service. Use `Live Settlement` only for authoritative Monad state and money movement.

- [ ] **Step 2: Add reciprocal language selectors**

At the top of `README.md`, link to `README.zh-CN.md`; at the top of `README.zh-CN.md`, link to `README.md`.

Use compact shields.io language badges with the current language marked active/current. Verify the relative paths are repository-root relative.

- [ ] **Step 3: Keep both versions fact-equivalent**

Ensure both files contain the same:

- contract address and deployment block;
- five Repair Worker transaction links;
- Conflict Lane winner and reverted transaction links;
- Rogue Ant pre-broadcast simulation wording;
- framework versions: React `19.2`, Vite `8.1`, Tailwind CSS `4.3`, wagmi `3.7`, viem `2.55`;
- Mock/Live/Future categories;
- security limitations and undeclared-license statement;
- founder proof points and contact links;
- Today/Next/Vision roadmap.

Wording can differ, but delivery status and evidence must not.

- [ ] **Step 4: Run bilingual parity checks**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
files = [Path('README.md'), Path('README.zh-CN.md')]
locked = [
    '10143',
    '0x028268f8fF62edc596f931E17E2Fb21015f5b0A2',
    '47924433',
    '0xf0567983d07c3a5811d603612defb71b188856b44db840b895e164e4f941a00c',
    '0xba439f5fa3eb5b76283ae5c88eaa91779ac89bb4c6338fd482008f25fb0da2c7',
    'https://antforge-monad.vercel.app/',
    'https://t.me/neo_web3_nova',
    'https://x.com/aiweb3school/status/2069726882988441643',
]
for path in files:
    text = path.read_text()
    assert text.count('```') % 2 == 0, f'{path}: unbalanced fences'
    for value in locked:
        assert value in text, f'{path}: missing {value}'
assert 'README.zh-CN.md' in Path('README.md').read_text()
assert 'README.md' in Path('README.zh-CN.md').read_text()
print('PASS bilingual locked-value and language-link parity')
PY
git diff --check -- README.md README.zh-CN.md
```

Expected: `PASS bilingual locked-value and language-link parity` and no whitespace errors.

---

### Task 3: Verify repository-local links, versions, commands, and truth boundaries

**Files:**
- Verify: `README.md`
- Verify: `README.zh-CN.md`
- Reference: `web/package.json`
- Reference: `agents/package.json`
- Reference: `deployments/monad-testnet.json`
- Reference: `.env.example`, `web/.env.example`, `agents/.env.example`, `contracts/.env.example`

- [ ] **Step 1: Check every repository-relative Markdown link and local image**

Run this deterministic checker:

```bash
python3 - <<'PY'
from pathlib import Path
import re

errors = []
for readme in [Path('README.md'), Path('README.zh-CN.md')]:
    text = readme.read_text()
    targets = re.findall(r'!?(?:\[[^\]]*\])\(([^)]+)\)', text)
    targets += re.findall(r'(?:src|href)="([^"]+)"', text)
    for raw in targets:
        target = raw.split('#', 1)[0].strip()
        if not target or target.startswith(('http://', 'https://', 'mailto:')):
            continue
        resolved = (readme.parent / target).resolve()
        if not resolved.exists():
            errors.append(f'{readme}: missing {raw}')
if errors:
    raise SystemExit('\n'.join(errors))
print('PASS all repository-relative README links and images exist')
PY
```

Expected: `PASS all repository-relative README links and images exist`.

- [ ] **Step 2: Verify versions and scripts against manifests**

Run:

```bash
node - <<'NODE'
const fs = require('fs')
const web = JSON.parse(fs.readFileSync('web/package.json'))
const agents = JSON.parse(fs.readFileSync('agents/package.json'))
const docs = fs.readFileSync('README.md', 'utf8') + fs.readFileSync('README.zh-CN.md', 'utf8')
for (const [label, value] of [
  ['React 19.2', web.dependencies.react],
  ['Vite 8.1', web.devDependencies.vite],
  ['wagmi 3.7', web.dependencies.wagmi],
  ['viem 2.55', web.dependencies.viem],
  ['Node.js 20+', agents.engines.node],
]) {
  if (!docs.includes(label)) throw new Error(`README missing ${label}; manifest=${value}`)
}
for (const script of ['agents:mock', 'agents:live', 'typecheck', 'build']) {
  if (!agents.scripts[script]) throw new Error(`agents script missing: ${script}`)
}
for (const script of ['dev', 'lint', 'build', 'preview']) {
  if (!web.scripts[script]) throw new Error(`web script missing: ${script}`)
}
console.log('PASS README versions and documented scripts match manifests')
NODE
```

Expected: `PASS README versions and documented scripts match manifests`.

- [ ] **Step 3: Scan only the README files for misleading language**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
text = '\n'.join(Path(p).read_text().lower() for p in ['README.md', 'README.zh-CN.md'])
for forbidden in ['license-mit', 'license-apache', 'fully autonomous ai', 'measured tps', 'measured finality']:
    assert forbidden not in text, forbidden
assert 'deterministic mock' in text
assert 'not audited' in text or '未经审计' in text
assert 'license' in text or '许可证' in text
print('PASS truth-boundary wording scan')
PY
```

Expected: `PASS truth-boundary wording scan`.

- [ ] **Step 4: Inspect the documentation diff as a reviewer**

Run:

```bash
git diff --stat -- README.md README.zh-CN.md
git diff --word-diff=plain -- README.md README.zh-CN.md
git status --short --branch --untracked-files=all
```

Confirm:

- only the two README files changed for implementation;
- `docs/08-antforge-3min-roadshow.html` remains untracked;
- no secret value, private key, mnemonic, API key, or populated `.env` content appears in the diff;
- future vision is grammatically marked as future work.

---

### Task 4: Run project and live-evidence verification

**Files:**
- Verify only: all implementation files
- Do not modify generated outputs unless the normal build does so in ignored directories.

- [ ] **Step 1: Verify the contract subsystem**

Run:

```bash
cd contracts
forge fmt --check
forge build --sizes
forge test -vv
cd ..
```

Expected: formatting passes, build succeeds, and the full Foundry test suite passes.

- [ ] **Step 2: Verify the Agent Runtime**

Run:

```bash
cd agents
npm run typecheck
npm run build
cd ..
```

Expected: both commands exit `0`.

- [ ] **Step 3: Verify the Web App**

Run:

```bash
cd web
npm run lint
npm run build
cd ..
```

Expected: lint and production build exit `0`.

- [ ] **Step 4: Re-read live contract bytecode and representative receipts**

Use JSON-RPC POST requests against `https://testnet-rpc.monad.xyz` for:

- `eth_getCode` at contract `0x028268f8fF62edc596f931E17E2Fb21015f5b0A2` with block `latest`; result must be non-empty and not `0x`;
- `eth_getTransactionReceipt` for deployment transaction `0xf0567983d07c3a5811d603612defb71b188856b44db840b895e164e4f941a00c`; status must be `0x1`;
- `eth_getTransactionReceipt` for withdrawal transaction `0xba439f5fa3eb5b76283ae5c88eaa91779ac89bb4c6338fd482008f25fb0da2c7`; status must be `0x1`;
- `eth_getTransactionReceipt` for Conflict Lane loser `0x5c8f5070a5db880178220027a4eeb6d3f6e725be2888cae745996643cb9b4061`; status must be `0x0`.

This step is read-only and has no chain side effects.

- [ ] **Step 5: Verify the public demo anonymously**

Open `https://antforge-monad.vercel.app/` without relying on a connected wallet. Confirm:

- the page loads;
- the visible mode is Live Settlement / Monad Testnet;
- the contract link resolves to the locked contract address;
- there are no blocking browser-console errors;
- no claim is made that deterministic Agent output is a real model execution.

If the browser, RPC, or third-party site blocks fresh verification, report that exact blocker and label the corresponding evidence as recorded rather than freshly verified. Do not silently downgrade the README or fabricate fresh results.

---

### Task 5: Final review, commit, push, and remote verification

**Files:**
- Commit: `README.md`
- Commit: `README.zh-CN.md`
- Preserve untracked: `docs/08-antforge-3min-roadshow.html`

- [ ] **Step 1: Run final documentation checks**

Run:

```bash
git status --short --branch --untracked-files=all
git diff --check
git diff --cached --check
```

Before staging, `git diff --cached --check` may have no content. `git diff --check` must pass.

- [ ] **Step 2: Stage only the two README files**

Run:

```bash
git add README.md README.zh-CN.md
git status --short --branch --untracked-files=all
git diff --cached --check
git diff --cached --stat
```

Expected staged files:

```text
M  README.md
A  README.zh-CN.md
```

Expected unrelated working-tree entry:

```text
?? docs/08-antforge-3min-roadshow.html
```

- [ ] **Step 3: Commit the verified bilingual README**

Run:

```bash
git commit -m "docs: reposition AntForge for global partners" \
  -m "- Make the English README the default project homepage
- Add a full Chinese mirror with reciprocal language navigation
- Lead with the product thesis, live proof, and Monad-native mechanisms
- Add founder credibility, long-term vision, and concrete partnership paths
- Preserve reproducible setup, security limits, and Mock/Live boundaries"
```

Expected: one docs commit containing only `README.md` and `README.zh-CN.md`.

- [ ] **Step 4: Push and verify local/remote identity**

Run:

```bash
git push origin main
LOCAL_SHA=$(git rev-parse HEAD)
REMOTE_SHA=$(git ls-remote origin refs/heads/main | cut -f1)
printf 'LOCAL=%s\nREMOTE=%s\n' "$LOCAL_SHA" "$REMOTE_SHA"
test "$LOCAL_SHA" = "$REMOTE_SHA"
git status --short --branch --untracked-files=all
```

Expected: local and remote SHAs match; branch is aligned with `origin/main`; only the pre-existing `docs/08-antforge-3min-roadshow.html` remains untracked.

- [ ] **Step 5: Report concrete delivery evidence**

Final report must include:

- paths of both README files;
- document structure and founder/partnership additions;
- exact contract, build/test, RPC, and browser verification results;
- commit SHA and remote SHA match;
- explicit confirmation that `docs/08-antforge-3min-roadshow.html` was not touched or staged;
- any external verification that was blocked or only recorded.
