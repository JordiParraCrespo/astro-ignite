# autopilot Boundary

Runner-side artefacts that ship with the repo but execute outside it.
Today this directory holds the systemd unit that runs the autopilot on
the Hetzner runner. Files here are read by an operator with root
access, copied into `/etc/systemd/system/`, and reloaded via
`systemctl` — nothing here is invoked by `pnpm` or by CI.

## Public Contracts

- **Specs:** the runner's npm cache must stay writable for
  `npx lighthouse` to fetch when no vendored binary is on PATH —
  enforced by the `templates-perf` capability spec at
  `openspec/specs/templates-perf/spec.md` (audit invariants I1–I3 invoke
  `scripts/perf/run.mjs`, which in turn shells out to `npx lighthouse`).
- **Doctor:** `scripts/doctor/npm-cache-writable.mjs` probes the
  cache and emits a `warn` finding pointing back at this directory's
  unit file when the write fails with `EROFS` / `EACCES`. The fix-hint
  string names `autopilot/systemd/aig-runner.service` verbatim.
- **Root AGENTS:** the `Performance gates` section of root `AGENTS.md`
  names this directory as the source-of-truth location for the runner
  unit and points at the deployment contract below.

## Boundary Rules

Files in `autopilot/` MUST:

1. Be **operator-deployable artefacts only** — systemd units, env
   templates, supervisor scripts that an operator copies to the host.
   No code that the test suite or `pnpm build` imports.
2. Stay **plain text** (`.service`, `.env.example`, `.sh`) — no
   compiled output, no node_modules, no generated bundles.
3. Carry a header comment naming the deployment target path and the
   reload command. The unit file checked in today follows this rule.

## Deployment contract

The repo never deploys these files automatically. The operator runs:

```bash
sudo cp autopilot/systemd/aig-runner.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl restart aig-runner
```

`pnpm doctor`'s `npm-cache-writable` check confirms the deploy landed
(it emits `ok` once `ReadWritePaths=` in the deployed unit covers the
host's npm cache). The doctor never mutates `/etc/systemd/` itself.

## Expanding the boundary

- Adding a new unit (e.g., a timer for a recurring task) → add the
  `.service` / `.timer` file under `autopilot/systemd/`, document the
  reload command in this file, and update the root `AGENTS.md`
  `Performance gates` section if the new unit is part of the perf
  pipeline.
- Adding a non-systemd artefact (e.g., an env template) → name a new
  subdirectory after its consumer (`autopilot/env/`, `autopilot/cron/`)
  and add a "Deployment contract" subsection here that names the
  destination path and reload step.
- Anything that needs to run inside the repo's test / build pipeline
  → it does **not** belong here. Put it under `scripts/` instead.
