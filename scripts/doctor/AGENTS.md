# Doctor Boundary

Environment health + provisioning for the harness. Backs `pnpm doctor`.

## What's here

- Health checks that report whether the workspace can run the gates:
  e.g. `npm-cache-writable` (npx Lighthouse needs a writable
  `~/.npm/_cacache/`), Chrome availability, harness wiring.
- `install-chrome.mjs` — idempotent installer for a **pinned**
  Chrome-for-Testing build under `/opt/chrome-for-testing/` with a
  `/usr/local/bin/chrome` symlink. Used by the perf gate
  (`scripts/perf/`) and the banner pipeline. Needs sudo on a fresh
  runner.

## Rules

- Checks are advisory and must **never** hard-fail a healthy dev
  machine — degrade to a warning when an optional tool is absent.
- Keep Chrome **pinned**; an unpinned upgrade silently shifts Lighthouse
  scores. Update the version deliberately, in one place.
- The perf gate's graceful-skip contract depends on this: if no Chrome
  is found on PATH or via the known symlinks, the local Lighthouse run
  skips (exit 0) and points at `install-chrome.mjs`. CI never skips.
