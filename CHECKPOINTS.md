# CHECKPOINTS

Objective criteria for "this change is done." The reviewer (`.claude/agents/reviewer.md`)
walks these every time. A change is **APPROVED** only when every applicable
checkpoint is `[x]`.

## Global (apply to every change)

- [ ] **C1** — `pnpm install` succeeds at repo root.
- [ ] **C2** — `pnpm typecheck` is green.
- [ ] **C3** — `pnpm test` is green; every `S<n>` in `proposal.md` has at
      least one test that exercises it.
- [ ] **C4** — `pnpm format:check` is green.
- [ ] **C5** — `pnpm audit:invariants` returns zero for the change. Every
      `I<n>` in `design.md` is checked and its audit passed.
- [ ] **C6** — `openspec validate <change-name>` is green.
- [ ] **C7** — Every task in `tasks.md` is `[x]`, or has a documented
      justification in `progress/impl_<name>.md`.
- [ ] **C8** — A changeset entry exists under `.changeset/` for any
      change that ships in the CLI or a template.
- [ ] **C9** — Every commit on the branch was made via
      `scripts/committer --design openspec/changes/<name>/design.md`.
      No bypasses.
- [ ] **C10** — `pnpm doctor` is green at the end of the change. Nothing
      drifted (boundary symlinks, perf budget baseline, etc.).

## Scoped (apply when the change touches certain areas)

### When `capabilities` includes `templates-*` or `registry-*`

- [ ] **C11** — `pnpm perf:budget` passes. Every threshold in
      `openspec/specs/templates-perf/spec.md` is met.
- [ ] **C12** — `pnpm scaffold:test` is green (the broader e2e smoke).

### When the change touches `packages/templates/<kind>/`

- [ ] **C13** — `new-template` skill's 15-item audit is walked. Items the
      audit script can't check yet are walked manually and recorded in
      `progress/impl_<name>.md`.
- [ ] **C14** — `apps/site` and `apps/docs` (manual mirrors) are
      audited for whether the same change applies. If yes, mirror it in
      the same PR; if no, document why in `progress/impl_<name>.md`.

### When the change touches `packages/registry/`

- [ ] **C15** — `registry.json` is updated with correct
      `registryDependencies`; the new item resolves transitively.
- [ ] **C16** — No `import 'react'`, no Radix, no framework JS in the
      new component files (`pnpm audit:invariants` enforces).

### When the change touches the CLI (`packages/create-astro-ignite/`)

- [ ] **C17** — `scaffold.ts` dep-stripping branches still pass the
      `cli-dep-stripping` audit.
- [ ] **C18** — `pnpm scaffold:test` exercises the new CLI path.

### When the change touches a boundary (any `AGENTS.md` under

`packages/` or `apps/`)

- [ ] **C19** — The matching capability spec in `openspec/specs/` has a
      delta in `openspec/changes/<name>/specs/<capability>/spec.md`
      reflecting the new contract.
- [ ] **C20** — `CLAUDE.md` symlink at that subtree is intact
      (`pnpm doctor` boundary-symlinks check).

## When closing a change

- [ ] **C21** — The change folder has been moved to
      `openspec/archive/<YYYY-MM-DD>-<name>/` (with `runs/`, deltas, and
      `APPROVED` marker intact). `pnpm queue` now reports `done` for
      the feature.
- [ ] **C22** — Deltas under `openspec/changes/<name>/specs/<capability>/spec.md`
      were merged into the long-lived `openspec/specs/<capability>/spec.md`
      before the move (manual until the OpenSpec CLI's archive step is wired).
- [ ] **C23** — `progress/current.md` summary moved to
      `progress/history.md`; `progress/current.md` reset to template.
