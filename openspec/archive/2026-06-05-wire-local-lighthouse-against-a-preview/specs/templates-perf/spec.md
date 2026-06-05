# Delta: templates-perf — wire-local-lighthouse-against-a-preview

This change replaces the placeholder Lighthouse branch in
`scripts/perf/run.mjs` with a real end-to-end runner: build a
target template, boot a preview server, wait for the port, run
`npx lighthouse` with the mobile preset, parse the LHR, compare
every category score and Core Web Vital against
`scripts/perf/budget.json`, print per-metric numbers, exit 0 on
pass / 1 on out-of-budget. The runner cleans up the spawned
preview server on every exit path (normal, fail, SIGINT, SIGTERM).

The change does not loosen any existing threshold. It formalises:

- the **dual-gate model** (local advisory + CI authoritative),
- the **graceful-skip-on-missing-Chrome** behaviour introduced by
  PR #39, and
- the **`--critical-css` flag preservation** from the
  templates-perf delta authored in change #37 (deprecated-but-
  accepted).

The audit cells in the long-lived capability spec
(`openspec/specs/templates-perf/spec.md`) name
`scripts/perf/run.mjs` as the audit for I1–I4. Before this change
those audits emitted a `not yet wired` failure; after this change
they truly run.

## ADDED Requirements

### Requirement: Local perf runner boots a preview server and runs Lighthouse end-to-end

When invoked with `--page <route>` and Chrome is present on the
host, `scripts/perf/run.mjs` SHALL:

1. Resolve `<route>` to a preview-server target package (the
   starter template for `/`, `/blog`, `/blog/**`, `/projects`,
   `/projects/**`, `/about`, `/contact`; the docs template for
   `/docs/**`; or the explicit `--target <pkg>` override).
2. Build the target if its `dist/` is absent or stale.
3. Pick a free port via `node:net` `server.listen(0)`.
4. Spawn `pnpm --filter <pkg> preview --port <port>` as a child
   process.
5. Poll `http://localhost:<port><route>` every 250ms via
   `fetch()` until a `200 OK` response or a 30s timeout elapses;
   fail with a clear `record(...)` line on timeout.
6. Run `npx --no-install lighthouse <url> --preset=mobile
--output=json --output-path=stdout --quiet --chrome-flags="
--headless=new --no-sandbox --disable-gpu"` as a subprocess and
   capture stdout.
7. Parse the LHR JSON; compare each category score
   (`performance / accessibility / best-practices / seo`) and
   each metric (`largest-contentful-paint`,
   `interaction-to-next-paint`, `cumulative-layout-shift`,
   `total-blocking-time`, `total-byte-weight`) against
   `scripts/perf/budget.json` (scores `>=`; metrics `<=`).
8. Emit one `record(...)` line per finding with the actual value
   and the threshold in the detail string.
9. Tear down the spawned preview server on every exit path
   (normal completion, comparison failure, exception, SIGINT,
   SIGTERM). No orphan node process and no held port may remain
   after the script returns.

#### Scenario: Home page within budget

- **GIVEN** Chrome for Testing is installed and the starter
  builds clean
- **WHEN** `pnpm perf:budget --page /` runs from the repo root
- **THEN** the script builds the starter (if `dist/` is stale),
  boots `pnpm --filter @astro-ignite/template-starter preview
--port <free-port>`, waits for the port to reach 200 OK, runs
  Lighthouse with the mobile preset, parses the LHR, prints
  per-metric numeric findings for LCP / INP / CLS / TBT /
  Total-transfer plus the four scores, and exits 0.

#### Scenario: A metric busts the budget

- **GIVEN** the same setup, but the build contains a regression
  that lifts LCP from `1.4s` to `3.2s`
- **WHEN** the perf run executes
- **THEN** the LCP finding line reads `❌ LCP — 3.20s (≤ 2.00s)`,
  `anyFail` is true, and the process exits 1. Other findings (the
  metrics still within budget) report `✅`.

#### Scenario: Preview server is torn down on SIGINT

- **GIVEN** a `pnpm perf:budget --page /` run mid-flight
- **WHEN** the operator sends `SIGINT` (Ctrl-C)
- **THEN** the SIGINT handler in the script kills the spawned
  preview-server child process; the script exits with code 130;
  no orphan node process remains; `lsof -i :<port>` returns empty.

### Requirement: Local perf runner skips gracefully when Chrome is absent

When Chrome cannot be located on the host (no `chrome` /
`google-chrome` / `chromium` on PATH and no
`/usr/local/bin/chrome` / `$HOME/.local/bin/chrome` symlink),
`scripts/perf/run.mjs` SHALL emit a single finding labelled
`skipped — chrome not installed; run scripts/doctor/install-chrome.mjs`
and exit **0** (not 1). Real budget failures (any threshold
busted) still exit 1; only the missing-tool branch is graceful.

#### Scenario: Clean check-out on a host without Chrome

- **GIVEN** a freshly cloned repo on a host where the install
  script has not been run and no other Chrome variant is on PATH
- **WHEN** `pnpm perf:budget` runs (with or without `--page`)
- **THEN** the Lighthouse branch records a single `skipped`
  finding and the process exits 0; downstream tooling that
  depends on `pnpm perf:budget` not failing on missing-tool
  grounds is not blocked.

