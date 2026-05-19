# Design: wire-local-lighthouse-against-a-preview

## Files touched

### `scripts/perf/` — the runner

- MOD `scripts/perf/run.mjs` — rewrite the Lighthouse branch (lines
  ~60–75 of today's file) to actually boot a preview server, wait
  for it, run `npx lighthouse`, parse the LHR, compare against
  `scripts/perf/budget.json`, and tear the server down on every
  exit path. Preserves the existing top-level flags (`--page`,
  `--transfer`, `--critical-css`, `--deps`, `--change`) and exit
  semantics for non-Lighthouse branches. The Beasties-output check
  under `--critical-css` is left intact (the deprecated-but-accepted
  flag preserved from the #37 templates-perf delta).
- NEW `scripts/perf/run.test.mjs` — vitest unit test that exercises
  the pure threshold-comparison helper (`compareAgainstBudget`,
  see "New signatures" below) against a fixture LHR JSON shipped
  inline in the test file. Covers: every metric within budget →
  pass; one metric over budget → fail; one score below floor →
  fail; missing metric → fail loudly (not silent pass). No
  preview server or Chrome is spawned by the unit test.

### `scripts/doctor/` — Chrome and npm-cache checks

- NEW `scripts/doctor/install-chrome.mjs` — idempotent installer
  for Chrome for Testing. CLI-driven (not exporting `check()`, so
  `run-all.mjs`'s autoloader does not invoke it on `pnpm doctor`).
  Reads the Google manifest, picks the pinned version, downloads
  the platform-appropriate zip, extracts to `--prefix` (default
  `/opt/chrome-for-testing`), symlinks `--bindir/chrome` (default
  `/usr/local/bin/chrome`) at the extracted `chrome` binary, and
  exits 0 fast when the symlink already targets the pinned version.
  Supports a `--dry-run` mode that prints the resolved download URL
  without writing.
- NEW `scripts/doctor/npm-cache-writable.mjs` — exports `check()`.
  Picks a random path under `~/.npm/_cacache/`, writes a 1-byte
  probe file, removes it. Emits `ok` on success; `warn` with a fix
  hint pointing at `autopilot/systemd/aig-runner.service` on
  `EROFS`/`EACCES`. Autoloaded by the existing
  `scripts/doctor/run-all.mjs` (which already iterates every
  `*.mjs` other than `_lib.mjs` and `run-all.mjs`).
- MOD `scripts/doctor/chrome-installed.mjs` — extend the probe
  list to include `/usr/local/bin/chrome` and
  `$HOME/.local/bin/chrome` (the two default install sinks for
  the new install script). Update the warn fix hint to:
  `Run scripts/doctor/install-chrome.mjs to install the pinned
Chrome for Testing.` (One-line change; the structure stays.) The
  doctor still emits a `warn`, not an `error`, when Chrome is
  missing — `pnpm doctor` does not fail the suite for it. Missing
  Chrome only matters for perf runs and the banner pipeline; both
  surface their own errors at use-time.

### `autopilot/` — runner systemd unit (new top-level)

- NEW `autopilot/systemd/aig-runner.service` — the canonical
  systemd unit for the runner. Declared content (illustrative,
  not byte-fixed; the implementer adjusts for the host's actual
  `User=` / `WorkingDirectory=` / `Environment=`):

  ```ini
  [Unit]
  Description=astro-ignite autopilot runner
  After=network.target

  [Service]
  Type=simple
  User=dev
  WorkingDirectory=/home/dev/work/plan
  ExecStart=/usr/bin/env node scripts/autopilot/runner.mjs
  Restart=on-failure
  RestartSec=10

  # Hardening — keep ProtectSystem + PrivateTmp on; loosen only
  # the writes the runner genuinely needs.
  ProtectSystem=strict
  PrivateTmp=true
  NoNewPrivileges=true
  ReadWritePaths=%h/.npm %h/.cache /opt/chrome-for-testing

  [Install]
  WantedBy=multi-user.target
  ```

  The deployment contract is owner-operated: `sudo cp
autopilot/systemd/aig-runner.service /etc/systemd/system/` then
  `sudo systemctl daemon-reload && sudo systemctl restart aig-runner`.
  The repo does not run those commands as part of any script.

- NEW `autopilot/AGENTS.md` — boundary doc for the new directory.
  States the deployment contract above, names
  `autopilot/systemd/aig-runner.service` as the only artefact
  here today, and points readers at the `templates-perf` spec for
  why the unit's `ReadWritePaths=` value matters (the npm cache
  has to be writable for `npx lighthouse` to fetch when the bin
  isn't pre-vendored).
- NEW `autopilot/CLAUDE.md` — symlink to `AGENTS.md`, matching the
  convention used at every other boundary in the repo
  (`packages/*/CLAUDE.md`, `apps/*/CLAUDE.md`,
  `scripts/audit/CLAUDE.md`).

### Documentation

- MOD `AGENTS.md` (root, symlinked from `CLAUDE.md`) — add a new
  `## Performance gates` section that spells out the dual-gate
  model (local advisory + CI authoritative). Also: the existing
  one-liner `pnpm perf:budget # …` in the "Common commands" block
  gets a short trailing note that points at the new section.
  The CLAUDE.md symlink at the repo root means a single edit
  lands in both files.

### Spec / change-dir artefacts

- MOD `openspec/changes/wire-local-lighthouse-against-a-preview/`
  — `tasks.md` checkbox flips, `design.md` evolution during
  implementation, `specs/templates-perf/spec.md` (the delta below),
  plus run-directory artefacts (`runs/<ts>/{impl,audit,perf,
review,notes}.md` / `perf.txt`).
- MOD `openspec/progress/current.md` — the harness's "what's
  happening right now" tracker. Per the implementer protocol the
  current-session state is bumped to this feature's run dir.

## New signatures

The runner gains one extracted helper so the threshold logic is
unit-testable:

```js
// scripts/perf/run.mjs
//
// Pure: takes a parsed Lighthouse Result (LHR), returns one
// finding per category score and per metric. The caller decides
// what to do with non-pass findings (typically: print and exit
// non-zero if any fail).
//
// thresholds is the shape inside scripts/perf/budget.json under
// `lighthouse.mobile` (scores + metrics).
export function compareAgainstBudget(lhr, thresholds, options = {}) {
  // returns { findings: Array<{label, pass, actual, threshold, detail}>, anyFail: boolean }
}

// Helper that surrounds compareAgainstBudget with the I/O around
// it. Boots the preview server, runs Lighthouse, parses, compares.
// Caller owns process lifecycle and SIGINT handlers.
export async function runLighthouseAgainst(targetPkg, route, options) {
  // returns { findings, anyFail, lhr } — same shape as
  // compareAgainstBudget plus the raw LHR for archival.
}
```

Plus two small helpers:

```js
// node:net-based free-port finder.
async function findFreePort() {
  /* server.listen(0) */
}

// Polls fetch(url) every 250ms until 200 OK or timeoutMs elapses.
async function waitForHttp(url, { timeoutMs = 30_000 }) {
  /* … */
}
```

The new install script's CLI surface:

```text
Usage: node scripts/doctor/install-chrome.mjs [--prefix DIR]
       [--bindir DIR] [--version VERSION] [--dry-run]

Defaults:
  --prefix   /opt/chrome-for-testing
  --bindir   /usr/local/bin
  --version  <pinned constant in the script>
```

The new doctor check exports the standard `check()` shape used by
every other entry under `scripts/doctor/`:

```js
// scripts/doctor/npm-cache-writable.mjs
export async function check() {
  return [ok|warn(...)];
}
```

## Preview-server target mapping

The `--page <route>` flag selects which package's preview server to
boot. The implementer hard-codes the mapping in `run.mjs`:

| Route(s)                                      | Target package                                   |
| --------------------------------------------- | ------------------------------------------------ |
| `/`, `/blog`, `/blog/**`, `/projects`,        | `@astro-ignite/template-starter` (preferred), or |
| `/projects/**`, `/about`, `/contact`          | fall back to `@astro-ignite/site` if the starter |
|                                               | has no built dist and the operator passes        |
|                                               | `--target site` explicitly                       |
| (any route on the docs surface, e.g. `/docs`) | `@astro-ignite/template-docs`                    |

The default target when `--page` is omitted is the starter. The
implementer adds a `--target <pkg>` override flag so the reviewer
can run against `@astro-ignite/site` directly when triaging an
apps/site-specific regression.

## Composition shape (illustrative)

```js
// scripts/perf/run.mjs (Lighthouse branch, post-change)

const chrome = findChrome(); // walks PATH + /usr/local/bin + ~/.local/bin
if (!chrome) {
  record(
    'Lighthouse run',
    true,
    'skipped — chrome not installed; run scripts/doctor/install-chrome.mjs'
  );
  finishAndExit(); // exits 0 — graceful skip preserved
}

const target = resolveTarget(argv); // { pkg, route }
await buildIfNeeded(target.pkg);

const port = await findFreePort();
const server = spawn('pnpm', ['--filter', target.pkg, 'preview', '--port', String(port)], {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
});

const cleanup = () => {
  try {
    server.kill('SIGTERM');
  } catch {}
};
process.on('SIGINT', () => {
  cleanup();
  process.exit(130);
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit(143);
});

try {
  await waitForHttp(`http://localhost:${port}${target.route}`, { timeoutMs: 30_000 });

  const lhJson = spawnSync(
    'npx',
    [
      '--no-install',
      'lighthouse',
      `http://localhost:${port}${target.route}`,
      '--preset=mobile',
      '--output=json',
      '--output-path=stdout',
      '--quiet',
      '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
    ],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
  );

  if (lhJson.status !== 0) throw new Error(`lighthouse exit ${lhJson.status}\n${lhJson.stderr}`);
  const lhr = JSON.parse(lhJson.stdout);

  const { findings, anyFail } = compareAgainstBudget(lhr, thresholds);
  for (const f of findings) record(f.label, f.pass, f.detail);

  if (anyFail) exitCode = 1;
} finally {
  cleanup();
}
```

## Invariants this change touches

### `templates-perf`

This is the audit infrastructure for I1–I4 of the templates-perf
spec. The runner is what those invariants actually invoke. Before
this change, I1 and I2 emitted `❌ Lighthouse run — not yet wired
to a preview server target` and (post PR #39 mitigation) `❌`
without failing the gate. After this change, I1 and I2 truly run
Lighthouse against a preview server and the audit cell statements
in the long-lived spec hold for the first time.

- **I1 (Lighthouse budget met on home page)** — now exercised by
  `node scripts/perf/run.mjs --page /`. The check parses the LHR,
  compares each category score and metric against
  `scripts/perf/budget.json`, prints per-metric numbers, and exits
  1 when any threshold is busted. When Chrome is absent the check
  exits 0 with a clearly-labelled `skipped — chrome not installed`
  finding (preserves the PR #39 mitigation).
- **I2 (Lighthouse budget met on one inner page)** — same as I1
  with `--page /blog` (or another inner route declared by the
  caller).
- **I3 (Total transfer ≤ 150KB compressed home)** — now exercised
  by `node scripts/perf/run.mjs --transfer`, which derives the
  transfer total from the same LHR (under
  `lhr.audits['total-byte-weight'].numericValue`) instead of
  emitting `not yet wired`. Same Chrome-absent skip semantics.
- **I4 (Critical CSS inlined, Beasties output present)** — the
  existing Beasties HTML inspection at `scripts/perf/run.mjs:81-97`
  is preserved. The `--critical-css` flag remains accepted; the
  spec delta below formalises that it is preserved as a
  deprecated-but-accepted flag per the templates-perf delta from
  #37 (the audit cell continues to point at `--critical-css`).
- **I5 (no undeclared runtime dep added)** — unchanged behaviour;
  the `--deps` branch already inspects template `package.json`s.

The change does not loosen any threshold in
`scripts/perf/budget.json`. The proposal-out-of-scope section above
documents the runner-hardware-variance policy: measure first, open
a follow-up issue if the runner consistently misses LCP by ≤ 100ms,
do not loosen the canonical budget here.

Audit commands (parseable by `scripts/audit/run-all.mjs --change`;
this change's design.md surfaces them so the existing audit
dispatcher picks them up via `pnpm audit:invariants --change`):

- audit: `node scripts/perf/run.mjs --page /`
- audit: `node scripts/perf/run.mjs --page /blog`
- audit: `node scripts/perf/run.mjs --transfer`
- audit: `node scripts/perf/run.mjs --critical-css`
- audit: `node scripts/perf/run.mjs --deps`

(These commands are also what the new spec delta references in its
audit table.)

## Performance budget applicability

This change's capability matches `^templates-`, so the harness rule
`require_perf_budget_to_close_when` applies. The implementer must
capture `pnpm perf:budget` output under
`openspec/changes/wire-local-lighthouse-against-a-preview/runs/<ts>/perf.txt`.

Expected impact:

- **JS / CSS / HTML bundles:** unchanged. This change only touches
  `scripts/` and `autopilot/`; no template / app source is
  edited.
- **Lighthouse run itself:** this is the first real Lighthouse
  execution from `scripts/perf/run.mjs`. The implementer's
  `perf.txt` is the new local-advisory baseline. The CI workflow
  `Lighthouse CI (mobile)` continues to be the authoritative gate
  against `apps/playground/`.

Risk areas the implementer must verify in the perf run:

- **The starter's home page** must remain inside every threshold
  on the runner. If it isn't, the change is rejected (the runner
  has discovered a real perf regression, not an artefact of
  measurement noise) and the implementer files a follow-up issue
  with the specific metric that busted.
- **Preview-server port collisions** — the implementer must
  confirm that the `findFreePort()` helper actually picks a free
  port. The test environment may have port 4321 occupied by a
  developer's `pnpm dev:starter` session.

## Rejected alternative — vendor `lighthouse` as a workspace devDependency

Adding `"lighthouse": "^12.x"` to the root `package.json`
`devDependencies` block would let `npx --no-install lighthouse`
resolve immediately from `node_modules/.bin/lighthouse` — no
network fetch, no npm-cache write, no systemd-unit change needed.

Rejected because:

1. **Transitive-dep footprint.** Lighthouse pulls in ~50MB of
   transitive deps (puppeteer-core, chrome-launcher, axe-core,
   etc.). Adding it to the workspace root inflates every
   contributor's `pnpm install` and every CI cache by that much.
   The autopilot is the only consumer that needs it.
2. **Supply-chain surface.** Each transitive dep is a new
   release-cadence and CVE surface for a project whose `audit`
   posture is one of its selling points.
3. **CI already vendors it.** The Lighthouse CI workflow installs
   `@lhci/cli` globally per-job (see
   `.github/workflows/lighthouse.yml:42` —
   `npm install -g @lhci/cli@0.14.x`). Mirroring that with a
   `pnpm dlx lighthouse@12.x` invocation on the runner — once the
   npm cache is writable — keeps the parity tight.
4. **The systemd loosening is the issue author's preferred path.**
   The issue body explicitly proposes the `ReadWritePaths=`
   change. Following the issue author's plan beats inventing a
   different one.

If a future change adds enough other tooling that lighthouse-as-a-
devDep is worth the cost on its own merits, that change can land
the move with its own justification.

## Rejected alternative — install via `npx @puppeteer/browsers install chrome@stable`

The existing fix hint at `scripts/doctor/chrome-installed.mjs:30`
suggests `npx @puppeteer/browsers install chrome@stable`. That
works for a developer workstation but:

1. **No version pin.** `chrome@stable` floats. The autopilot must
   stay in lockstep with whatever CI's `runs-on: ubuntu-latest`
   resolves; pinning to a Chrome-for-Testing version with the
   `known-good-versions` manifest is the canonical way to do
   that.
2. **Install location.** `@puppeteer/browsers` extracts under
   `$HOME/.cache/puppeteer/`, not on PATH. The doctor would have
   to learn that path; the issue author prefers `/usr/local/bin`
   for parity with how a sysadmin would manage the binary.
3. **The runner's npm cache is read-only.** Until the systemd
   change lands, `npx @puppeteer/browsers ...` hits the same
   `EROFS` wall.

The install script under `scripts/doctor/install-chrome.mjs` uses
`fetch()` against the manifest plus a `unzip`/`tar -xf` shell-out,
which sidesteps the npm cache entirely.

## Rejected alternative — drive Chrome with `chrome-launcher` directly (skip `npx lighthouse`)

A more invasive alternative would replace the `npx lighthouse`
subprocess with an in-process Lighthouse + chrome-launcher import.

Rejected because:

1. **In-process import requires adding `lighthouse` as a dep**
   (see the previous rejected alternative — same footprint
   problem).
2. **Subprocess isolation is a feature.** If Lighthouse crashes
   or hangs on a malformed page, the subprocess can be killed
   without taking the autopilot runner down with it.
3. **CI runs the CLI binary too.** Keeping the local path
   identical to the CI path means a bug reproduces the same way
   in both places.

## Rejected alternative — bundle the runner systemd unit edit into a separate change

The unit-file work could ship as a tiny standalone change
(`autopilot/systemd/aig-runner.service` + the boundary
`AGENTS.md`), with the perf-runner rewrite landing in a follow-up.

Bundled because:

1. **Acceptance #4 ties them.** "On a clean check-out without
   Chrome the runner skips gracefully" is testable only when the
   runner is the new wired-up runner. Splitting the changes
   leaves the spec delta half-applied between two PRs.
2. **Operator burden.** Two deploy steps (restart the systemd
   unit, then re-cut a release) instead of one. The unit deploy
   is owner-operated either way; piggybacking on the perf-runner
   change minimises ceremony.
3. **The diff is contained.** Three new files + three modified
   files is well within a single reviewable PR.

## Rejected alternative — auto-run `install-chrome.mjs` from `pnpm doctor`

`pnpm doctor` could auto-invoke `install-chrome.mjs` when the
chrome check warns. That would make first-time setup zero-touch.

Rejected because:

1. **Doctor is read-only.** Every existing entry under
   `scripts/doctor/` reports state without mutating it. A doctor
   that silently writes to `/opt` and `/usr/local/bin` breaks
   the read-only contract documented at the top of the directory.
2. **Sudo prompt timing.** Auto-install would either fail loudly
   when run without sudo, or surprise an operator by asking for
   their password in a workflow that has historically been read-
   only. Both are worse than the explicit two-step
   (`pnpm doctor` → `scripts/doctor/install-chrome.mjs`).
3. **Cross-platform safety.** The install script targets Linux
   today. Auto-running it on macOS / WSL without per-platform
   logic risks creating broken symlinks or wrong-arch binaries.

## Out-of-scope mirroring rules

The autopilot/ directory is brand new in this change. No other
mirror tree needs to learn about it: it lives outside `packages/`
and `apps/`, and the scaffolded user output (which the CLI
generates) does not need a systemd unit.

The `AGENTS.md` dual-gate documentation lives at the repo root;
no per-package AGENTS.md needs the same paragraph.
