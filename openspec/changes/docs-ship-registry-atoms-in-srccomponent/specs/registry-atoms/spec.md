# Delta: registry-atoms — docs-ship-registry-atoms-in-srccomponent

This change ships the existing registry atom set (and the supporting
`lib/toast.ts` helper) pre-installed in the docs template under
`packages/templates/docs/src/components/ui/` and
`packages/templates/docs/src/lib/toast.ts`. The atom contracts
(`packages/registry/base/<name>.astro` and
`packages/registry/base/<family>/<part>.astro`) are unchanged, and the
registry manifest (`packages/registry/registry.json`) is unchanged.

The starter template at
`packages/templates/starter/src/components/ui/` is already the
reference for "atoms shipped pre-installed in a template tree" — a
byte mirror of the registry source set under
`packages/registry/base/` (modulo the `files[].target` flattening for
compound families). This change brings the docs template to parity
with that pattern. Today the docs template ships only `text.astro`
(added by `docs-use-the-text-component-for-all-typo` in PR #40); after
this change it ships 30 atoms plus `lib/toast.ts`, matching the
starter set byte-for-byte (the starter omits `copy-button.astro`; the
docs template follows the starter and also omits it — see proposal §
"Out of scope" and design § "Rejected alternatives").

If a future change extends the registry's atom set (for example by
introducing a new atom or growing a compound family), the lockstep
discipline already documented for `text.astro` extends to the new set:
the registry source, the starter mirror, the docs template mirror,
and the apps/docs mirror are kept byte-equivalent. That lockstep is
not encoded as a new audit rule here — the long-lived spec's I1–I4
already cover the registry source, and a byte-mirror property between
the registry source and a template tree is a one-time-per-atom check
the implementer performs at copy time (T1 / T11 in this change's
`tasks.md`).

## ADDED Requirements

_None._

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._

## Notes

- **Why no spec delta?** The capability spec defines what an atom must
  _be_ (no client framework, native HTML first, named exports, one
  concept per file, transitive `cn` dependency, compound families
  under `base/<family>/`). This change does not add a new atom, remove
  an existing atom, change an atom's signature, or restructure a
  family's layout. It only mirrors existing atoms (already conforming
  to I1–I4) into a template tree the audit does not walk anyway. The
  long-lived invariants therefore neither grow nor shrink.
- **Invariant status:**
  - **I1** (no React / Vue / Svelte / Radix imports) — preserved. No
    framework import is added to `packages/registry/base/`; the
    docs-template mirrors are byte copies of audited registry source.
  - **I2** (no default exports in atom source) — preserved. Every
    mirrored `.astro` file keeps the named `Props` export from the
    registry source.
  - **I3** (`cn` in `registryDependencies`) — preserved.
    `registry.json` is not modified; every existing
    `registryDependencies` array remains.
  - **I4** (compound families live in `base/<family>/`) — preserved.
    The registry source layout is untouched; the template-side
    flattening (`base/card/card.astro` → `ui/card.astro`) follows
    `files[].target` exactly as it does for the starter today.
- **Audit:** `node scripts/audit/no-react-in-atoms.mjs --named-only
--registry --family-layout` must continue to pass. No new audit
  is introduced; no audit's behaviour changes.
- **Mirror parity.** After this change there are now three places
  where the full atom set is shipped pre-installed in a template
  tree:
  - `packages/templates/starter/src/components/ui/` (starter mirror,
    long-standing).
  - `packages/templates/docs/src/components/ui/` (docs mirror, new
    in this change).
  - `apps/docs/src/components/ui/` (apps mirror, already in place
    independently — re-verified by T9).
    The single registry source remains `packages/registry/base/`. Any
    future edit to an atom — variant added, classes tweaked, prop
    signature changed — must update all four trees in lockstep so the
    registry source, the starter mirror, the docs template mirror, and
    the apps mirror do not drift. `pnpm scaffold:test` catches drift
    because the scaffolded output is byte-compared against the
    registry's `files[].target` paths; the docs scaffold target is now
    covered by the same byte-compare for free.
- **`copy-button.astro` exception.** The registry source ships
  `packages/registry/base/copy-button.astro`, but the starter mirror
  does not include it (and never has). This change mirrors the
  starter, so the docs template also omits it. That is **intentional**
  scope discipline: "atoms shipped pre-installed in a template" is a
  curated subset of "atoms the registry can install via the
  shadcn-style CLI". Whether to expand the curated subset is a
  separate, future issue.
