# Delta: registry-blocks — restructure-starter-template-component-o

The registry blocks tier currently has exactly one item:
`not-found-state` (`registry:block`), copied from
`packages/registry/blocks/not-found-state.astro` into the starter's
`src/components/blocks/not-found-state.astro` at scaffold time.

This change merges the 404 surface into a single starter-side
composition (`src/components/not-found/NotFoundHero.astro`) and
removes the registry's blocks tier until a real, parametrised
composition lands (the future first block is the `PricingCard` from
feature `#2 — registry-block-pricing-card`).

After this change:

- `packages/registry/blocks/` does not exist.
- `packages/registry/registry.json` has no entry with
  `"type": "registry:block"`.
- The starter's `src/components/blocks/` directory does not exist.

The capability's behavioural rules (Astro + vanilla only, blocks
compose atoms, demoed on `apps/site/`, transitively-resolved
`registryDependencies`) are unchanged. They become vacuously true
while the tier is empty.

## ADDED Requirements

### Requirement: `registry.json` lists no `registry:block` entries while the tier is empty

While `packages/registry/blocks/` is absent (or empty),
`packages/registry/registry.json` SHALL NOT list any item whose
`type` is `registry:block`. Stale block entries that point at
missing files are forbidden.

This requirement is in force only as long as the blocks tier is
empty. The first real block (e.g. `PricingCard` per feature #2)
will re-introduce `packages/registry/blocks/<name>/` and a matching
manifest entry, at which point the existing requirements
(I1–I4) take over normally.

#### Scenario: Auditing the registry manifest today

- **GIVEN** the post-change tree
- **WHEN** `registry.json` is parsed
- **THEN** every item has `type` of `registry:lib` or
  `registry:ui`. No `registry:block` entry exists.

#### Scenario: A contributor adds a manifest entry without source

- **GIVEN** a contributor wants to pre-register a `pricing-card`
  block before authoring the file
- **WHEN** they add `{ "name": "pricing-card", "type":
"registry:block", "files": [...] }` to `registry.json` without
  creating the source under `blocks/`
- **THEN** the audit fails because `files[].path` points at a
  missing source file. The contributor must either land the source
  or omit the entry.

## MODIFIED Requirements

### Requirement: Blocks tier is deferred until a real composition lands

The registry's blocks tier (`packages/registry/blocks/*`) is
**currently deferred**. The capability's existing behavioural rules
(blocks compose atoms, no client framework, demoed on
`apps/site/`, `registryDependencies` resolves transitively) stand
for **when** the tier reopens, but no `registry:block` item ships
in the meantime.

#### Scenario: First real block lands (future)

- **GIVEN** feature `#2 — registry-block-pricing-card` introduces
  `packages/registry/blocks/pricing-card/PricingCard.astro`
- **WHEN** the contributor wires it into `registry.json` with
  `registryDependencies: ["cn", "card", "button"]`
- **THEN** every behavioural invariant (I1–I4) snaps back into
  enforcement against the new entry, and the deferral requirement
  above ceases to apply.

#### Scenario: A contributor reaches for a block today

- **GIVEN** a contributor wants to compose a marketing surface
  before the blocks tier reopens
- **WHEN** they place the composition
- **THEN** they place it under the starter's
  `src/components/common/` or `src/components/<feature>/`, not under
  `packages/registry/blocks/`. The composition stays in the template
  until a parametrised, distributable shape emerges.

## REMOVED Requirements

_None._ I1–I4 stay in the long-lived spec; they are vacuously
satisfied while no blocks exist and snap back into enforcement once
the first block lands.

## Notes

- **Why merge instead of keep both 404 files.** The pre-change tree
  had `src/components/blocks/not-found-state.astro` (mirrored from
  the registry) and
  `src/components/sections/not-found/NotFoundHero.astro` (added by
  change #28). Both render a 404 surface. The duplication has no
  reader-friendly justification — the section component already
  composes the markup the registry block contained. Collapsing to a
  single starter-side file removes the ambiguity and resolves the
  issue's "duplicate 404 concept" complaint.
- **Future blocks return.** Feature `#2 —
registry-block-pricing-card` is the next block. When it lands it
  re-introduces `packages/registry/blocks/pricing-card/` and a
  matching `registry:block` entry. At that point this delta's
  MODIFIED requirement closes (deferral ends) and the existing
  behavioural invariants take over.
- **Audit hook.** `pnpm audit:invariants` already dispatches
  `node scripts/audit/no-react-in-atoms.mjs --include-blocks`. After
  this change that script finds zero block files and reports pass.
  No new audit script is needed.
