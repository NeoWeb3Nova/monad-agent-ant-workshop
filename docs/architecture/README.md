# AntForge architecture diagrams

These diagrams document the implementation that is currently shipped in this repository. They are not aspirational infrastructure diagrams.

| View | Source | Interactive HTML | GitHub-ready SVG |
| --- | --- | --- | --- |
| System architecture | [`antforge-system.architecture.json`](antforge-system.architecture.json) | [`antforge-system.html`](antforge-system.html) | [`antforge-system.svg`](antforge-system.svg) |
| Live settlement sequence | [`antforge-live-settlement.sequence.json`](antforge-live-settlement.sequence.json) | [`antforge-live-settlement.html`](antforge-live-settlement.html) | [`antforge-live-settlement.svg`](antforge-live-settlement.svg) |
| Task and reward lifecycle | [`antforge-task-lifecycle.lifecycle.json`](antforge-task-lifecycle.lifecycle.json) | [`antforge-task-lifecycle.html`](antforge-task-lifecycle.html) | [`antforge-task-lifecycle.svg`](antforge-task-lifecycle.svg) |

The HTML artifacts are self-contained and provide light/dark themes plus PNG, JPEG, WebP, and dual-theme SVG export. Download an HTML file and open it in a browser to use the toolbar.

## Architectural claims represented

- The public Vercel app and private local Agent Runtime are peer clients of `AntColony.sol`.
- `MockColonyDataSource` and `MonadColonyDataSource` share the same UI-facing contract; Live failures do not silently fall back to Mock.
- Worker and Guard private keys remain in the local runtime and never enter Vercel or the browser bundle.
- Deterministic task IDs and `tasks[taskId]` isolate independent task writes; same-task claims intentionally conflict.
- Verification credits `claimableRewards`, and the Worker withdraws native MON in a separate pull-payment transaction.
- `SkillMismatch` is stopped during simulation without a fabricated transaction hash; `TaskNotOpen` is preserved as a reverted onchain receipt.

## Regenerate and validate

The sources use the Archify v2.10 schemas. With an Archify checkout or installed skill directory:

```bash
ARCHIFY_DIR=/path/to/archify

node "$ARCHIFY_DIR/bin/archify.mjs" render architecture antforge-system.architecture.json antforge-system.html
node "$ARCHIFY_DIR/bin/archify.mjs" render sequence antforge-live-settlement.sequence.json antforge-live-settlement.html
node "$ARCHIFY_DIR/bin/archify.mjs" render lifecycle antforge-task-lifecycle.lifecycle.json antforge-task-lifecycle.html

node "$ARCHIFY_DIR/bin/archify.mjs" check antforge-system.html
node "$ARCHIFY_DIR/bin/archify.mjs" check antforge-live-settlement.html
node "$ARCHIFY_DIR/bin/archify.mjs" check antforge-task-lifecycle.html
```

SVG files are exported from the generated HTML toolbar so they include the self-contained dual-theme stylesheet used by GitHub and other embedding hosts.
