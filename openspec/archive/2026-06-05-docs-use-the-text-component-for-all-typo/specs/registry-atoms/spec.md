# Delta: registry-atoms — docs-use-the-text-component-for-all-typo

This change adopts the existing `text` atom across the docs template
(and its scaffolded mirror in `apps/docs/`). The atom contract
(`packages/registry/base/text.astro`) is the same before and after,
and the registry manifest entry (`registry.json` → `text` with
`registryDependencies: ["cn"]`, `files[0].target =
src/components/ui/text.astro`) does not change.

This change does add the atom file to the docs template — previously
the docs template did not ship a copy of `text.astro` because no
docs-template surface consumed it. With this change the docs template
gains
`packages/templates/docs/src/components/ui/text.astro` (a byte-for-byte
mirror of `packages/registry/base/text.astro`, modulo the `cn` import
path mechanic), and the apps mirror at
`apps/docs/src/components/ui/text.astro` is created alongside.

If the implementer extends the atom's variant set in lockstep across
`packages/registry/base/text.astro`,
`packages/templates/starter/src/components/ui/text.astro`,
`packages/templates/docs/src/components/ui/text.astro`, and
`apps/docs/src/components/ui/text.astro`, that extension is a
non-breaking growth of the variant union — it does not alter the atom
contract, the family layout, or the dependency graph.

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
    framework imports are added. The new docs-template and apps-docs
    mirrors are copies of the existing `text.astro`.
  - **I2** (no default exports in atom source `.ts` files) — preserved.
    `text.astro` (and every mirror) keeps its named `Props` export;
    the `.astro` default export is the component itself (allowed by
    the audit).
  - **I3** (`cn` in `registryDependencies`) — preserved. The
    `registry.json` entry for `text` already lists `["cn"]`. No
    manifest change is required.
  - **I4** (compound families live in `base/<family>/`) — preserved.
    `text` is single-file; no family is introduced.
- **Audit:** `node scripts/audit/no-react-in-atoms.mjs --named-only
--registry --family-layout` must continue to pass.
- **Mirror parity.** With this change there are now three places
  where `text.astro` is shipped pre-installed in a template tree:
  - `packages/templates/starter/src/components/ui/text.astro` (the
    starter mirror — added in PR #33).
  - `packages/templates/docs/src/components/ui/text.astro` (the docs
    mirror — added by this change).
  - `apps/docs/src/components/ui/text.astro` (the apps mirror — added
    by this change because the apps copy ships its own UI atom set
    under `apps/docs/src/components/ui/`).
    The single registry source remains `packages/registry/base/text.astro`.
    Any future edit to the atom — variant added, classes tweaked,
    prop signature changed — must update all four files in lockstep
    (`tasks.md` T2c enforces this) so the registry source, the starter
    mirror, the docs template mirror, and the apps mirror do not drift.
    Long-term, a `pnpm scaffold:test` run catches drift because the
    scaffolded output is byte-compared against the registry's
    `files[].target` paths; the docs scaffold target is now covered by
    the same byte-compare for free.
