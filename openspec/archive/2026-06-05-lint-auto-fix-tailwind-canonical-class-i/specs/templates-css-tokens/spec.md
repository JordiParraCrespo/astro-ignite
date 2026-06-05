# Spec delta: templates-css-tokens / lint-auto-fix-tailwind-canonical-class-i

## ADDED Requirements

### Requirement: Tailwind class strings use the v4 canonical shorthand for CSS variables

Tailwind v4 provides a compact shorthand for class values that reference
CSS variables — `text-(length:--foo)`, `bg-(--color-bg)`,
`border-(--color-border)`, `ring-(--color-primary)` — that supersedes the
older `text-[length:var(--foo)]`, `bg-[var(--color-bg)]`,
`border-[var(--color-border)]`, `ring-[var(--color-primary)]` long-form
arbitrary-value syntax. Both forms compile to identical CSS, but mixing
them across templates produces drift in diffs and review noise.

Every `.astro` file in `packages/templates/{starter,docs}/src/**` and
`apps/{site,docs}/src/**` SHALL use the canonical short form for every
convertible class. Each of those packages' ESLint config SHALL enforce this
from the CLI via `eslint-plugin-better-tailwindcss` with three rules wired at
`error` (the rule ids below are the plugin's published v4 names — they replace
the speculative `enforce-shorthand-css-variables` / `sort-classes` ids the
proposal first guessed at):

- `better-tailwindcss/enforce-consistent-variable-syntax` — rewrites the long
  arbitrary-CSS-variable form (`bg-[var(--color-bg)]`) into the v4 short form
  (`bg-(--color-bg)`).
- `better-tailwindcss/enforce-consistent-class-order` — keeps class lists in
  canonical sort order so diffs stay clean.
- `better-tailwindcss/no-unnecessary-whitespace` — collapses leading,
  trailing, and internal extra whitespace inside `class="…"`.

ESLint resolves config per-package: each template/app runs `eslint src` from
its own directory. The `starter` and `docs` templates ship their own
`eslint.config.js`; `apps/{site,docs}` and the CLI packages inherit the root
config. Every config block sets the plugin's `entryPoint` to
`src/styles/global.css` so the plugin loads that package's own `@theme`
tokens, resolved relative to the package directory ESLint runs in. Because the
templates ship their own config, `eslint-plugin-better-tailwindcss` SHALL also
be a pinned `devDependency` in `packages/templates/{starter,docs}/package.json`
(in addition to the workspace root), so a scaffolded project lints out of the
box.

A root `pnpm lint:fix` script SHALL run `eslint src --fix` recursively across
every package that defines a `lint` script (matching the existing `pnpm lint`
filter that excludes `apps/playground/`) so contributors can resolve any
introduced drift with one command.

The rules apply only to convertible cases. Arbitrary classes that cannot be
expressed in v4 shorthand (e.g. `bg-[color-mix(...)]` has no shorthand; a
`calc()` arbitrary value cannot be a `(--var)` shorthand) are left untouched by
the auto-fixer and remain valid. `enforce-consistent-variable-syntax` also does
not rewrite data-type-typed arbitrary values such as
`text-[length:var(--ig-sans-size)]`; the handful of those in the source are
canonicalized to `text-(length:--ig-sans-size)` directly so no long-form
arbitrary-CSS-variable class remains.

#### Scenario: A contributor adds the long form

- **GIVEN** a contributor opens a PR that introduces
  `class="text-[var(--color-fg-muted)]"` in an `.astro` file
- **WHEN** `pnpm lint` runs in CI
- **THEN** ESLint exits non-zero with a
  `better-tailwindcss/enforce-consistent-variable-syntax` error pointing at
  the offending file and line, and the PR cannot merge until the
  contributor runs `pnpm lint:fix` (which rewrites the class to
  `class="text-(--color-fg-muted)"`).

#### Scenario: A contributor adds unsorted classes with stray whitespace

- **GIVEN** a contributor commits
  `class="  pb-4   pt-2 flex  gap-2 "`
- **WHEN** `pnpm lint` runs
- **THEN** ESLint flags both `enforce-consistent-class-order` and
  `no-unnecessary-whitespace`, and `pnpm lint:fix` rewrites the value to
  `class="flex gap-2 pt-2 pb-4"` (or whatever sort order the plugin
  produces against the project's Tailwind v4 config).

#### Scenario: An arbitrary class without a shorthand stays untouched

- **GIVEN** a component uses
  `class="bg-[color-mix(in_oklch,var(--color-success)_12%,var(--color-bg))]"`
- **WHEN** `pnpm lint:fix` runs
- **THEN** the class is left exactly as-is (no equivalent v4 shorthand
  exists), `pnpm lint` exits 0, and no false-positive error is raised.

#### Scenario: `entryPoint` resolves the per-template token set

- **GIVEN** the plugin lints
  `packages/templates/starter/src/components/common/Hero.astro`
  and `packages/templates/docs/src/components/docs/Callout.astro`
  in the same run
- **WHEN** each rule resolves the `--color-*` tokens for that file
- **THEN** the starter file is validated against
  `packages/templates/starter/src/styles/global.css` and the docs file
  against `packages/templates/docs/src/styles/global.css` — the two
  templates' token sets do not bleed into each other.

## Invariants (audit table) — additions

| Id  | Statement                                                                                                                | Audit                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I5  | Tailwind class strings use the v4 canonical shorthand for CSS variables (enforced by `eslint-plugin-better-tailwindcss`) | `pnpm lint` — exits 0 with no `better-tailwindcss/{enforce-consistent-variable-syntax,enforce-consistent-class-order,no-unnecessary-whitespace}` errors |
