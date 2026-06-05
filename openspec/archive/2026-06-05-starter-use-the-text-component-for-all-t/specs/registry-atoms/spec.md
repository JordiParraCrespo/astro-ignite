# Delta: registry-atoms — starter-use-the-text-component-for-all-t

This change adopts the existing `text` atom across the starter template.
The atom contract (`packages/registry/base/text.astro`) is the same
before and after, and the registry manifest entry (`registry.json` →
`text` with `registryDependencies: ["cn"]`) does not change.

If the implementer extends the atom's variant set in lockstep across
`packages/registry/base/text.astro` and the starter mirror at
`packages/templates/starter/src/components/ui/text.astro`, that
extension is a non-breaking growth of the variant union — it does not
alter the atom contract, the family layout, or the dependency graph.

## ADDED Requirements

_None._

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._

## Notes

- **Why no spec delta?** The capability spec defines what an atom must
  _be_ (no client framework, native HTML first, named exports, one
  concept per file, transitive `cn` dependency). The refactor does not
  add an atom, remove an atom, or change any atom's signature in a way
  that violates the four invariants in the audit table.
- **Invariant status:**
  - **I1** (no React / Vue / Svelte / Radix imports) — preserved. No
    framework imports are added.
  - **I2** (no default exports in atom source `.ts` files) — preserved.
    `text.astro` keeps its named `Props` export; the `.astro` default
    export is the component itself (allowed by the audit).
  - **I3** (`cn` in `registryDependencies`) — preserved. The
    `registry.json` entry for `text` already lists `["cn"]`.
  - **I4** (compound families live in `base/<family>/`) — preserved.
    `text` is single-file; no family is introduced.
- **Audit:** `node scripts/audit/no-react-in-atoms.mjs --named-only
--registry --family-layout` must continue to pass.
- **Starter mirror parity.** The starter ships `text.astro` pre-
  installed under `src/components/ui/`. If the implementer extends the
  atom (variant added, classes tweaked), both files MUST be edited in
  lockstep so the starter mirror does not drift from the registry
  source. The implementer's task `T2` enforces this. Long-term, a
  `pnpm scaffold:test` run would catch drift because the scaffolded
  output is byte-compared to the registry's `target` paths.
