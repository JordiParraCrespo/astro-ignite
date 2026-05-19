# Delta: templates-css-tokens — migrate-docs-template-to-tailwind-css

This change migrates the docs template
(`packages/templates/docs/src/`) and its scaffolded mirror
(`apps/docs/src/`) from a "layered" CSS strategy — scoped `<style>`
blocks above the fold, Tailwind below — to a **Tailwind-primary**
strategy: Tailwind v4 utilities (including arbitrary-value classes
resolving through the CSS variable token layer) are the primary
styling mechanism, and scoped `<style>` blocks survive only where
Tailwind cannot express the rule (MDX prose, keyframes, container
queries, `::-webkit-*` pseudo-elements). The capability's other
behaviours (tokens-only, zinc isolation to `global.css`, tri-state
dark mode) are preserved.

The starter template is not touched by this change; its
above-the-fold scoped `<style>` blocks (`common/Hero.astro`,
`common/Header.astro`) continue to satisfy the existing layered-CSS
heuristic. The MODIFIED requirement below records both patterns
(layered for marketing-style templates, Tailwind-primary for
non-hero templates like docs / dashboards) as permitted, and names
the docs template explicitly as the first Tailwind-primary template.

The `tokens-only.mjs --layered` audit at
`scripts/audit/tokens-only.mjs:81-94` walks the template tree
looking for files named `Hero.astro`, `Header.astro`, or
`Nav.astro` and verifies that each contains a `<style>` block. The
docs template has none of those filenames and therefore vacuously
passes today and continues to vacuously pass after this change. No
script edit is required.

## MODIFIED Requirements

### Requirement: Layered CSS strategy

A template SHALL choose one of two equivalent strategies for
expressing component / layout / page styles, applied consistently
across the template:

1. **Layered.** Above-the-fold components use scoped `<style>`
   blocks (typically `Hero.astro`, `Header.astro`, `Nav.astro` —
   the names the `tokens-only.mjs --layered` audit recognizes).
   Below-the-fold components and pages use Tailwind v4 utilities.
2. **Tailwind-primary.** Every component, layout, and page expresses
   styling through Tailwind v4 utilities — including arbitrary-value
   utilities that resolve through the CSS variable token layer
   (`bg-[var(--color-bg)]`, `text-[var(--color-fg-muted)]`,
   `border-[var(--color-border)]`). Scoped `<style>` blocks survive
   only where Tailwind cannot express the rule: MDX-emitted prose
   that is not in Tailwind's class-scan path (typically via
   `<style is:global>` + `.docs-prose` selectors + `@apply`),
   keyframes, container queries, `::-webkit-*` pseudo-elements, and
   reduced-motion media queries. Each surviving block is preceded
   by a one-line `/* Why kept: … */` comment that explains the
   constraint.

In both strategies:

- Beasties extracts critical CSS at build time (`templates-perf` I4).
- Components reference design tokens only — no raw `bg-zinc-*` /
  `text-zinc-*` / `border-zinc-*` / `ring-zinc-*` utility, no 6- or
  8-digit hex literal (I1 stands).
- The token layer lives in
  `packages/templates/<kind>/src/styles/global.css` (I2 stands).
- Tri-state dark mode flips tokens via the `.light` class on
  `<html>`; no component reads `prefers-color-scheme` directly and
  no component carries a Tailwind `dark:` variant — the variable
  layer handles theme switching (I3 stands).

The starter template adopts the layered strategy. The docs template
adopts the Tailwind-primary strategy after this change. Future
templates pick one of the two; both strategies are first-class.

The `scripts/audit/tokens-only.mjs --layered` heuristic continues
to look for `<style>` blocks inside `Hero.astro`, `Header.astro`,
and `Nav.astro` files anywhere under each template's `src/`. The
heuristic vacuously passes for templates that contain none of those
filenames (docs, dashboards, blog-only); for templates that contain
them (starter), the heuristic continues to flag a missing
`<style>` block as a violation. Adding a new flag or expanding the
filename set is a follow-up only if a new template fails the
heuristic by accident; the docs template does not.

#### Scenario: A new hero component is added to the starter

