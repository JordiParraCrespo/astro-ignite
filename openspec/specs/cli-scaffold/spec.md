# Capability: cli-scaffold

## Purpose

The `create-astro-ignite` CLI is a one-shot scaffolder. It prompts,
copies a template, rewrites `package.json` to match the user's choices,
runs install + git init, then exits. After scaffold there is **no
runtime dependency** on `astro-ignite/*`; the user owns every line.

## Boundary

Owned by: `packages/create-astro-ignite/src/{index,prompts,scaffold,pm,git,types}.ts`.

Touched by: every template (the CLI copies them); never the other way
around.

## Requirements

### Requirement: One-shot scaffolder, zero runtime imports

After scaffold, the generated project SHALL NOT import anything from
`astro-ignite/*` or `create-astro-ignite/*`. No plugin, no shared
config, no auto-update.

#### Scenario: Scaffold + inspect

- **GIVEN** the user runs `pnpm create astro-ignite my-site`
- **WHEN** the scaffold completes and `node_modules` is removed
- **THEN** `grep -r "astro-ignite" my-site/` returns only the
  README/changelog refs (documentation), not import statements.

### Requirement: `rewritePackageJson` strips deps the target template doesn't need

`scaffold.ts:rewritePackageJson` SHALL inspect the target template and
strip dependencies that are unused. Current rule: email/Resend deps are
removed when `src/lib/email/index.ts` is absent (the docs template
exercises this).

#### Scenario: Scaffolding the docs template

- **GIVEN** the user picks `docs`
- **WHEN** the scaffold writes `package.json`
- **THEN** `resend`, `@astrojs/node`, and any other email-only deps are
  absent from `dependencies` and `devDependencies`.

#### Scenario: Scaffolding the starter template

- **GIVEN** the user picks `starter` (which uses Actions + email)
- **WHEN** the scaffold writes `package.json`
- **THEN** `resend` and `@astrojs/node@^9` are present.

### Requirement: Adapter pin

Templates that use Astro Actions SHALL pin `@astrojs/node@^9`. The
combination of Astro v6 with `@astrojs/node@^10` is not supported until
the rest of the stack migrates.

#### Scenario: Auditing starter's package.json

- **GIVEN** starter ships with Actions
- **WHEN** the audit runs
- **THEN** `@astrojs/node` is present and pinned to `^9`.

### Requirement: Package manager detection

The CLI SHALL detect the user's package manager from
`process.env.npm_config_user_agent` and use it for the install step.
Falls back to `pnpm` if undetectable.

#### Scenario: `bun create astro-ignite`

- **GIVEN** the user invokes via bun
- **WHEN** the install step runs
- **THEN** the CLI runs `bun install`, not `pnpm install`.

### Requirement: Git init is opt-in

The CLI SHALL prompt for `git init` (default: yes) and respect the
answer. It never force-initializes a repo over an existing one.

#### Scenario: Scaffolding inside an existing repo

- **GIVEN** the target directory is already a git repo
- **WHEN** the user accepts the git-init prompt
- **THEN** the CLI logs a warning and skips `git init`.

## Invariants (audit table)

| Id  | Statement                                                                                    | Audit                                                   |
| --- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| I1  | `rewritePackageJson` strips email deps if `src/lib/email/index.ts` is absent in the template | `node scripts/audit/cli-dep-stripping.mjs`              |
| I2  | Templates using Actions pin `@astrojs/node@^9`                                               | `node scripts/audit/cli-dep-stripping.mjs --adapter`    |
| I3  | No scaffolded output imports from `astro-ignite/*`                                           | `node scripts/audit/cli-dep-stripping.mjs --no-imports` |
| I4  | Package manager detection covers pnpm / npm / yarn / bun                                     | `node scripts/audit/cli-dep-stripping.mjs --pm`         |
