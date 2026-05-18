# Proposal: wire-local-lighthouse-against-a-preview

## Why

`scripts/perf/run.mjs` is a deliberate placeholder. On the autopilot's
Hetzner runner the script cannot run Lighthouse end-to-end because of
three independent gaps:

1. **No Chrome on PATH.** `scripts/doctor/chrome-installed.mjs`
   probes `which google-chrome / chrome / chromium` and emits a warn
   finding (`No google-chrome / chrome / chromium on PATH …`). The
   banner pipeline gets around this by reusing Playwright's bundled
   `chrome-headless-shell`, but Lighthouse needs a real Chrome
   launcher and resolves it via `chrome-launcher`, which scans
   well-known system paths.
2. **`npx lighthouse` cannot fetch.** The systemd unit that runs
   the autopilot hardens the FS with `PrivateTmp=true` and
   `ProtectSystem=strict`. `~/.npm/_cacache/` is read-only under
   the unit, so the first `npx lighthouse` invocation aborts with
   `EROFS` before chrome ever launches.
3. **The script doesn't actually run Lighthouse.** Inside the only
   non-skip branch (`scripts/perf/run.mjs:61-75`), the code probes
   `npx --no-install lighthouse --version`, then either records a
   "no lighthouse binary" failure or a "not yet wired to a preview
   server target" failure. It never spawns a preview server, never
   parses an LHR, never compares against `scripts/perf/budget.json`.