- **GIVEN** a hero on the starter landing page (above the fold)
- **WHEN** the author writes its styles
- **THEN** they go in a scoped `<style>` block inside
  `packages/templates/starter/src/components/common/Hero.astro`,
  not in a Tailwind class soup.

#### Scenario: The docs template's sidebar is updated

- **GIVEN** a new active-state highlight on
  `packages/templates/docs/src/components/docs/SidebarNav.astro`
- **WHEN** the author writes its styles
- **THEN** they go in Tailwind utility classes on the rendered
  `<a>` elements (`text-[var(--color-fg)] font-medium
bg-[var(--color-surface-2)]`), not in a scoped `<style>` block.

#### Scenario: A new template chooses the Tailwind-primary strategy

- **GIVEN** a new dashboard template is added under
  `packages/templates/dashboard/`
- **WHEN** the author writes every component, layout, and page
- **THEN** styling is expressed through Tailwind utilities;
  residual scoped `<style>` blocks are kept only where Tailwind
  cannot express the rule and are each preceded by a one-line
  comment explaining why.

#### Scenario: MDX prose styling in a Tailwind-primary template

- **GIVEN** the docs template's `DocsLayout.astro` and
  `LegalLayout.astro` style MDX-emitted elements (`h2`, `h3`, `p`,
  `code`, `pre`, `blockquote`, `table`, …)
- **WHEN** the author migrates from a scoped `<style is:global>`
  block to Tailwind utilities
- **THEN** the rules are either rewritten via Tailwind `@apply`
  inside a kept `<style is:global>` block (because MDX output is
  not in Tailwind's class-scan path), or kept as raw CSS with a
  one-line `/* Why kept: MDX-emitted elements are not in
Tailwind's scan path */` comment.

## REMOVED Requirements

_None._ I1 (no raw zinc / hex in components), I2 (zinc lives only
in `global.css`), I3 (tri-state dark mode flips tokens), and the
underlying audit table all stand. I4's audit script
(`tokens-only.mjs --layered`) is unchanged.

## Notes

- **Why the audit script does not need an edit.** The
  `aboveTheFold` array at `scripts/audit/tokens-only.mjs:83`
  contains `['Hero.astro', 'Header.astro', 'Nav.astro']`. The
  docs template contains none of these filenames (its
  above-the-fold is a sidebar + toolbar, not a hero). The audit's
  `walkFiles` lookup returns no file for each name, the inner
  `if (!file) continue;` skips cleanly, and zero violations are
  reported. The starter template still contains
  `common/Hero.astro` and `common/Header.astro` (post the
  `restructure-starter-template-component-o` change), each of which
  carries a `<style>` block, so the heuristic continues to verify
  the starter's layered pattern.
- **Why the Tailwind-primary pattern preserves tri-state dark
  mode.** Tailwind arbitrary-value utilities like
  `bg-[var(--color-bg)]` compile to a single CSS declaration that
  reads the `--color-bg` variable at render time. The `.light`
  class on `<html>` flips the variable's value in `global.css`;
  every consumer (Tailwind utility or scoped `<style>`) re-resolves
  the variable on the next paint. No per-component `dark:` variant
  is required, and `templates-css-tokens` I3 is satisfied without
  any audit change.
- **Why this delta is in `templates-css-tokens` and not a new
  capability.** The capability's purpose statement names the
  contract as "components reference CSS variables, not raw
  zinc/Tailwind classes for colors." That contract is unchanged.
  The "layered vs. Tailwind-primary" choice is a spelling
  convention within the contract, not a new contract. Putting the
  delta here keeps future readers from hunting across two
  capabilities for the same rule.
- **Relationship to `templates-perf`.** Beasties continues to
  inline above-the-fold CSS regardless of whether the source is a
  scoped `<style>` block or a compiled Tailwind utility set. The
  Lighthouse budget audits (`templates-perf` I1–I4) are the load-
  bearing perf gate; this delta does not loosen them.
- **Relationship to `templates-i18n`.** The migration touches
  styling, not links. Every `getRelativeLocaleUrl(locale, path)`
  call site in the docs chrome (`SidebarNav`, `Breadcrumbs`,
  `PrevNext`, `OnThisPage`, `common/LocaleSwitcher`,
  `common/Brand`) is preserved byte-for-byte. The
  `internal-links-localized.mjs` audit continues to pass.
