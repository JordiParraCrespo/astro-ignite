# Capability: templates-css-tokens

## Purpose

Components and pages reference CSS variables, not raw zinc/Tailwind
classes for colors. The zinc scale exists at the bottom of `global.css`
only as the source of token values. Tri-state dark mode (`.light` /
`.dark` / system) flips tokens; component code never knows.

## Boundary

Owned by: `packages/templates/<kind>/src/styles/global.css`,
`packages/registry/base/*`, and every component that renders color.

Touched by: nothing else — themes change exclusively through token
values.

## Requirements

### Requirement: Components reference tokens, never raw zinc

Every component file (`.astro`, `.ts`, `.css`) SHALL reference colors
through CSS variables (`--color-bg`, `--color-fg`, `--color-primary`,
`--color-border`, `--color-muted`, `--color-accent`) or Tailwind
utilities that map to those variables. Raw `bg-zinc-*`, `text-zinc-*`,
or hex literals like `#0a0a0a` are forbidden in components.

#### Scenario: A new component renders a background
- **GIVEN** a new `<Card>` component
- **WHEN** it sets a background color
- **THEN** the audit passes only if the value is `var(--color-bg)`,
  `bg-[color:var(--color-bg)]`, or a Tailwind class wired to the token
  layer.

### Requirement: Zinc lives only in `global.css`

The zinc scale (or any raw color palette) SHALL only appear in
`packages/templates/<kind>/src/styles/global.css` as the source of
`--color-*` token values.

#### Scenario: Auditing global.css
- **GIVEN** `global.css` contains zinc references
- **WHEN** the audit runs
- **THEN** the file is exempt from the no-zinc rule.

### Requirement: Tri-state dark mode flips tokens via `.light` / `.dark`

Theme switching SHALL be implemented by toggling a class on `<html>`
(`.light` for explicit light, `.dark` for explicit dark, no class for
system). The class flips token values; no component reads
`prefers-color-scheme` directly.

#### Scenario: Toggling theme
- **GIVEN** the user clicks the theme toggle
- **WHEN** the toggle adds `.light` to `<html>`
- **THEN** every `--color-*` resolves to its light value; no component
  rerenders.

### Requirement: Layered CSS strategy

Above-the-fold components SHALL use scoped `<style>` blocks. Below-the-fold
SHALL use Tailwind v4 utilities. Beasties extracts critical CSS at
build time.

#### Scenario: A new hero component is added
- **GIVEN** a hero on the landing page (above the fold)
- **WHEN** the author writes its styles
- **THEN** they go in a `<style>` block inside `Hero.astro`, not in a
  Tailwind class soup.

## Invariants (audit table)

| Id | Statement | Audit |
|----|-----------|-------|
| I1 | No raw zinc / hex in component files | `node scripts/audit/tokens-only.mjs` |
| I2 | `global.css` defines `--color-*` tokens | `node scripts/audit/tokens-only.mjs --config` |
| I3 | Tri-state dark mode wired (`.light` class flips tokens) | `node scripts/audit/tokens-only.mjs --darkmode` |
| I4 | Above-the-fold uses scoped `<style>` (heuristic — flag overuse of Tailwind in `Hero.astro`, `Header.astro`) | `node scripts/audit/tokens-only.mjs --layered` |
