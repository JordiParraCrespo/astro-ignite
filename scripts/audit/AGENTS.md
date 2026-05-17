# scripts/audit Boundary

Static-analysis scripts that enforce the invariants in
`openspec/specs/<capability>/spec.md`. Invoked individually by name, or
collectively by `pnpm audit:invariants` (which dispatches based on a
specific change's `design.md`).

## Public Contracts

- **Specs:** every `openspec/specs/<capability>/spec.md` declares its
  invariants table; the `audit:` column on each row points to a script
  here.
- **Plan reference:** `AGENTS.md` T2 — the audit tier of the
  verification layer.

## Boundary Rules

Every audit script in this directory MUST:

1. Be a `.mjs` file invoked via `node scripts/audit/<name>.mjs`.
2. Accept flags via `argv` (no `commander` / `yargs` dep).
3. Emit a **human-readable report on stdout** (✅ / ❌ + per-hit
   `file:line — snippet` lines).
4. Emit **one JSON line on stderr** with the shape
   `{ audit, pass: boolean, hits: [...], notes: string }`. This is the
   machine-readable result that `run-all.mjs` consumes and renders into
   `openspec/changes/<name>/runs/<latest>/audit.md` (or
   `openspec/changes/<name>/audit.md` as a pre-flight fallback).
5. **Exit non-zero** on any failure. Zero on pass.
6. Use only built-in Node modules (`fs/promises`, `path`, `child_process`,
   etc.) plus `_lib.mjs` helpers. No npm deps.
7. Live in this directory — no audit logic in component code, no logic
   under `scripts/perf/` or `scripts/doctor/`.

## Expanding The Boundary

- Adding a new audit → name it after the invariant family it checks
  (e.g., `tokens-only.mjs`, not `check.mjs`). Add the script + a row in
  the relevant `openspec/specs/<capability>/spec.md` invariants table
  pointing to it.
- Extending an existing audit with a new flag → preserve previous
  flag-less behavior so existing change `design.md` files don't break.
- If an invariant can't be statically checked, note "manual until
  automated" in the spec's audit cell, and skip the script. Don't fake
  a passing script.
- `scripts/doctor/audits-present.mjs` enforces that every entry in the
  `required` list it ships has a file here. Update that list when you
  add or rename an audit.
