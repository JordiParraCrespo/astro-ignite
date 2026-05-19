# Proposal: docs-ship-registry-atoms-in-srccomponent

## Why

`packages/templates/docs/src/components/ui/` ships exactly one atom
today — `text.astro`, copied in via the `docs-use-the-text-component-for-all-typo`
change (PR #40). The starter template ships **every** atom from the
shadcn-style registry under its own `src/components/ui/`:

```
packages/templates/starter/src/components/ui/
├── accordion.astro, accordion-item.astro
├── alert.astro
├── avatar.astro
├── badge.astro
├── button.astro
├── card.astro, card-{content,description,footer,header,title}.astro
├── dialog.astro, dialog-{description,title}.astro
├── dropdown-menu.astro, dropdown-menu-item.astro
├── input.astro
├── kbd.astro
├── label.astro
├── link.astro
├── separator.astro
├── skeleton.astro
├── tabs.astro, tabs-{content,list,trigger}.astro
├── textarea.astro
├── text.astro
├── toaster.astro
└── tooltip.astro
```

A static audit confirms the starter `ui/` set is **byte-for-byte equal**
to `packages/registry/base/*` (29 files, modulo the two compound-family
target flattening that `registry.json` already encodes — `base/card/
card.astro` → `ui/card.astro` etc.). The single supporting lib file the
registry's `toast` item ships (`lib/toast.ts`) is also already mirrored
into `packages/templates/starter/src/lib/toast.ts`.

The consequence today is asymmetric ergonomics:

- A user who scaffolds the **starter** template can compose
  `<Button />`, `<Card />`, `<Dialog />`, `<Tabs />` etc. immediately
  out of the box. The atoms are part of the source tree they own.
- A user who scaffolds the **docs** template has only `text.astro`.
  Every other primitive must be installed post-scaffold via the
  shadcn-style CLI flow (`npx astro-ignite add button card …`) or
  reimplemented by hand. The docs template's own
  `ComponentShowcase.astro`, `Callout.astro`, `CodeBlock.astro`,
  `SidebarNav.astro`, and `SearchBox.astro` already hand-roll
  primitives that would otherwise compose from the missing atoms.

The scaffolded mirror at `apps/docs/src/components/ui/` already ships
**all 30 atoms + `lib/toast.ts`** (a survey at proposal time confirms
this — see `S6` for the audit command). That sites and templates have
drifted (apps/docs has the atoms; the source template that scaffolds
apps/docs does not) is the locked-practices regression this change
closes.

This change copies the registry's atom set (and `lib/toast.ts`) into the
docs template, achieving the same shadcn-style "atoms pre-installed in
the scaffolded tree" guarantee the starter already provides. The CLI
template cache at `packages/astro-ignite/templates/docs/` is refreshed
via the existing prepack copy script in the same wave, so a fresh `pnpm
pack` ships the migrated cache.

## Scope

In scope:

- **Atom files.** Create the 29 missing atom files under
  `packages/templates/docs/src/components/ui/` so the directory's
  contents match `packages/templates/starter/src/components/ui/`
  byte-for-byte (and therefore the registry source byte-for-byte, since
  the starter set is already a verified byte mirror — see § Survey).
  Concretely:
  - top-level singletons: `alert.astro`, `avatar.astro`, `badge.astro`,
    `button.astro`, `input.astro`, `kbd.astro`, `label.astro`,
    `link.astro`, `separator.astro`, `skeleton.astro`,
    `textarea.astro`, `toaster.astro`, `tooltip.astro` (13 files);
  - compound families flattened per the registry's `files[].target`
    convention: `accordion.astro` + `accordion-item.astro` (2);
    `card.astro` + `card-{content,description,footer,header,title}.astro`
    (6); `dialog.astro` + `dialog-{description,title}.astro` (3);
    `dropdown-menu.astro` + `dropdown-menu-item.astro` (2);
    `tabs.astro` + `tabs-{content,list,trigger}.astro` (4) — 17 files.
  - Total new atoms: 30 files. `text.astro` already exists and is left
    untouched.
- **Lib helper.** Create
  `packages/templates/docs/src/lib/toast.ts` (byte-equivalent to
  `packages/registry/lib/toast.ts` and to the starter mirror at
  `packages/templates/starter/src/lib/toast.ts`). This is the helper
  the `toaster` atom dispatches against; without it the toaster atom
  would import a missing file. `src/lib/cn.ts` already exists in the
  docs template (added with `text.astro` in PR #40) and is left
  untouched.
- **CLI template cache refresh.** Run
  `node packages/astro-ignite/scripts/copy-templates.mjs` so
  `packages/astro-ignite/templates/docs/` mirrors the updated source
  tree byte-for-byte (including all newly-added atoms, `lib/toast.ts`,
  and any unrelated drift the cache has accumulated since its last
  refresh — the script regenerates the directory wholesale; see §
  "CLI template cache" in design.md).
- **apps/docs verification (no edit required).** Confirm
  `apps/docs/src/components/ui/` and `apps/docs/src/lib/toast.ts`
  already match the new docs-template set; if a survey at T1 surfaces
  a divergence (which is not expected — the proposal-time scan shows
  byte parity already), align the apps mirror.

Out of scope:

- **Adding new atoms** to the registry or invention of new primitives.
  This change strictly mirrors what `packages/registry/base/` already
  ships into the docs template; no new registry entries are added.
- **`copy-button.astro`** — exists in the registry source (`packages/
registry/base/copy-button.astro`) but is **not** mirrored into the
  starter under `packages/templates/starter/src/components/ui/`.
  Mirroring the starter set means we _also_ skip `copy-button.astro` in
  the docs template. That divergence (registry has it; no template
  ships it pre-installed) predates this change and is governed by
  whichever issue eventually expands the starter's atom set — not by
  this one (see "Rejected alternative" in `design.md`).
- **Manifest changes.** `packages/registry/registry.json` is not
  modified. The existing `files[].target` paths already resolve to
  `src/components/ui/<name>.astro`, so a fresh `npx astro-ignite add
<name>` against the docs template was already overwriting the
  newly-shipped atom file with byte-identical contents. After this
  change the same `add` call is a no-op for files already shipped
  pre-installed (idempotent overwrite). The same is true for the
  starter today.
- **Refactoring docs-template consumers** to compose the newly-shipped
  atoms. Today's `ComponentShowcase`, `Callout`, `CodeBlock`,
  `SidebarNav`, `SearchBox` keep their hand-rolled primitives. Wiring
  them up to use `<Card>`/`<Button>`/`<Dialog>` is a separate refactor
  with its own surface scope (the `docs-use-the-text-component-for-all-typo`
  precedent illustrates how a typography-only sweep was split out from
  a broader component-consolidation; the same staging applies here).
- **`apps/site`, `apps/playground`, `packages/templates/starter/`** —
  out-of-scope mirrors. `apps/playground/` regenerates via CI; the
  starter atom set is already complete.
- **`copy-button.astro`** — see "Rejected alternative".

## Scenarios

### S1 — Every starter atom has a byte-equivalent docs mirror

- **GIVEN** the modified working tree
- **WHEN** the implementer runs, from the repo root,
  ```
  for f in packages/templates/starter/src/components/ui/*.astro; do
    name=$(basename "$f")
    diff -q "$f" "packages/templates/docs/src/components/ui/$name"
  done
  ```
- **THEN** every comparison reports "identical" (exit 0) and `diff -q`
  prints nothing. The same loop run against
  `packages/registry/base/<atom>.astro` (where the atom is a top-level
  singleton) or `packages/registry/base/<family>/<atom>.astro` (where
  the atom belongs to `card/`, `dialog/`, `tabs/`, `accordion/`, or
  `dropdown-menu/`) also reports identical for every name in the
  starter `ui/` set, confirming the docs `ui/` is a transitive byte
  mirror of the registry source through the starter as the reference.

### S2 — The `lib/toast.ts` helper is shipped alongside the toaster atom

- **GIVEN** the modified tree
- **WHEN** the implementer runs
  `diff -q packages/registry/lib/toast.ts packages/templates/docs/src/lib/toast.ts`
- **THEN** the comparison reports "identical" (exit 0). The same diff
  against `packages/templates/starter/src/lib/toast.ts` is also
  identical. The atom at
  `packages/templates/docs/src/components/ui/toaster.astro` resolves
  its `import` of the toast helper against the new docs template path
  successfully (no missing-module diagnostic in `pnpm --filter
@astro-ignite/template-docs typecheck`).

### S3 — Compound families flatten per `registry.json`

- **GIVEN** the modified tree
- **WHEN** the implementer reads
  `packages/registry/registry.json` and inspects every
  `registry:ui` item whose `files[]` array has more than one entry
  (`card`, `tabs`, `accordion`, `dialog`, `dropdown-menu`, and
  `toast`)
- **THEN** for every `files[i].target` of the form
  `src/components/ui/<filename>`, a file exists at
  `packages/templates/docs/src/components/ui/<filename>` whose
  contents are byte-equal to the source at `files[i].path` resolved
  against `packages/registry/`. The toast item's second file
  (`{path: "lib/toast.ts", target: "src/lib/toast.ts"}`) resolves to
  the new `packages/templates/docs/src/lib/toast.ts`.

### S4 — No new runtime deps

- **GIVEN** the modified tree
- **WHEN** the implementer diffs
  `packages/templates/docs/package.json` and
  `apps/docs/package.json` against `main`
- **THEN** the `dependencies` and `devDependencies` blocks are
  byte-equal pre/post change (no addition, no removal). The atoms are
  pure Astro + vanilla JS; the only import they make is
  `@/lib/cn` (template-local) and — for `toaster.astro` — its
  template-local `@/lib/toast`. Both are owned files in the docs
  template tree, not packages.

### S5 — `apps/docs/` already mirrors the new docs-template set

- **GIVEN** the modified tree
- **WHEN** the implementer runs
  ```
  for f in packages/templates/docs/src/components/ui/*.astro; do
    name=$(basename "$f")
    diff -q "$f" "apps/docs/src/components/ui/$name"
  done
  diff -q packages/templates/docs/src/lib/toast.ts apps/docs/src/lib/toast.ts
  ```
- **THEN** every comparison reports "identical" (exit 0). The proposal-
  time survey confirms `apps/docs/src/components/ui/` already ships
  30 atoms byte-equal to the registry, and `apps/docs/src/lib/toast.ts`
  is byte-equal to the registry helper; no edit to `apps/docs/` is
  required as part of this change. If a divergence surfaces during T1
  (it is not expected), the implementer aligns the apps mirror to the
  new docs-template set in the same wave.

### S6 — No typography / framework / token regressions in the new atoms

- **GIVEN** the modified tree
- **WHEN** the implementer runs
  `node scripts/audit/no-react-in-atoms.mjs` (and
  `--named-only --registry --family-layout`) and
  `node scripts/audit/tokens-only.mjs`
- **THEN** both exit 0. The atoms shipped are byte-mirrors of the
  registry source, which already passes these audits — so the audits'
  scope (which is restricted to `packages/registry/base/` and
  `packages/registry/blocks/` for the React/named-export check) is not
  expanded by this change. `tokens-only.mjs` continues to walk every
  component file (including the new docs-template `ui/` set) without
  finding a raw `bg-zinc-*` / hex literal — because the registry
  source it mirrors already conforms.

### S7 — `registry.json` is unchanged

- **GIVEN** the modified tree
- **WHEN** the implementer runs
  `git diff main -- packages/registry/registry.json`
- **THEN** the diff is empty. No registry entry is added, removed, or
  re-targeted by this change. The fact that the docs template now
  contains the same files the `target` paths point to is a property of
  the docs template's tree, not of the manifest.

### S8 — CLI template cache is refreshed

- **GIVEN** the modified tree, after the implementer runs
  `node packages/astro-ignite/scripts/copy-templates.mjs`
- **WHEN** the implementer runs, from the repo root,
  ```
  diff -rq packages/templates/docs/ packages/astro-ignite/templates/docs/ \
    --exclude=node_modules --exclude=dist --exclude=.astro
  ```
  with the additional substitution that `_gitignore` ↔ `.gitignore`
  is the documented rename the prepack script performs
- **THEN** the only differences reported are the documented
  `_gitignore` ↔ `.gitignore` rename and (if present) any `.env` /
  build-artefact directories the prepack `SKIP` set already filters.
  Every newly-added atom file under
  `packages/templates/docs/src/components/ui/` and the new
  `packages/templates/docs/src/lib/toast.ts` has a byte-equal sibling
  under `packages/astro-ignite/templates/docs/src/components/ui/`
  and `packages/astro-ignite/templates/docs/src/lib/toast.ts`. If the
  cache was previously missing other files unrelated to this change
  (the cache predates several merges — `src/lib/cn.ts` is missing at
  proposal time, for example), the regeneration picks them up
  wholesale, which is the script's documented behaviour.

### S9 — Scaffolded docs-template build remains green

- **GIVEN** the modified tree
- **WHEN** the implementer runs
  `pnpm --filter @astro-ignite/template-docs typecheck` and
  `pnpm --filter @astro-ignite/template-docs build`
- **THEN** both exit 0. No unused-import diagnostic surfaces (every
  atom file is `.astro` and self-contained — Astro does not warn on
  components that exist in `src/components/ui/` but have no current
  importer, the same way the starter today ships `<Tabs>` etc. with
  no template-internal consumer).

### S10 — Lighthouse budget against the docs template is not regressed

- **GIVEN** the modified tree
- **WHEN** the implementer runs
  `pnpm perf:budget --change docs-ship-registry-atoms-in-srccomponent`
- **THEN** the run exits 0 (or, under the environmental caveat
  established by `wire-local-lighthouse-against-a-preview` /
  `migrate-docs-template-to-tailwind-css`, the run reports
  "skipped — chrome not installed; run scripts/doctor/install-chrome.mjs"
  and exits 0). When Lighthouse does run, Performance / Accessibility
  / Best Practices / SEO are ≥ 95 on `/` and on one inner page; LCP /
  INP / CLS / TBT / total-transfer stay inside the templates-perf
  budget. The expected shape is no-change-from-baseline: shipping
  unused `.astro` source files does not affect the rendered output of
  any page (Astro tree-shakes components that no template page
  imports — see § Performance budget applicability for the receipts).

### S11 — Whole audit suite is green for this change

- **GIVEN** the modified tree
- **WHEN** the implementer runs
  `pnpm audit:invariants --change docs-ship-registry-atoms-in-srccomponent`
- **THEN** it exits 0 across the dispatched audits (modulo any
  pre-existing baseline failures already documented for prior
  changes; the templates-perf `themeColor: '#fafafa'` hex literal in
  `packages/templates/docs/src/config/site.ts` predates this change
  and remains out of scope).

### S12 — `pnpm scaffold:test` (docs path) passes

- **GIVEN** the modified tree
- **WHEN** the implementer runs `pnpm scaffold:test`
- **THEN** it exits 0. The CLI scaffolds the docs template into the
  playground; the playground builds; Lighthouse (when present in the
  sandbox) clears the budget. The new atom files materialise inside
  the playground at `apps/playground/src/components/ui/`,
  byte-equivalent to the template source, demonstrating the
  end-to-end path from registry → template → CLI cache → scaffold
  output.

### S13 — Boundary: only the docs template, apps/docs (if aligning), and the CLI cache are touched

- **GIVEN** the modified tree against `main`
- **WHEN** the implementer runs
  `git diff --name-only main -- ':!openspec' ':!.changeset'`
- **THEN** every changed file is under
  `packages/templates/docs/src/components/ui/`,
  `packages/templates/docs/src/lib/`,
  `packages/astro-ignite/templates/docs/` (cache refresh), and —
  only if T1 surfaces a real divergence — `apps/docs/src/components/ui/`
  or `apps/docs/src/lib/toast.ts`. No `apps/site/**`, no
  `apps/playground/**`, no `packages/templates/starter/**`, no
  `packages/registry/**` — including `registry.json` — is modified.