### Requirement: CI Lighthouse workflow remains the authoritative gate

The local advisory runner is allowed to skip Chrome-absent
machines. The CI workflow `Lighthouse CI (mobile)` at
`.github/workflows/lighthouse.yml` SHALL NOT skip on a missing-
Chrome grounds — it provisions its own Chrome (`runs-on:
ubuntu-latest` ships one) and runs against `apps/playground/` as
the canonical scaffolded output. Both gates SHALL be green
before a change is opened for review.

#### Scenario: Local skipped, CI must still pass

- **GIVEN** an implementer's runner that does not yet have
  Chrome for Testing installed
- **WHEN** the implementer runs `pnpm perf:budget` (skipped)
  and pushes the branch
- **THEN** the CI Lighthouse workflow runs against the
  scaffolded playground and is the gating signal for the PR.

### Requirement: Dual-gate model documented in AGENTS.md

`AGENTS.md` (and via its `CLAUDE.md` symlink) SHALL contain a
section titled `Performance gates` (or an agreed equivalent
heading) whose body names both gates, the commands that invoke
them, the graceful-skip behaviour of the local gate, and the
authoritative role of the CI gate.

#### Scenario: A new contributor reads AGENTS.md

- **GIVEN** the repo at HEAD
- **WHEN** a contributor reads `AGENTS.md`
- **THEN** they can identify, without leaving the file, that
  (a) `pnpm perf:budget` is the local advisory gate,
  (b) the CI workflow `Lighthouse CI (mobile)` is the
  authoritative gate,
  (c) the local gate is allowed to skip on a host without
  Chrome — they don't need to run `git log` or open another
  file to learn this.

## MODIFIED Requirements

### Requirement: Lighthouse mobile scores

(Existing requirement — only the **audit infrastructure**
changes, not the thresholds.) A clean build of each template
SHALL meet the budget on Lighthouse mobile (simulated 4G, Slow
CPU 4x). The audits that enforce this requirement
(I1, I2 in the long-lived spec) are now backed by a real
preview-server + Lighthouse subprocess pipeline in
`scripts/perf/run.mjs` rather than the previous `not yet wired`
placeholder. The thresholds in `scripts/perf/budget.json`
(Performance / Accessibility / Best-Practices / SEO `>= 95`;
LCP `<= 2000 ms`; INP `<= 200 ms`; CLS `<= 0.05`;
TBT `<= 200 ms`; Total transfer `<= 150 KB`) are unchanged.

#### Scenario: CI runs on a template change (preserved)

- **GIVEN** a PR touches `packages/templates/starter/**`
- **WHEN** `pnpm perf:budget` runs locally _and_ the
  `Lighthouse CI (mobile)` workflow runs in CI
- **THEN** both report per-metric numbers for the home page and
  one inner page, both pass against the same thresholds, and
  the local gate exits 0 on pass / 1 on bust (or 0 on a
  missing-Chrome graceful skip).

### Requirement: `--critical-css` flag accepted as a preserved no-op-compatible flag

(Carries forward the templates-perf delta authored by change
#37.) `scripts/perf/run.mjs` SHALL continue to accept
`--critical-css` without error. When a build output exists at
`apps/site/dist/index.html` or `apps/docs/dist/index.html`, the
flag continues to inspect the HTML for inlined `<style>` blocks
and report per-file findings; when no build output exists, the
flag records `Build output present: false` and the script exits
per its pre-existing semantics.

#### Scenario: Implementer passes --critical-css after a clean check-out

- **GIVEN** the repo at HEAD, no build run yet
- **WHEN** `node scripts/perf/run.mjs --critical-css` runs
- **THEN** the script accepts the flag, emits `Build output
present: false`, and exits per the pre-existing semantics — no
  `unknown flag` error, no crash.

## REMOVED Requirements

_None._

## Notes

- **Why this delta at all.** The long-lived capability spec's
  invariants table (`I1–I4`) names `scripts/perf/run.mjs` as the
  audit. Until this change, the audit was a placeholder. The
  delta does not change the invariants themselves; it formalises
  the runner's contract (build + boot + parse + compare +
  cleanup), the graceful-skip semantics, and the dual-gate model
  so the reviewer has explicit grounds to reject any future drift
  away from this behaviour.
- **No threshold loosening.** The issue body suggests considering
  +100ms LCP on the runner for hardware variance. The policy
  documented in the proposal's out-of-scope section applies:
  measure first; open a follow-up issue if the runner
  consistently misses LCP by ≤ 100ms on a known-good build; do
  not loosen the canonical budget here.
- **Audit / verification.** `pnpm perf:budget` runs
  `scripts/perf/run.mjs`. For change scoping,
  `pnpm audit:invariants --change wire-local-lighthouse-against-a-preview`
  reads the design's "Invariants this change touches" section
  and dispatches the named audit commands
  (`node scripts/perf/run.mjs --page /`, `--page /blog`,
  `--transfer`, `--critical-css`, `--deps`). The implementer
  captures the per-page report under `runs/<ts>/perf.txt` and
  the dispatcher report under `runs/<ts>/audit.md`.
- **No new runtime dep introduced.** `lighthouse` is invoked via
  `npx`; the implementer does not add `lighthouse` to any
  workspace `dependencies` or `devDependencies` block. (The
  alternative of vendoring it is documented and rejected in
  `design.md`.)
