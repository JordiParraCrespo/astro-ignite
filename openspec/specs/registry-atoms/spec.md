# Capability: registry-atoms

## Purpose

Atoms in `packages/registry/base/*` are the lowest-level UI building
blocks. They are Astro + vanilla JS, period. No React, no Vue, no
Svelte, no Radix, no headless-UI library. Interactive primitives reach
for native HTML first; custom elements only when native won't do it.

## Boundary

Owned by: `packages/registry/base/*`, `packages/registry/lib/cn.ts`,
`packages/registry/lib/toast.ts`.

Touched by: every template that ships a UI surface. Atoms are _copied_
into `src/components/ui/` at scaffold time; users own them after that.

## Requirements

### Requirement: No client-side framework

Atom source files SHALL NOT import React, Vue, Svelte, Solid, Preact,
Radix UI, headless-ui, or any other client-side framework / component
library. The only allowed runtime is the browser.

#### Scenario: A contributor wants a tooltip

- **GIVEN** a new tooltip component is being added
- **WHEN** the audit runs
- **THEN** the audit fails if any import resolves to `react`, `radix`,
  `@headlessui/*`, etc.

### Requirement: Native HTML primitives first

Interactive primitives SHALL use native HTML wherever it works:
`<details name>` for accordion, `<dialog>` for dialog, popover API for
dropdown, CSS-only `:hover` + `:focus-visible` for tooltip.

#### Scenario: Adding a new accordion

- **GIVEN** a new accordion atom
- **WHEN** the implementation is reviewed
- **THEN** the markup is `<details name="...">` and the `name` attribute
  groups mutually-exclusive items.

### Requirement: Custom elements only when native won't do it

When native HTML can't express the interaction (tabs, toasts), the
implementation SHALL be a custom element (`<ai-tabs>`, `<ai-toaster>`)
defined in the same file as the markup, registered idempotently.

#### Scenario: Building tabs

- **GIVEN** native HTML can't express selected/unselected tab state
  cleanly
- **WHEN** the contributor implements tabs
- **THEN** the result is a `<ai-tabs>` custom element, not a React port.

### Requirement: One concept per file, named exports

Each atom SHALL live in one file with a clear, named export.
Compound families (card, tabs, accordion, dialog, dropdown-menu) live in
`base/<family>/` with one file per part. Default exports are forbidden.

#### Scenario: Adding a Card

- **GIVEN** Card has Header / Body / Footer
- **WHEN** the family is added
- **THEN** the source lives in `base/card/Card.astro`,
  `base/card/CardHeader.astro`, etc., each with a named export.

### Requirement: Every atom depends on `cn` only (transitively, on each other)

Atoms SHALL list their dependencies in `registry.json` such that the
graph resolves transitively. The root dependency is always `cn` from
`lib/cn.ts`.

#### Scenario: A new atom is registered

- **GIVEN** the new atom uses `cn` to merge classes
- **WHEN** `registry.json` is updated
- **THEN** the new entry includes `"registryDependencies": ["cn"]`.

## Invariants (audit table)

| Id  | Statement                                                                 | Audit                                                      |
| --- | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| I1  | No React / Vue / Svelte / Radix imports in `base/`                        | `node scripts/audit/no-react-in-atoms.mjs`                 |
| I2  | No default exports in atom source files                                   | `node scripts/audit/no-react-in-atoms.mjs --named-only`    |
| I3  | Every atom in `registry.json` has at least `cn` in `registryDependencies` | `node scripts/audit/no-react-in-atoms.mjs --registry`      |
| I4  | Compound families live in `base/<family>/` (no single mega-file)          | `node scripts/audit/no-react-in-atoms.mjs --family-layout` |
