# Scripts Boundary

Workspace tooling. None of this ships to scaffolded projects — it
verifies and supports the monorepo itself.

## Layout

- `audit/` — machine-checked invariant audits (`run-all.mjs` +
  per-capability `.mjs`). Backs `pnpm audit:invariants`. Has its own
  AGENTS.md.
- `perf/` — local Lighthouse budget gate (`run.mjs` + `budget.json`).
  Backs `pnpm perf:budget`. Advisory locally; CI is authoritative.
- `doctor/` — environment health checks (`pnpm doctor`) and the pinned
  Chrome-for-Testing installer used by the perf gate + banner pipeline.
- `cloud/` — CI and cloud session entry-points (notably `bootstrap.sh`,
  the SessionStart hook). Has its own AGENTS.md.
- `lib/` — shared helpers imported by the scripts above (no side
  effects, named exports).
- `committer` — scoped staging wrapper used by the `implementer` agent.
  Validates every staged path against the active `design.md`'s "Files
  touched" list and rejects out-of-scope paths. Usage:
  `scripts/committer --design openspec/changes/<name>/design.md "msg" <files>`.
- `scaffold-test.mjs` — full e2e: wipes `apps/playground/`, runs the CLI
  `--yes`, installs, builds, Lighthouse. Backs `pnpm scaffold:test`.
- `generate-placeholder-assets.*` — placeholder image generation.

## Rules

- Scripts are Node ESM (`.mjs`) run directly; keep them dependency-light
  and runnable from the repo root.
- An audit encodes a locked practice — when you add or change one, keep
  it in sync with the matching `openspec/specs/<capability>/spec.md`
  invariant table. See `scripts/audit/AGENTS.md`.
- Don't hand-edit `apps/playground/` — `scaffold-test.mjs` regenerates it.
