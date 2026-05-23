# Scripts Lib Boundary

Shared helpers imported by the scripts in `scripts/audit/`,
`scripts/perf/`, and `scripts/doctor/`. Not shipped; not a published
package.

## Rules

- **Named exports only**, no side-effecting imports — a helper must do
  nothing on import.
- Keep helpers small and dependency-light (Node built-ins preferred);
  these run directly via `node` from the repo root.
- No abstraction before the third caller — three similar inline blocks
  beat a premature shared helper (the repo-wide rule applies here too).
- If a helper encodes a locked practice, the invariant still lives in
  `openspec/specs/<capability>/spec.md`; this is plumbing, not contract.
