# Scripts / Cloud Boundary

Cloud and CI entry-point scripts. Nothing here ships to scaffolded projects.

## Files

- `bootstrap.sh` — the **SessionStart hook** wired in `.claude/settings.json`
  (matcher `"startup|resume"`). It:
  1. Pins `OPENSPEC_TELEMETRY=0` for the session.
  2. Activates pnpm@9.15.0 via corepack (cloud only).
  3. Runs `pnpm install --prefer-offline` in cloud sessions or when
     `node_modules` is absent (fast no-op when the store is populated).
  4. Prints `pnpm queue` so every session opens with the current harness
     state in its context window.

  Always exits 0 — a failed bootstrap must never block the session from
  starting.

## Rules

- Do not add logic here that belongs in a `scripts/` sub-tool (audit,
  perf, doctor). This file should stay small — it's plumbing, not a
  feature.
- Any change to what `bootstrap.sh` exports or prints should be reflected
  in the root AGENTS.md (the `SessionStart hook` description) and in
  `.claude/routines/README.md` (the autopilot context).
- Reference: `.claude/settings.json` → `hooks.SessionStart`, and
  `.claude/routines/README.md` for the GitHub-event autopilot workflow.
