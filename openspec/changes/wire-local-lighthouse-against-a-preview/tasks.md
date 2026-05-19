# Tasks: wire-local-lighthouse-against-a-preview

Ordering rationale:

- The systemd unit + the install script are independent of the
  perf-runner rewrite; do them first so the runner has a working
  Chrome + writable npm cache before the perf-runner work goes
  end-to-end. Without those two pre-conditions, the perf-runner
  cannot be exercised against a real LHR on the autopilot host.
- The perf-runner rewrite splits into (a) extracting the pure
  comparator helper (testable in isolation), (b) wiring the
  preview-server I/O around it, then (c) deleting the placeholder
  branch. The pure helper lands first because it has the cleanest
  unit-test story.
- Doctor extensions (`npm-cache-writable.mjs` + the
  `chrome-installed.mjs` fix-hint update) land alongside the
  artefacts they describe so `pnpm doctor` stays coherent at every
  commit.
- Documentation (root `AGENTS.md` dual-gate section + the new
  `autopilot/AGENTS.md` boundary doc) lands once the artefacts it
  references exist.
- Verification (`pnpm doctor`, `pnpm test`,
  `pnpm audit:invariants --change …`, `pnpm perf:budget`) is the
  regression fence and runs last.

"Covers" labels reference scenarios `S<n>` from `proposal.md` and
invariants `I<n>` from `openspec/specs/templates-perf/spec.md`.

---

## Phase 1 — Systemd unit (source of truth in repo)

- [x] **T1.** Create the `autopilot/` directory at the repo root.
      Add `autopilot/AGENTS.md` (boundary doc) and a
      `autopilot/CLAUDE.md` symlink → `AGENTS.md`. The boundary doc
      names the deployment contract (operator runs
      `sudo cp autopilot/systemd/aig-runner.service
/etc/systemd/system/ && sudo systemctl daemon-reload && sudo
systemctl restart aig-runner`) and points at the templates-perf
      spec for why `ReadWritePaths=` matters. Covers **S13** prep.

- [x] **T2.** Write `autopilot/systemd/aig-runner.service`. Declare
      `ProtectSystem=strict`, `PrivateTmp=true`,
      `NoNewPrivileges=true`, and
      `ReadWritePaths=%h/.npm %h/.cache /opt/chrome-for-testing`
      (adjust the literal path for the runner's actual `User=` if it
      differs from `dev`). Include `Type=simple`, `Restart=on-failure`,
      `RestartSec=10`, and the host-correct `WorkingDirectory=`
      and `ExecStart=`. Covers **S13**.

## Phase 2 — Chrome for Testing install script

