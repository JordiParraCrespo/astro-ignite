# CLI Boundary

The `create-astro-ignite` CLI is a one-shot scaffolder. It prompts,
copies a template, rewrites `package.json` based on what the target
template ships, runs install + git init, then exits.

## Public Contracts

- **Spec:** `openspec/specs/cli-scaffold/spec.md` (the invariant catalog)
- **Definition files:**
- `src/types.ts` — shared types for prompts, templates, scaffold options
- `src/prompts.ts` — the prompt flow
- `src/scaffold.ts` — the copy + rewrite + install orchestration
- `src/pm.ts`, `src/git.ts` — pm detection + git init helpers
- **End-user surface:** `pnpm create astro-ignite <name>` (or `npm` /
  `yarn` / `bun` equivalents). After the scaffold, there is **zero
  runtime import** of `astro-ignite/*` in the generated project.

## Boundary Rules

- After scaffold completion, the generated project SHALL NOT import
  anything from `astro-ignite/*` or `create-astro-ignite/*`. No plugin,
  no shared config, no auto-update mechanism.
- `rewritePackageJson` strips deps the target template doesn't need
  (current rule: email/Resend deps are removed when
  `<template>/src/lib/email/index.ts` is absent). Apply the same pattern
  for any new dep that's template-specific.
- Templates that use Astro Actions pin `@astrojs/node@^9` (not v10,
  which requires Astro 6).
- Package-manager detection covers pnpm, npm, yarn, and bun, via
  `process.env.npm_config_user_agent`. Default falls back to pnpm.
- Do not import test files from production code; do not import production
  code from test fixtures outside the CLI package.

## Expanding The Boundary

- Adding a new template → extend `TEMPLATES` in `prompts.ts`, add the
  matching branch in `scaffold.ts:rewritePackageJson`, and write the
  e2e test in `test/scaffold.test.ts`.
- Adding a new prompt → update `src/prompts.ts` and the relevant types
  in `src/types.ts`; document the new option in this file and (if it
  changes scaffolded output) in the relevant `openspec/specs/templates-*`.
- Any change to the contract above triggers a delta in
  `openspec/changes/<name>/specs/cli-scaffold/spec.md`. Update the
  capability spec in the same change.
- Run `pnpm audit:invariants` (which dispatches `cli-dep-stripping.mjs`)
  before requesting review.