The interim mitigation introduced during the
`migrate-starter-template-to-tailwind-css` change (PR #39) lets
`pnpm perf:budget` skip gracefully when Lighthouse is unavailable —
that prevents the local advisory check from blocking unrelated work,
but every future change with a design that requires a measured perf
delta (e.g. a Beasties A/B/C comparison) hits the same wall.

This change wires the three pieces:

1. A reproducible Chrome for Testing install on the runner
   (`scripts/doctor/install-chrome.mjs`, idempotent, pin shared with
   CI when CI pins one). After it runs, `pnpm doctor` reports Chrome
   as present.
2. A systemd unit (checked into the repo as
   `autopilot/systemd/aig-runner.service`) that loosens
   `ReadWritePaths=` just enough to give `~/.npm/` write access while
   keeping `ProtectSystem=strict` everywhere else. The unit file is
   the source of truth; the operator deploys it.
3. A real `scripts/perf/run.mjs` that boots a preview server for the
   requested template, polls the port until the server is reachable
   or 30s elapses, runs `npx lighthouse <url> --preset=mobile
--output=json --output-path=stdout --quiet --chrome-flags="--headless=new
--no-sandbox --disable-gpu"`, parses the LHR, compares each metric to
   the thresholds in `scripts/perf/budget.json`, prints per-page
   numbers, exits 0 on pass and 1 on out-of-budget. SIGINT / SIGTERM
   handlers tear down the spawned preview server.

The dual-gate model that the change formalises in `AGENTS.md`:

- **Local `pnpm perf:budget`** is a fast advisory check the
  implementer and reviewer run on the runner before opening a PR.
  It is allowed to skip gracefully when Chrome is absent.
- **CI workflow `Lighthouse CI (mobile)`** (the
  `.github/workflows/lighthouse.yml` job) is the authoritative gate.
  Both must be green before review.

## Scope

In scope:

- **NEW** `scripts/doctor/install-chrome.mjs` — idempotent installer
  for Chrome for Testing. Reads the Google manifest at
  `https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json`,
  picks the version pinned in the script (defaulting to the version
  CI uses; the issue body cites `131.0.6778.85`), downloads the
  `chrome-linux64.zip` for the host platform, extracts to
  `/opt/chrome-for-testing/<version>/`, and symlinks
  `/usr/local/bin/chrome` → the extracted `chrome` binary. Exits 0
  fast when the symlink already targets the pinned version. Supports
  `--prefix <dir>` (default `/opt/chrome-for-testing`) and
  `--bindir <dir>` (default `/usr/local/bin`) overrides for non-root
  installs (`~/.local/share/...` / `~/.local/bin/...`).
- **NEW** `scripts/doctor/npm-cache-writable.mjs` — boots a small
  fs-write probe against `~/.npm/_cacache/<random>` to confirm the
  cache directory is writable; emits warn with a fix hint pointing at
  the systemd unit when the probe fails with `EROFS` / `EACCES`.
  Wired into `pnpm doctor` via the existing
  `scripts/doctor/run-all.mjs` autoloader.
- **NEW** `autopilot/systemd/aig-runner.service` — the source-of-
  truth systemd unit for the runner. Declares
  `ProtectSystem=strict`, `PrivateTmp=true`, plus
  `ReadWritePaths=%h/.npm %h/.cache /opt/chrome-for-testing` (or the
  equivalent that gives `~/.npm/_cacache/`, the Chrome install
  prefix, and the standard XDG cache write access). The operator
  deploys the unit by copying it into `/etc/systemd/system/` and
  running `systemctl daemon-reload && systemctl restart aig-runner`.
- **NEW** `autopilot/AGENTS.md` (symlinked as
  `autopilot/CLAUDE.md`) — boundary doc for the new top-level
  `autopilot/` directory. Names the systemd unit as the only
  artefact here today and the deployment contract (operator runs
  `systemctl daemon-reload` after a change to the unit).
- **MOD** `scripts/perf/run.mjs` — full rewrite of the Lighthouse
  branch. New flow:
  1. Resolve the target package for a `--page <route>` invocation:
     `/`, `/blog`, `/projects`, `/about`, `/contact` → starter
     template (or `apps/playground/`); routes that only exist on
     `apps/site` → site. Default target is the starter.
  2. Build the target (when it has no `dist/` yet) via
     `pnpm --filter <pkg> build`.
  3. Spawn `pnpm --filter <pkg> preview --port <freePort>` as a
     child process; capture stdout/stderr; resolve a free port via
     `node:net` `server.listen(0)` before spawning. (The starter
     template currently uses port 4321 by default — the
     implementation finds and binds to a free port so the script can
     coexist with a developer's running `pnpm dev:starter`.)
  4. Poll `http://localhost:<port>${page}` with `fetch()` every
     250ms until 200 OK or 30s elapses. Fail with a clear timeout
     finding if the server never reaches readiness.
  5. Run `npx lighthouse http://localhost:<port>${page}
--preset=mobile --output=json --output-path=stdout --quiet
--chrome-flags="--headless=new --no-sandbox --disable-gpu"` and
     capture stdout.
  6. Parse the LHR JSON; extract category scores
     (`performance / accessibility / best-practices / seo`) and
     metrics (`largest-contentful-paint`,
     `interaction-to-next-paint`, `cumulative-layout-shift`,
     `total-blocking-time`) plus `byteTransferTotal` for the
     transfer check.
  7. Compare each value against `scripts/perf/budget.json` (scores
     `>=`; metrics `<=`); emit one `record(...)` line per metric
     with the actual number and the threshold; fail the gate if
     any comparison is out of budget.
  8. Tear down the spawned preview server in a `finally` block and
     in `process.on('SIGINT'/'SIGTERM', …)` handlers; do not leave
     orphan node processes.
  9. When `--page` is omitted, the existing top-level branches
     (deps check, no-arg full run) keep their current behaviour.
- **MOD** `scripts/perf/run.mjs` (continued) — when Chrome is
  absent (probe via the same `which chrome / google-chrome /
chromium` chain the doctor uses), the Lighthouse branch records a
  `skipped — chrome not installed` finding and **exits 0** (not 1).
  This preserves the existing "skip, not fail" mitigation introduced
  during PR #39 and documented in `openspec/progress/history.md`.
- **MOD** `scripts/perf/run.mjs` (continued) — the `--critical-css`
  flag continues to be accepted. The Beasties output inspection at
  the bottom of the current script stays; the spec delta below
  formalises that the flag is preserved as a deprecated-but-accepted
  flag per the templates-perf delta from #37.
- **MOD** `scripts/doctor/chrome-installed.mjs` — update the fix
  hint to point at the new install script
  (`Run scripts/doctor/install-chrome.mjs to install the pinned
Chrome for Testing.`). Also probe `/usr/local/bin/chrome` and
  `$HOME/.local/bin/chrome` so the doctor recognises the install
  script's output.
- **MOD** `AGENTS.md` (symlinked to root `CLAUDE.md`) — add a
  `## Performance gates` section that documents the dual-gate model
  (local advisory + CI authoritative) and points readers at
  `scripts/perf/run.mjs` and `.github/workflows/lighthouse.yml`.
  Also: bump the line in the harness summary that mentions
  `pnpm perf:budget` so the dual-gate framing is consistent.
- **NEW** `scripts/perf/run.test.mjs` — vitest unit test that
  exercises the pure threshold-comparison helper (see "New
  signatures" in `design.md`) against a fixture LHR JSON. Covers
  the pass case, the per-metric fail cases, and the score fail
  cases. No real Chrome / preview server is launched in the unit
  test.

Out of scope (documented so the implementer doesn't drift):

- **Replacing Lighthouse with a different perf tool** (Vitals API,
  WebPageTest, browser-native PerformanceObserver). Lighthouse stays
  the source of truth for the budget.
- **Running Lighthouse against deployed Cloudflare Pages previews.**
  The CI workflow already handles that path; this change is about
  the local advisory path.
- **GPU acceleration / WebGL benchmark coverage.** Out of scope —
  Chrome runs headless with `--disable-gpu`.
- **Migrating the systemd unit off `ProtectSystem` entirely.**
  The unit keeps `ProtectSystem=strict`; only the npm cache,
  XDG cache, and Chrome install prefix are added to
  `ReadWritePaths=`.
- **Bumping budget thresholds for runner-hardware variance.** The
  issue suggests considering +100ms LCP on the runner. We measure
  first; if the runner consistently misses LCP by ≤100ms on a known-
  good build, the implementer records the observation in
  `runs/<ts>/notes.md` and opens a follow-up issue rather than
  loosening the canonical budget here. The spec delta below makes
  this policy explicit.
- **Vendoring `lighthouse` as a workspace devDependency.** The
  rejected-alternative section in `design.md` documents why we keep
  the `npx` path instead of pulling in lighthouse's transitive deps.
- **Auto-running the install script.** `pnpm doctor` reports the
  missing-Chrome state; the operator runs `install-chrome.mjs`
  explicitly. The doctor does not silently mutate `/opt` or
  `/usr/local/bin`.

## Scenarios

### S1 — Install script idempotence

- **GIVEN** Chrome for Testing at the pinned version is already
  installed (the symlink at the configured `--bindir` target
  resolves to the pinned-version binary under the configured
  `--prefix`)
- **WHEN** `node scripts/doctor/install-chrome.mjs` runs a second
  time
- **THEN** the script exits 0 within a couple of seconds, does not
  re-download the zip, prints a clear "already installed at
  <version>" line, and leaves the symlink and extracted tree
  byte-equal to the prior state.

### S2 — First-time install lands the binary on PATH

- **GIVEN** no `chrome` / `google-chrome` / `chromium` is on PATH
  and `/usr/local/bin/chrome` does not exist
- **WHEN** `node scripts/doctor/install-chrome.mjs` runs (with root
  / sudo so it can write to `/opt/chrome-for-testing/` and
  `/usr/local/bin/`)
- **THEN** the pinned-version Chrome for Testing zip is downloaded
  from the Google manifest, extracted into
  `/opt/chrome-for-testing/<version>/chrome-linux64/`, and the
  symlink `/usr/local/bin/chrome` is created pointing at the
  extracted `chrome` binary; `node scripts/doctor/chrome-installed.mjs`
  subsequently reports an `ok` finding (`Chrome at /usr/local/bin/chrome`).

### S3 — Non-root install path

- **GIVEN** a developer running the script as a non-root user on a
  workstation
- **WHEN** they run `node scripts/doctor/install-chrome.mjs --prefix
"$HOME/.local/share/chrome-for-testing" --bindir "$HOME/.local/bin"`
- **THEN** the script extracts Chrome under
  `$HOME/.local/share/chrome-for-testing/<version>/` and creates
  the symlink `$HOME/.local/bin/chrome`; it succeeds without sudo;
  `which chrome` resolves (provided `~/.local/bin` is on PATH).

### S4 — Doctor recognises the install

- **GIVEN** the install script just ran successfully (any prefix)
- **WHEN** `node scripts/doctor/chrome-installed.mjs` runs (directly
  or via `pnpm doctor`)
- **THEN** it reports `ok` for the `chrome` subsystem with a path
  string that resolves; no `warn` is emitted.

### S5 — Lighthouse runs end-to-end on a known-good build

- **GIVEN** the starter template builds cleanly and Chrome for
  Testing is installed
- **WHEN** `pnpm perf:budget --page /` runs from the repo root
- **THEN** the script builds the starter (if `dist/` is stale),
  picks a free port, spawns `pnpm --filter
@astro-ignite/template-starter preview --port <port>`, waits for
  the port to respond 200 OK on `/` within 30s, runs `npx
lighthouse http://localhost:<port>/ --preset=mobile --output=json
--output-path=stdout --quiet --chrome-flags="--headless=new
--no-sandbox --disable-gpu"`, parses the LHR JSON, prints per-page
  LCP / INP / CLS / TBT / total-transfer numbers alongside the
  Performance / Accessibility / Best-Practices / SEO scores, and
  exits 0 when every comparison meets `scripts/perf/budget.json`.

### S6 — Out-of-budget metric fails the gate

- **GIVEN** an LHR fixture (or a real run on a target known to bust
  the budget) where one metric — e.g. `largest-contentful-paint =
3200` — exceeds the threshold (`2000`)
- **WHEN** the parser-and-comparator in `scripts/perf/run.mjs` runs
  against that LHR
- **THEN** the corresponding `record(...)` finding is `❌` with both
  the actual value and the threshold in the detail string, and the
  process exits 1.

### S7 — Score below floor fails the gate

- **GIVEN** an LHR fixture where one category score (e.g.
  Accessibility = 0.92) is below the budget floor (0.95)
- **WHEN** the parser-and-comparator runs against that LHR
- **THEN** the corresponding `record(...)` finding is `❌` with
  the actual `0.92` value and the `0.95` threshold, and the
  process exits 1.

### S8 — All metrics + scores within budget passes the gate

- **GIVEN** an LHR fixture where every category score is ≥ floor and
  every metric is ≤ threshold
- **WHEN** the parser-and-comparator runs against that LHR
- **THEN** every `record(...)` finding is `✅` and the process
  exits 0.

### S9 — Preview server cleanup on normal exit

- **GIVEN** a successful `pnpm perf:budget --page /` run
- **WHEN** the script finishes (passes or fails the gate)
- **THEN** the spawned preview-server child process has been killed
  before the script returns; no node process listening on the
  chosen port remains; `lsof -i :<port>` returns empty.

### S10 — Preview server cleanup on SIGINT

- **GIVEN** a `pnpm perf:budget --page /` run in progress (Chrome
  is mid-flight)
- **WHEN** the operator sends `SIGINT` (Ctrl-C) or `SIGTERM`
- **THEN** the SIGINT/SIGTERM handler in the script kills the
  spawned preview-server child process, then exits with the
  standard SIGINT exit code; no orphan node process and no held
  port remain.

### S11 — `--critical-css` flag accepted (preserved per #37 delta)

- **GIVEN** the repo at HEAD
- **WHEN** `node scripts/perf/run.mjs --critical-css` runs
- **THEN** the script accepts the flag without erroring; if a build
  output exists at `apps/site/dist/index.html` or
  `apps/docs/dist/index.html`, the Beasties-output check runs and
  reports per-file findings; if no build output exists, the script
  records "Build output present: false" and exits with the
  pre-existing exit semantics. The flag remains documented in the
  usage block at the top of `scripts/perf/run.mjs`.

### S12 — Graceful skip when Chrome is absent

- **GIVEN** a clean check-out on a host where no Chrome variant is
  on PATH and the install script has not been run
- **WHEN** `pnpm perf:budget` runs (no flags) or `pnpm perf:budget
--page /` runs
- **THEN** the Lighthouse branch records a single `skipped — chrome
not installed; run scripts/doctor/install-chrome.mjs` finding and
  the process **exits 0** (not 1) on the missing-tool branch. Real
  budget failures still exit 1; only the missing-tool skip is
  graceful. This preserves the PR #39 mitigation.

### S13 — Systemd unit declares writable npm cache

- **GIVEN** the post-change tree
- **WHEN** `autopilot/systemd/aig-runner.service` is read
- **THEN** the file declares `ProtectSystem=strict`,
  `PrivateTmp=true`, and a `ReadWritePaths=` directive whose value
  contains `%h/.npm` (or the literal `/home/dev/.npm`, depending on
  the unit's `User=`) plus `/opt/chrome-for-testing` (or the
  equivalent Chrome install prefix). No other path is added to
  `ReadWritePaths=` beyond what the npm cache, the XDG cache
  (`%h/.cache`), and the Chrome install prefix require.

### S14 — npm cache writability doctor check

- **GIVEN** `scripts/doctor/npm-cache-writable.mjs` exists
- **WHEN** `pnpm doctor` runs (which autoloads every
  `scripts/doctor/*.mjs` via `run-all.mjs`)
- **THEN** on a host where `~/.npm/_cacache/` is writable, the
  check emits `ok` (`npm cache writable at <path>`); on a host
  where writing fails with `EROFS` / `EACCES`, the check emits
  `warn` with a fix hint pointing at
  `autopilot/systemd/aig-runner.service` (`Deploy the unit and
restart aig-runner so ReadWritePaths= grants access`).

### S15 — `AGENTS.md` documents the dual-gate model

- **GIVEN** the post-change tree
- **WHEN** `AGENTS.md` (and via symlink `CLAUDE.md`) is read
- **THEN** the file contains a section header `## Performance
gates` (or the agreed equivalent) whose body explains that local
  `pnpm perf:budget` is the advisory gate run by the implementer /
  reviewer, that CI workflow `Lighthouse CI (mobile)`
  (`.github/workflows/lighthouse.yml`) is the authoritative gate,
  that both must pass before a change opens for review, and that
  `pnpm perf:budget` is allowed to skip gracefully when Chrome is
  absent on the local host while CI never skips.

### S16 — Per-page metrics surfaced in stdout

- **GIVEN** a successful `pnpm perf:budget --page /` run on a
  build inside budget
- **WHEN** the stdout of the run is inspected
- **THEN** it contains one human-readable `✅` line per metric and
  per score with the actual numeric value: e.g.
  `✅ LCP — 1.42s (≤ 2.00s)`,
  `✅ CLS — 0.012 (≤ 0.05)`,
  `✅ TBT — 86ms (≤ 200ms)`,
  `✅ Total transfer — 118 KB (≤ 150 KB)`,
  `✅ Performance score — 99 (≥ 95)`. The actual numbers are
  parseable by the reviewer when the implementer captures the
  output under `runs/<ts>/perf.txt`.

### S17 — Boundary check

- **GIVEN** the post-change tree
- **WHEN** `git diff --name-only main` runs
- **THEN** the touched paths are limited to:
  `scripts/perf/run.mjs`,
  `scripts/perf/run.test.mjs` (NEW),
  `scripts/doctor/install-chrome.mjs` (NEW),
  `scripts/doctor/npm-cache-writable.mjs` (NEW),
  `scripts/doctor/chrome-installed.mjs`,
  `autopilot/systemd/aig-runner.service` (NEW),
  `autopilot/AGENTS.md` + `autopilot/CLAUDE.md` (NEW, the latter
  a symlink),
  `AGENTS.md` (root, symlinked to `CLAUDE.md`), and
  `openspec/changes/wire-local-lighthouse-against-a-preview/`. No
  edits land under `packages/*/src/`, `apps/*/src/`, or
  `openspec/specs/` (the long-lived ones).
