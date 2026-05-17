# Delta: templates-css-tokens — reorganize-starter-split-pages-into-per

This change moves scoped `<style>` blocks out of page files
(`src/pages/**`) and into the section components they styled
(`src/components/sections/**`). The existing capability invariants
(tokens-only, zinc isolation to `global.css`, tri-state dark mode,
layered CSS) are preserved.

The change layers one structural assertion on top of I4: scoped
`<style>` blocks in the starter SHALL live in component files, not in
page files.

## ADDED Requirements

### Requirement: Page files (`src/pages/**`) carry no scoped `<style>` blocks

A `.astro` file under `packages/templates/starter/src/pages/` SHALL NOT
contain a `<style>` block. Component-level styling lives on the
component (atom, block, or section); page files are composition-only.

This requirement applies to the starter template's pages
(`src/pages/**.astro`). It does not constrain other templates, registry
sources, or the layout files under `src/layouts/`. Layouts may still
own chrome-level styles that span all pages.

#### Scenario: A contributor adds an inline style to a page

- **GIVEN** a contributor edits `src/pages/about.astro` and appends a
  scoped `<style>` block for some quick tweak
- **WHEN** the audit runs
- **THEN** the audit fails and instructs the contributor to put the
  style on the section component that owns the markup being styled
  (e.g. `src/components/sections/about/AboutBody.astro`).

#### Scenario: A page has zero style blocks after the refactor

- **GIVEN** the post-change tree
- **WHEN** every `.astro` file under
  `packages/templates/starter/src/pages/` is scanned for `<style>` tags
- **THEN** the count is zero. Each section component file under
  `src/components/sections/` may still carry its own scoped block.

## MODIFIED Requirements

_None._ I1 (no raw zinc/hex in components), I2 (zinc lives only in
`global.css`), I3 (tri-state dark mode), and I4 (layered CSS strategy)
are not redefined.

## REMOVED Requirements

_None._

## Notes

- **Relationship to I4.** I4 already says above-the-fold components
  use scoped `<style>` blocks. The ADDED requirement is _complementary_:
  it pins down _where_ those scoped blocks live (component file, not
  page file). Together they form the rule "scoped styles belong to the
  component, not the page that happens to compose it."
- **`global.css` exemption is unaffected.** Zinc references in
  `packages/templates/starter/src/styles/global.css` remain exempt
  (I2). No raw color is introduced in any new file.
- **Audit hook.** The check is one `grep` line — search for
  `<style` inside `packages/templates/starter/src/pages/**.astro`.
  The implementer may add this to
  `scripts/audit/tokens-only.mjs --layered` or as a focused script;
  the change does not require a new audit binary. Audit S7/T19 in the
  proposal/tasks already covers the no-zinc-in-new-files check via
  `tokens-only.mjs`.
