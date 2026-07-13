# Perf Gate Boundary

The local Lighthouse budget gate. Backs `pnpm perf:budget`. Advisory
locally; the CI workflow `Lighthouse CI (mobile)` is the authoritative
gate (runs against `apps/playground/`).

## What's here

- `run.mjs` — builds the resolved template (default: starter), boots a
  preview server on a free port, runs
  `npx lighthouse <url> --preset=mobile --output=json`, parses the LHR,
  and compares each score + metric against `budget.json`. Per-page
  numbers to stdout; exit 0 on pass, 1 on bust.
- `budget.json` — the score/metric thresholds. The enforced floor is
  **Lighthouse ≥95, mobile only** — there is no desktop gate. Templates
  are expected to ship at 100s wherever possible; see
  `openspec/specs/templates-perf/spec.md`.

## Rules

- Keep `budget.json` as the single source of thresholds; don't scatter
  magic numbers in `run.mjs`.
- **Graceful skip:** when no Chrome is found (PATH or the known
  symlinks), record one `skipped — chrome not installed` finding and
  exit 0. Run `scripts/doctor/install-chrome.mjs` to make it green.
- Both this gate and the CI gate must be green before review.
- Scope a single page with `pnpm perf:budget --page /`.