- [x] **T3.** Write `scripts/doctor/install-chrome.mjs`. Implement
      argv parsing for `--prefix`, `--bindir`, `--version`, and
      `--dry-run` (matching the design's CLI surface). Resolve the
      pinned version (constant at the top of the file; the
      implementer sets it to the Chrome-for-Testing version that
      CI's `runs-on: ubuntu-latest` currently uses — confirm by
      inspecting a recent green Lighthouse CI run's logs, or pin to
      the issue body's `131.0.6778.85` if no fresher value is
      available). Fetch the manifest from
      `https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json`,
      find the matching `chrome-linux64` download URL, download
      the zip, extract to `<prefix>/<version>/`, symlink
      `<bindir>/chrome` → the extracted `chrome` binary. Covers
      **S2**, **S3**.

- [x] **T4.** Add the idempotence fast path in
      `install-chrome.mjs`: if the symlink at `<bindir>/chrome`
      already resolves to a binary under `<prefix>/<version>/`,
      print `Chrome for Testing <version> already installed at
<symlink>` and exit 0 within ~1s without re-downloading. Covers
      **S1**.

- [x] **T5.** Update `scripts/doctor/chrome-installed.mjs`: extend
      the probe array to include `/usr/local/bin/chrome` and
      `$HOME/.local/bin/chrome`. Replace the existing warn fix hint
      with `Run scripts/doctor/install-chrome.mjs to install the
pinned Chrome for Testing.`. Covers **S4**.

## Phase 3 — npm cache writability doctor check

- [x] **T6.** Write `scripts/doctor/npm-cache-writable.mjs`.
      Export `check()`. Probe by writing + removing a 1-byte file
      at `$HOME/.npm/_cacache/.aig-doctor-probe-<pid>`. On
      success, emit `ok` with the probe path; on
      `EROFS`/`EACCES`, emit `warn` with the fix hint
      `Deploy autopilot/systemd/aig-runner.service and restart
aig-runner so ReadWritePaths= grants the npm cache write
access.`. Use only built-in node modules + `./_lib.mjs`. Covers
      **S14**.

- [x] **T7.** Confirm the new doctor check loads via
      `pnpm doctor` (the autoloader at `scripts/doctor/run-all.mjs`
      picks up every `*.mjs` other than `_lib.mjs` and
      `run-all.mjs`). Covers **S14**.

## Phase 4 — Perf runner pure comparator + unit test

- [x] **T8.** In `scripts/perf/run.mjs`, extract the threshold
      comparison logic into an exported pure helper
      `compareAgainstBudget(lhr, thresholds, options = {})`.
      Returns `{ findings, anyFail }` per the "New signatures"
      block in `design.md`. Each finding carries
      `{ label, pass, actual, threshold, detail }`. Score fields
      (`performance / accessibility / best-practices / seo`) read
      from `lhr.categories.<id>.score * 100` (Lighthouse reports
      0–1; thresholds are 0–100). Metric fields
      (`largest-contentful-paint`, `interaction-to-next-paint`,
      `cumulative-layout-shift`, `total-blocking-time`) read from
      `lhr.audits.<id>.numericValue`. Total-transfer reads from
      `lhr.audits['total-byte-weight'].numericValue` and is
      compared in KB (`/1024`). A missing metric or score in the
      LHR yields a `❌` finding (not a silent pass) — `anyFail =
true`. Covers **S6**, **S7**, **S8**.

- [x] **T9.** Write `scripts/perf/run.test.mjs` (vitest). Fixture
      cases: - All scores ≥ floor + all metrics ≤ threshold →
      `anyFail === false`, every finding `pass === true`. Covers
      **S8**. - LCP fixture at `3200` (threshold `2000`) → exactly one
      finding fails with `actual === 3200` and `threshold ===
2000`; `anyFail === true`. Covers **S6**. - Accessibility score fixture at `0.92` (threshold `0.95`) →
      exactly one finding fails with `actual === 92` (or `0.92`,
      depending on the unit chosen — the test pins the chosen
      unit) and `threshold === 95`; `anyFail === true`. Covers
      **S7**. - LHR missing `lhr.audits['cumulative-layout-shift']` → the
      CLS finding fails with a `missing metric` detail string;
      `anyFail === true`. (Belt-and-braces — guards against a
      future Lighthouse version that renames the audit.) Covers
      the "fail loudly" clause of T8.

## Phase 5 — Perf runner I/O wiring (preview server + Lighthouse subprocess)

- [x] **T10.** Add helpers to `scripts/perf/run.mjs`:
      `findFreePort()` (uses `node:net` `server.listen(0)` to
      claim a port and immediately release it), and
      `waitForHttp(url, { timeoutMs = 30_000, intervalMs = 250 })`
      (polls `fetch(url)` until 200 OK or timeout). Both helpers
      are private to the file (not exported). Covers **S5** prep.

- [x] **T11.** Add `findChrome()` to `scripts/perf/run.mjs` —
      walks the same probe list as
      `scripts/doctor/chrome-installed.mjs` plus
      `/usr/local/bin/chrome` and `$HOME/.local/bin/chrome`. Used
      by the Lighthouse branch to short-circuit into the graceful
      skip when Chrome is missing. Covers **S12**.

- [x] **T12.** Add `resolveTarget(argv)` to
      `scripts/perf/run.mjs` — maps `--page <route>` to the
      preview-server target package per the mapping table in
      `design.md` (starter for `/`, `/blog`, `/blog/**`,
      `/projects`, `/projects/**`, `/about`, `/contact`; docs
      template for `/docs/**`). Honour the `--target <pkg>`
      override when present. Default target on missing `--page` is
      starter. Covers **S5** prep.

- [x] **T13.** Add `buildIfNeeded(targetPkg)` to
      `scripts/perf/run.mjs` — checks for the package's `dist/`
      directory; if absent or stale, runs
      `spawnSync('pnpm', ['--filter', targetPkg, 'build'], …)` and
      surfaces a clear finding on build failure. Covers **S5**
      prep.

- [x] **T14.** Rewrite the Lighthouse branch in
      `scripts/perf/run.mjs` (the block today at lines ~60–75) to
      use the helpers added in T8–T13. The new flow matches the
      "Composition shape" block in `design.md`:
      (a) `findChrome()` → graceful skip if absent (exit 0);
      (b) `resolveTarget(argv)` + `buildIfNeeded(target.pkg)`;
      (c) `findFreePort()` + spawn `pnpm --filter <pkg> preview
--port <port>`;
      (d) `waitForHttp(...)` with a 30s timeout;
      (e) `spawnSync('npx', ['--no-install', 'lighthouse',
'<url>', '--preset=mobile', '--output=json',
'--output-path=stdout', '--quiet', '--chrome-flags=--headless=new
--no-sandbox --disable-gpu'], ...)` with `maxBuffer: 32 *
1024 * 1024`;
      (f) `JSON.parse(stdout)` → `compareAgainstBudget(lhr,
thresholds)`;
      (g) emit `record(...)` lines per finding; set non-zero exit
      when `anyFail`. Covers **S5**, **S6**, **S7**, **S8**,
      **S12**, **S16**.

- [x] **T15.** Add the preview-server cleanup contract to
      `scripts/perf/run.mjs`: the spawn from T14 is tracked in a
      module-scoped `let server`; a `cleanup()` function calls
      `server?.kill('SIGTERM')` (and a fallback `SIGKILL` after
      500ms if the child has not exited). The `finally` block of
      the Lighthouse branch calls `cleanup()`; two new
      `process.on('SIGINT', ...)` / `process.on('SIGTERM', ...)`
      handlers call `cleanup()` then exit with code 130 / 143
      respectively. Covers **S9**, **S10**.

- [x] **T16.** Rewire the `--transfer` branch in
      `scripts/perf/run.mjs` to use the same LHR-derived total
      (from `lhr.audits['total-byte-weight'].numericValue`) when
      a real Lighthouse run is available. When no LHR is available
      (e.g. invoked stand-alone without `--page`), fall back to
      the same Chrome-absent skip semantics introduced in T11.
      Covers **I3**.

- [x] **T17.** Confirm the `--critical-css` branch in
      `scripts/perf/run.mjs` is untouched: it continues to inspect
      `apps/site/dist/index.html` and `apps/docs/dist/index.html`
      for inlined `<style>` blocks, and continues to be accepted
      without error. (The Beasties-output check is the preserved
      behaviour from the templates-perf delta in #37.) If T8/T14
      accidentally regressed this branch, restore it. Covers
      **S11**, **I4**.

## Phase 6 — Documentation

- [ ] **T18.** Add a `## Performance gates` section to root
      `AGENTS.md` (lands in `CLAUDE.md` via the symlink). Body:
      one paragraph defining the dual gate (local advisory + CI
      authoritative), a code-fence-or-list naming the commands
      (`pnpm perf:budget` + `Lighthouse CI (mobile)` workflow),
      and a short "How to make the local gate green" note that
      points at `scripts/doctor/install-chrome.mjs` plus
      `autopilot/systemd/aig-runner.service`. Note that the local
      gate is allowed to skip gracefully when Chrome is absent;
      CI never skips. Covers **S15**.

- [ ] **T19.** Add a trailing one-line note to the
      `pnpm perf:budget` entry in the "Common commands" block of
      `AGENTS.md` pointing at the new `## Performance gates`
      section. Covers **S15**.

- [ ] **T20.** Confirm the new `autopilot/AGENTS.md` (T1) names
      the deployment contract verbatim and links the new section
      in root `AGENTS.md`. Covers **S15**.

## Phase 7 — Verification

- [ ] **T21.** Run `pnpm format:check`. Confirm exit 0. (If the
      Astro / mjs files drifted, run `pnpm format` and re-commit;
      do not bypass.) Covers **S17** (format half).

- [ ] **T22.** Run `pnpm typecheck`. Confirm exit 0. Covers
      **S17** (typecheck half).

- [ ] **T23.** Run `pnpm test`. Confirm exit 0. The new
      `scripts/perf/run.test.mjs` must run and pass. Covers
      **S6**, **S7**, **S8**.

- [ ] **T24.** Run `node scripts/doctor/install-chrome.mjs --dry-run`
      from the runner. Confirm the resolved download URL points at
      the pinned Chrome for Testing version's `chrome-linux64.zip`
      asset under `googlechromelabs.github.io`. (Dry-run does not
      write or fetch the asset itself.) Covers **S2**.

- [ ] **T25.** Run `sudo node scripts/doctor/install-chrome.mjs`
      on the runner. Confirm a fresh-install path completes,
      `/usr/local/bin/chrome` resolves, and
      `node scripts/doctor/chrome-installed.mjs` emits `ok`. Then
      re-run the install script; confirm it exits 0 within ~1s
      without re-downloading. Covers **S1**, **S2**, **S4**.

- [ ] **T26.** Deploy `autopilot/systemd/aig-runner.service` to
      `/etc/systemd/system/` on the runner; `sudo systemctl
daemon-reload && sudo systemctl restart aig-runner`. Then run
      `pnpm doctor`. Confirm `npm-cache-writable` reports `ok`
      and the overall doctor summary is `0 error`. Capture the
      output under
      `openspec/changes/wire-local-lighthouse-against-a-preview/runs/<ts>/notes.md`.
      Covers **S13**, **S14**.

- [ ] **T27.** Run `pnpm perf:budget --page /` on the runner with
      Chrome installed and the systemd unit deployed. Confirm
      exit 0 (assuming the starter is within budget) and the
      stdout contains per-metric numeric lines for LCP, INP, CLS,
      TBT, Total transfer plus the four scores. Capture the
      output under
      `openspec/changes/wire-local-lighthouse-against-a-preview/runs/<ts>/perf.txt`.
      Covers **S5**, **S16**.

- [ ] **T28.** Trigger the SIGINT cleanup contract. Start
      `pnpm perf:budget --page /` and immediately send `SIGINT`
      (Ctrl-C). Confirm the process exits, no orphan node
      process remains (`pgrep -af 'pnpm.*preview'` empty), and
      `lsof -i :<port>` (the port the script chose) returns
      empty. Capture the verification commands and outputs under
      `runs/<ts>/notes.md`. Covers **S10**.

- [ ] **T29.** Confirm the graceful-skip path. Temporarily mask
      Chrome (`sudo mv /usr/local/bin/chrome /usr/local/bin/chrome.bak`),
      run `pnpm perf:budget --page /`, confirm exit 0 with a
      `skipped — chrome not installed; run scripts/doctor/install-chrome.mjs`
      finding in stdout. Restore the symlink immediately
      (`sudo mv /usr/local/bin/chrome.bak /usr/local/bin/chrome`).
      Capture in `runs/<ts>/notes.md`. Covers **S12**.

- [ ] **T30.** Confirm `--critical-css` still works. Run
      `pnpm --filter @astro-ignite/site build` then
      `node scripts/perf/run.mjs --critical-css`. Confirm
      it inspects `apps/site/dist/index.html`, reports inlined
      `<style>` findings, and exits per the pre-existing
      semantics. Covers **S11**.

- [ ] **T31.** Run `pnpm audit:invariants --change
wire-local-lighthouse-against-a-preview`. The dispatcher reads
      `design.md`'s "Invariants this change touches" section and
      runs the audit commands listed there
      (`node scripts/perf/run.mjs --page /`,
      `--page /blog`, `--transfer`, `--critical-css`, `--deps`).
      Confirm exit 0; capture the report under
      `runs/<ts>/audit.md`. Covers **I1**, **I2**, **I3**, **I4**,
      **I5**.

- [ ] **T32.** Final boundary check. Run `git diff --name-only
main` and confirm the touched paths are limited to the set in
      proposal **S17**: `scripts/perf/run.mjs`,
      `scripts/perf/run.test.mjs`,
      `scripts/doctor/install-chrome.mjs`,
      `scripts/doctor/npm-cache-writable.mjs`,
      `scripts/doctor/chrome-installed.mjs`,
      `autopilot/systemd/aig-runner.service`,
      `autopilot/AGENTS.md`, `autopilot/CLAUDE.md`,
      `AGENTS.md` (root; `CLAUDE.md` symlink unchanged), and
      `openspec/changes/wire-local-lighthouse-against-a-preview/`.
      No edits land under `packages/*/src/`, `apps/*/src/`,
      `tests/`, or `openspec/specs/` (the long-lived ones).
      Covers **S17**.
