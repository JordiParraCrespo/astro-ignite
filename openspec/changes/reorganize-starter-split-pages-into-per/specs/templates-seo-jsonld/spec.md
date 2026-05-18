# Delta: templates-seo-jsonld — reorganize-starter-split-pages-into-per

This change extracts page section markup into component files. JSON-LD
schema assembly stays in page frontmatter and is passed to
`BaseLayout`'s `schemas` prop, as today. The capability's existing
invariants (single `@graph` script per page, no standalone JSON-LD
outside the layout, `schema-dts`-typed nodes, `@id` cross-references)
are preserved.

The change layers one structural assertion on top of I2: section
components SHALL NOT emit their own `<script type="application/ld+json">`
tags or compose `schemas` props onto a nested layout. Schema assembly is
a page-level responsibility.

## ADDED Requirements

### Requirement: Section components do not emit JSON-LD

A `.astro` file under
`packages/templates/starter/src/components/sections/` SHALL NOT contain
a `<script type="application/ld+json">` element and SHALL NOT itself
render a `<BaseLayout>` (or any wrapper that injects JSON-LD). Schema
arrays are assembled in the page frontmatter (`src/pages/**.astro`) and
passed to the page's single `<BaseLayout>` via its `schemas` prop.

#### Scenario: A section component tries to embed a Product node

- **GIVEN** a contributor adds a `Product` JSON-LD node to a section
  component for a pricing card
- **WHEN** the audit runs
- **THEN** the audit fails and instructs the contributor to move the
  `Product` node into the page frontmatter's `schemas` array, where it
  can join the page's other nodes inside the single `@graph` script
  emitted by `BaseLayout`.

#### Scenario: Refactored landing page

- **GIVEN** `src/pages/index.astro` after the refactor
- **WHEN** the rendered page is inspected
- **THEN** exactly one `<script type="application/ld+json">` element is
  present (emitted by `BaseLayout`), containing the page-assembled
  `@graph`. No section component contributed a competing script.

## MODIFIED Requirements

_None._ I1 (one `@graph` script), I2 (no standalone JSON-LD), and I3
(typed via `schema-dts`) are not redefined.

## REMOVED Requirements

_None._

## Notes

- **Relationship to I1/I2.** I1 mandates exactly one `@graph` script
  per page; I2 mandates that no page emits a standalone script outside
  the layout. The ADDED requirement _extends_ I2 from "pages" to
  "section components" — a section component is not a page, but it is a
  rendering surface that the existing audit doesn't explicitly scope.
  Pinning the rule down here prevents drift as the section directory
  fills in.
- **Audit hook.** Covered by `scripts/audit/jsonld-graph.mjs --strict`
  if its file glob includes `src/components/sections/**`. If the
  current glob is page-only, the implementer extends it (one-line
  change) or adds a focused grep step under
  `scripts/audit/jsonld-graph.mjs`. Tasks T20 covers the grep
  invariant for the duration of this change.
- **Layouts unchanged.** `BaseLayout.astro`, `ArticleLayout.astro`,
  `LegalLayout.astro` continue to be the sole renderers of JSON-LD
  scripts in the starter; the refactor does not move that
  responsibility.
