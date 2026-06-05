# Delta: templates-css-tokens — restructure-starter-template-component-o

This change renames `Nav.astro` → `Header.astro` and relocates the
loose chrome / sections into `common/` and per-feature folders. The
capability's behaviour (tokens-only, zinc isolation to `global.css`,
tri-state dark mode, layered CSS) is preserved.

Scoped `<style>` blocks travel with their files — the relocation
moves them byte-for-byte. The `tokens-only.mjs --layered` audit's
`aboveTheFold` lookup is filename-based (`['Hero.astro',
'Header.astro', 'Nav.astro']`), so it finds the renamed
`common/Header.astro` and the relocated `common/Hero.astro` and
continues to pass.

## ADDED Requirements

### Requirement: No loose `*.astro` files at the root of `src/components/`

In `packages/templates/<kind>/src/components/`, no `.astro` file
SHALL live directly at the root of the `components/` directory.
Every file SHALL live in a subdirectory: `ui/`, `common/`, a feature
folder (`blog/`, `projects/`, `about/`, `contact/`, `legal/`,
`not-found/`), or an existing infrastructure folder (`image/`,
`seo/`).

This is the structural rule that gives the layered-CSS audit a
deterministic place to find above-the-fold components: scoped
`<style>` blocks live in `common/Header.astro` and `common/Hero.astro`,
not in a loose-root file the audit has to discover by walking the
whole tree.

#### Scenario: A contributor adds a new chrome component

- **GIVEN** a contributor wants to add a "navbar variant" component
- **WHEN** they place it at `src/components/NavbarVariant.astro`
- **THEN** the audit fails and instructs them to place it under
  `src/components/common/` instead.

#### Scenario: Auditing the starter

- **GIVEN** the post-change starter
- **WHEN** `src/components/` is listed
- **THEN** zero `.astro` files appear at the root.

## MODIFIED Requirements

### Requirement: Layered CSS strategy

Above-the-fold components SHALL use scoped `<style>` blocks.
Below-the-fold SHALL use Tailwind v4 utilities. Beasties extracts
critical CSS at build time.

The canonical above-the-fold component set (the templates' header
and hero) lives at `src/components/common/Header.astro` and
`src/components/common/Hero.astro` post-rename. The
`tokens-only.mjs --layered` audit walks each template by filename
(not by path), so the relocation is invisible to it.

#### Scenario: A new hero component is added

- **GIVEN** a hero on the landing page (above the fold)
- **WHEN** the author writes its styles
- **THEN** they go in a `<style>` block inside
  `src/components/common/Hero.astro`, not in a Tailwind class soup.

#### Scenario: The renamed header keeps its scoped styles

- **GIVEN** `Nav.astro` becomes `common/Header.astro`
- **WHEN** the audit inspects above-the-fold components
- **THEN** it finds `common/Header.astro` and confirms the scoped
  `<style>` block moved with the file.

## REMOVED Requirements

_None._ I1, I2, I3 stand. I4 is restated with the new component
names; the original behavioural rule (above-the-fold uses scoped
styles) is unchanged.

## Notes

- **Audit script obsolete `Nav.astro` entry.** The audit's
  `aboveTheFold` list at `scripts/audit/tokens-only.mjs:83` still
  contains `'Nav.astro'`. After this change that lookup returns no
  file and the early-`continue` skips it cleanly. Removing the
  obsolete entry is a tiny follow-up; not part of this change.
- **Relationship to change #28's ADDED requirement (`page files
carry no scoped <style>`)**. That requirement still holds. Pages
  remain composition-only; scoped styles live in component files
  exclusively. The relocations move the scoped blocks from
  `sections/<page>/<Section>.astro` to `<feature>/<Section>.astro`,
  staying inside component files at every step.
- **Why `common/` for `Hero.astro` and `FeaturesGrid.astro`.** Both
  components have generic prop APIs (`Hero(title, description, cta)`,
  `FeaturesGrid(heading, features)`) — they hardcode no schema or
  i18n key. They satisfy the issue's rule: rename them with a generic
  name and the prop API still makes sense.
