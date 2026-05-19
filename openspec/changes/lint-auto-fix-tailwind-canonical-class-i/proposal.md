# Proposal: lint-auto-fix-tailwind-canonical-class-i

Capabilities: `templates-css-tokens`
Issue: #55

## Why

Tailwind v4 introduced a compact CSS-variable syntax — `text-(length:--foo)`,
`bg-(--color-bg)`, `border-(--color-border)` — that supersedes the older
long-form arbitrary-value syntax — `text-[length:var(--foo)]`,
`bg-[var(--color-bg)]`, `border-[var(--color-border)]`. The two forms render
identically, but mixing them across templates produces drift in diffs and
review noise.

The Tailwind CSS IntelliSense extension already flags the long form
(`suggestCanonicalClasses`) inside VS Code as a per-editor hint, but nothing
in our toolchain rewrites it from the CLI:

- `prettier` + `prettier-plugin-astro` do not touch arbitrary class values.
- The current `eslint.config.js` registers `@eslint/js`, `typescript-eslint`,
  `eslint-plugin-astro`, and `eslint-plugin-jsx-a11y` only — no Tailwind plugin.
- `suggestCanonicalClasses` is implemented inside `@tailwindcss/language-server`
  and is unreachable from `pnpm lint`.

That means we cannot pre-commit or CI-gate the canonical form. The drift is
real — `packages/templates/starter/src/components/**/*.astro` already mixes
`text-[var(--color-fg-muted)]` (long form) with `bg-(--color-surface-2)`
(short form) in adjacent files.

This change wires `eslint-plugin-better-tailwindcss` (the actively-maintained
fork of `eslint-plugin-tailwindcss` with Tailwind v4 support) into the root
ESLint config with three auto-fixable rules, runs the auto-fix sweep once
across the source tree, and locks the rules at `error` so future drift is
blocked by CI.

The change is plumbing, not a styling rewrite. The auto-fixer rewrites class
strings only — every component's resolved styles, computed colors, and DOM
output stay identical. Visual parity is the gate.

## Scope

In:

- Root `package.json` (`devDependencies` + `lint:fix` script).
- Root `eslint.config.js` (register plugin + three rules at `error`,
  per-template `entryPoint` settings).
- Auto-fix sweep over class strings under:
  - `packages/templates/starter/src/**/*.astro`
  - `packages/templates/docs/src/**/*.astro`
  - `packages/registry/base/**/*.astro`
  - `apps/site/src/**/*.astro`
  - `apps/docs/src/**/*.astro`
- Refreshed CLI template cache at `packages/astro-ignite/templates/{starter,docs}/`
  via `node packages/astro-ignite/scripts/copy-templates.mjs`.
- One changeset documenting the addition as a non-breaking lint hardening.

Out:

- `apps/playground/` — already excluded from the lint runner; the next
  `pnpm scaffold:test` regenerates it from the refreshed cache.
- `prettier-plugin-tailwindcss` — conflicts with `better-tailwindcss/sort-classes`;
  pick one source of truth (the ESLint plugin, which also handles canonical-form
  rewrites beyond sorting).
- Editor-side `.vscode/settings.json` configuration — keep the gate CLI-first
  so it works for every contributor regardless of IDE.
- Migrating arbitrary classes that **cannot** be expressed as Tailwind v4
  shorthand (e.g. `rounded-[var(--radius-sm)]` is already canonical because
  the value is a length, not a registered token). The rules only flag the
  convertible cases.

## Scenarios

### S1 — `enforce-shorthand-css-variables` rewrites the long form

- **GIVEN** a starter component contains
  `class="text-[length:var(--ig-sans-size)] text-[var(--color-fg-muted)]"`
- **WHEN** the contributor runs `pnpm lint:fix`
- **THEN** the file is rewritten to
  `class="text-(length:--ig-sans-size) text-(--color-fg-muted)"`
  and `pnpm lint` exits 0 with no `better-tailwindcss` errors remaining.

### S2 — `sort-classes` and `no-unnecessary-whitespace` apply

- **GIVEN** an Astro file contains `class="  pb-4  pt-2  flex   gap-2 "`
  (out-of-order classes, leading / trailing / internal extra whitespace)
- **WHEN** `pnpm lint:fix` runs
- **THEN** the class string is rewritten to the canonical sorted form
  with single-space separators (e.g. `class="flex gap-2 pt-2 pb-4"`),
  matching the plugin's sort order for the project's Tailwind v4 config.

### S3 — CI blocks drift after the sweep

- **GIVEN** a follow-up PR re-introduces `class="bg-[var(--color-bg)]"`
- **WHEN** `pnpm lint` runs in CI
- **THEN** ESLint exits non-zero with a `better-tailwindcss/enforce-shorthand-css-variables`
  error pointing at the offending file and line, and the PR cannot merge
  until the contributor runs `pnpm lint:fix`.

### S4 — Visual output is unchanged

- **GIVEN** the auto-fix sweep has rewritten every convertible class
- **WHEN** `pnpm --filter @astro-ignite/template-starter build` runs and the
  resulting HTML / CSS is compared against the pre-sweep build
- **THEN** computed styles for every element are identical (the rewrites are
  semantic no-ops at the Tailwind compiler level) and `pnpm scaffold:test`
  passes with no Lighthouse regression.

### S5 — `entryPoint` resolves project tokens

- **GIVEN** `eslint.config.js` registers `better-tailwindcss` with overrides
  that point each template's source tree at its own `src/styles/global.css`
- **WHEN** ESLint lints
  `packages/templates/starter/src/components/common/Hero.astro`
- **THEN** the plugin loads `packages/templates/starter/src/styles/global.css`
  as the entry point, sees the template's registered `--color-*` tokens, and
  the rewrites for that file resolve against the starter's token set (not the
  docs template's).

### S6 — CLI cache mirrors the rewritten source

- **GIVEN** the auto-fix sweep has rewritten files under
  `packages/templates/{starter,docs}/src/`
- **WHEN** `node packages/astro-ignite/scripts/copy-templates.mjs` runs as
  part of the change
- **THEN** every rewritten file under `packages/astro-ignite/templates/{starter,docs}/`
  is byte-for-byte equal to its source under `packages/templates/{starter,docs}/`
  (modulo the documented intentional differences in `copy-templates.mjs`),
  and a fresh `pnpm pack` would ship the canonical class form to end users.

### S7 — No new runtime dependency lands in a template

- **GIVEN** the change adds `eslint-plugin-better-tailwindcss`
- **WHEN** `git diff` is inspected against every `packages/templates/*/package.json`
  and `apps/*/package.json`
- **THEN** the diff is empty — the plugin lives only in the root
  `devDependencies`, and `pnpm audit:invariants --change lint-auto-fix-tailwind-canonical-class-i`
  passes the `no-new-runtime-deps` check on every template.

### S8 — Changeset documents the lint hardening

- **GIVEN** an end user scaffolded the starter or docs template before this
  change and wants to opt in
- **WHEN** they open `.changeset/lint-auto-fix-tailwind-canonical-class-i.md`
- **THEN** the entry classifies the change as a non-breaking lint hardening,
  lists the new devDep + rules, and tells the user to copy the
  `eslint.config.js` block and run `pnpm lint:fix` in their scaffolded repo.
