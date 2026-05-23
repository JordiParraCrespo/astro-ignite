# CLI Core Boundary

`astro-ignite` is the **real** scaffolder — all prompts, templates, and
copy/rewrite logic live here. It is a one-shot CLI: prompt, copy a
template, rewrite `package.json` for what that template ships, install
deps, init git, then exit. The published bin is `astro-ignite`
(subcommand `bootstrap`, alias `init`). `create-astro-ignite` is only a
thin `npx` shim that calls into this package — see its AGENTS.md.

## Public Contracts

- **Spec:** `openspec/specs/cli-scaffold/spec.md` (the invariant catalog)
- **Source files** (`src/`):
- `index.ts` — entrypoint; parses the `bootstrap`/`init` subcommand
  and flags, orchestrates prompts → scaffold → install → git
- `prompts.ts` — the `@clack/prompts` flow (name, package manager,
  git init, install, **template**); `TEMPLATE_KINDS` is the source of
  the template list
- `scaffold.ts` — `ensureEmptyTarget` + `scaffoldProject`: copy the
  chosen `templates/<kind>/`, rewrite `package.json`, restore dotfiles
  (`_gitignore` → `.gitignore`), preserve symlinks verbatim
- `pm.ts`, `git.ts` — package-manager detection + git init helpers
- `types.ts` — shared types (`CliFlags`, `PackageManager`,
  `TemplateKind`, `TEMPLATE_KINDS`)
- `scaffold.test.ts` — the vitest contract for the copy + rewrite
- **Prepack:** `scripts/copy-templates.mjs` copies
  `../templates/<kind>/` into `./templates/<kind>/` so the published
  npm package is self-contained (skips `node_modules`/`dist`/`.astro`,
  renames `_gitignore` → `.gitignore`, preserves symlinks). The
  `templates/` dir is a generated copy — never hand-edit it; edit
  `packages/templates/*` instead.
- **End-user surface:** `astro-ignite bootstrap <name>` (or via the
  shim, `pnpm create astro-ignite <name>`). After scaffolding there is
  **zero runtime import** of `astro-ignite/*` in the generated project.

## Boundary Rules

- The generated project SHALL NOT import anything from `astro-ignite/*`
  or `create-astro-ignite/*`. No plugin, no shared config, no
  auto-update, no telemetry.
- `rewritePackageJson` strips deps the target template doesn't need
  (current rule: email/Resend deps are removed when
  `<template>/src/lib/email/index.ts` is absent). Apply the same
  `fileExists`-gated pattern for any new template-specific dep.
- Templates that use Astro Actions pin `@astrojs/node@^9` (not v10,
  which requires Astro 6).
- Package-manager detection covers pnpm, npm, yarn, bun via
  `process.env.npm_config_user_agent`; default falls back to pnpm.

## Common commands

```bash
pnpm --filter astro-ignite build       # tsup
pnpm --filter astro-ignite dev         # tsup --watch
pnpm --filter astro-ignite test        # vitest run (scaffold.test.ts)
pnpm --filter astro-ignite typecheck   # tsc --noEmit
```

## Expanding The Boundary

- Adding a template → add the kind to `TEMPLATE_KINDS`/`types.ts`, surface
  it in `prompts.ts`, add the matching `rewritePackageJson` branch in
  `scaffold.ts`, and extend `scaffold.test.ts`. Build the template under
  `packages/templates/<kind>/` via the `new-template` skill.
- Any change to the contract above triggers a delta in
  `openspec/changes/<name>/specs/cli-scaffold/spec.md`.
- Run `pnpm audit:invariants` (dispatches `cli-dep-stripping.mjs`) before
  requesting review.
