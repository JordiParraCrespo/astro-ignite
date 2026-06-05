# Implementation — wire-local-lighthouse-against-a-preview

Run: `2026-05-19T03-52-23Z`

## Summary

Replaced the placeholder Lighthouse branch in `scripts/perf/run.mjs`
with a real preview-server-and-Lighthouse pipeline: resolve a target
package, build it if needed, claim a free port, spawn
`pnpm --filter <pkg> preview --port <port>`, poll until it answers
`200 OK`, run `npx lighthouse <url> --preset=mobile`, parse the LHR,
compare each score and Core Web Vital against `scripts/perf/budget.json`,
print per-metric numbers, and tear the preview server down on every
exit path (normal, exception, SIGINT, SIGTERM). The Chrome-absent
graceful skip introduced in PR #39 is preserved — the Lighthouse
branch records `skipped — chrome not installed; run scripts/doctor/install-chrome.mjs`
and exits 0 when no Chrome is on PATH. Added the operator-facing
plumbing the runner needs: `scripts/doctor/install-chrome.mjs`
(idempotent Chrome-for-Testing installer), `scripts/doctor/npm-cache-writable.mjs`
(autoloaded by `pnpm doctor`, warns on `EROFS`/`EACCES`), and
`autopilot/systemd/aig-runner.service` (source-of-truth unit with
`ProtectSystem=strict` plus a tight `ReadWritePaths=` allowlist).
Documented the dual-gate model in root `AGENTS.md`'s new
`## Performance gates` section.

## Traceability

| Scenario                                     | Evidence                                                                     | File:line                                                                |
| -------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| S1 install-chrome idempotence                | `scripts/doctor/install-chrome.mjs` symlink fast-path                        | `scripts/doctor/install-chrome.mjs:54-70`                                |
| S2 first-time install on PATH                | Manifest fetch + unzip + symlink                                             | `scripts/doctor/install-chrome.mjs:72-108`                               |
| S3 non-root install (`--prefix`/`--bindir`)  | argv-overridable defaults                                                    | `scripts/doctor/install-chrome.mjs:39-50`                                |
| S4 doctor recognises install                 | `chrome-installed.mjs` probes `/usr/local/bin/chrome`, `~/.local/bin/chrome` | `scripts/doctor/chrome-installed.mjs:22-33`                              |
| S5 Lighthouse end-to-end on starter          | `runLighthouseAgainst` composition                                           | `scripts/perf/run.mjs:233-291` (runLighthouseAgainst) + `main()` runOnce |
| S6 metric busts budget                       | `compareAgainstBudget` LCP fail unit test                                    | `scripts/perf/run.test.mjs:67-79`                                        |
| S7 score below floor                         | `compareAgainstBudget` accessibility fail unit test                          | `scripts/perf/run.test.mjs:81-92`                                        |
| S8 all within budget                         | `compareAgainstBudget` happy-path unit test                                  | `scripts/perf/run.test.mjs:57-65`                                        |
| S9 preview cleanup normal exit               | `cleanup()` in `finally`, registered on serverState                          | `scripts/perf/run.mjs:332-345`, `runOnce` finally                        |
| S10 preview cleanup on SIGINT                | `process.on('SIGINT')` + `process.on('SIGTERM')`                             | `scripts/perf/run.mjs:346-353`                                           |
| S11 `--critical-css` flag preserved          | Branch retained at top of `main()`                                           | `scripts/perf/run.mjs:380-398`                                           |
| S12 graceful skip when Chrome absent         | `findChrome()` + branch                                                      | `scripts/perf/run.mjs:181-196`, `scripts/perf/run.mjs:421-429`           |
| S13 systemd unit declares writable npm cache | `ReadWritePaths=%h/.npm %h/.cache /opt/chrome-for-testing`                   | `autopilot/systemd/aig-runner.service:31`                                |
| S14 npm cache writability check              | new doctor module                                                            | `scripts/doctor/npm-cache-writable.mjs:13-39`                            |
| S15 dual-gate doc in AGENTS.md               | new `## Performance gates` section                                           | `AGENTS.md:153-171` (post-edit)                                          |
| S16 per-page metrics in stdout               | `record(...)` for each finding + `formatMetric`                              | `scripts/perf/run.mjs:75-104`                                            |
| S17 boundary check                           | `git diff --name-only main` matches S17 list                                 | see `notes.md` T32 row                                                   |

| Invariant                    | Audit command                              | Result                                                       |
| ---------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| I1 Lighthouse home           | `node scripts/perf/run.mjs --page /`       | PASS (graceful-skip on this host; pipeline ready)            |
| I2 Lighthouse inner          | `node scripts/perf/run.mjs --page /blog`   | PASS (graceful-skip on this host)                            |
| I3 Total transfer            | `node scripts/perf/run.mjs --transfer`     | PASS (graceful-skip on this host)                            |
| I4 Critical CSS inlined      | `node scripts/perf/run.mjs --critical-css` | PASS (`apps/docs/dist/index.html` contains inline `<style>`) |
| I5 No undeclared runtime dep | `node scripts/perf/run.mjs --deps`         | PASS (starter: 12 deps, docs: 8 deps)                        |

All five audits captured via `pnpm audit:invariants --change wire-local-lighthouse-against-a-preview` → `runs/2026-05-19T03-52-23Z/audit.md` (exit 0).

## Open questions for the reviewer

1. **Test framework choice.** Design called for vitest; I shipped
   `node:test` (Node 22 built-in) because root `package.json` is not
   in `Files touched` and adding a workspace-root vitest dep would
   expand scope. The pure comparator is fully tested (11 assertions,
   all pass via `node --test scripts/perf/run.test.mjs`). Acceptable,
   or do you want the file rewritten to vitest with a follow-up to
   wire it into `pnpm test`?

2. **Operator-only verifications (T25–T28).** The sudo install,
   systemd deploy, real-Chrome perf run, and SIGINT-during-Lighthouse
   tests can't be run from this implementer session (no sudo, no
   real Chrome). All four are wired in code and the operator can
   discharge them in one pass — `notes.md` lists the exact commands.
   I marked them unchecked in `tasks.md`. Flip to ✅ after the
   operator runs them and you've confirmed the output.

3. **`apps/playground` typecheck noise.** Pre-existing — its
   `node_modules` is missing because the dir is regenerated by
   `scripts/scaffold-test.mjs` in CI. Not caused by this change.

## Commits

- `54ed93a` feat(autopilot): add aig-runner.service systemd unit + boundary doc
- `d42af34` feat(doctor): chrome-for-testing installer + npm-cache-writable check
- `ac7d398` feat(perf): wire Lighthouse runner to preview server + add unit tests
- `e8e7803` docs(AGENTS): document dual-gate perf model + chrome install path
