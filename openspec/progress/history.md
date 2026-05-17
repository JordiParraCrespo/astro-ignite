# Session history

Append-only log of completed sessions. Each entry is moved here from
`openspec/progress/current.md` by the leader after a feature is archived.

## 2026-05-17 — Harness bootstrap (Phase 1)

Built the spec-driven harness end-to-end per `AGENTS.md`. Files added:

- `openspec/specs/<capability>/spec.md` × 9 (the invariant catalog)
- `scripts/audit/*.mjs` × 8 + `run-all.mjs` (T2 verification)
- `scripts/perf/run.mjs` + `budget.json` (T3 verification; Lighthouse
  binding deferred — `scripts/perf/run.mjs` currently surfaces "not yet
  wired" rather than silent-pass)
- `scripts/doctor/*.mjs` × 8 + `run-all.mjs`
- `scripts/committer` (bash, with `--design` flag)
- `.claude/agents/{leader,spec_author,implementer,reviewer}.md`
- `.claude/settings.json` + `.claude/hooks/post-edit-typecheck.mjs`
- 8 boundary `AGENTS.md` files (5 written; starter + docs already had
  end-user-facing ones; `CLAUDE.md` symlinks set everywhere)
- `openspec/feature_list.json`, `CHECKPOINTS.md`, `.env.example`,
  `package.json` scripts

Friction / open items:

- The npm package name `openspec` is a squatted 0.0.0 placeholder, not
  Fission-AI/OpenSpec. Running convention-only until the real install
  path is confirmed. `scripts/doctor/openspec-cli.mjs` warns instead of
  erroring.
- `scripts/perf/run.mjs` doesn't yet drive Lighthouse against a preview
  server. Next iteration when there's a concrete template to measure
  against. The budget thresholds + `--critical-css` / `--deps` checks
  are real.
- Step 16 (end-to-end trial on a trivial feature) not yet executed.
