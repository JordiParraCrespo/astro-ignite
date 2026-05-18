# Delta: templates-seo-jsonld — restructure-starter-template-component-o

This change renames and relocates chrome / section components in the
starter and its mirrors. JSON-LD assembly stays at the base-layout
boundary; per-page schemas continue to be built in the page
frontmatter and passed through.

`SEO.astro` and `JsonLd.astro` (the assembler used by the base
layout) live under `src/components/seo/` and **are not relocated** by
this change. The `seo/` infrastructure subdirectory is one of two
exempt subtrees (`image/`, `seo/`) explicitly left in place to avoid
expanding the diff beyond the issue's intent — see design.md
"Rejected alternative — also restructure `image/` and `seo/`".

## ADDED Requirements

### Requirement: Relocated chrome and section components do not emit standalone JSON-LD

No relocated component — neither chrome under `common/` nor any
feature composition under `<feature>/` — SHALL emit its own
`<script type="application/ld+json">` block. JSON-LD remains the
exclusive responsibility of the base layout's single `@graph` script.

This is the same invariant change #28 added at the section-component
boundary, restated for the new file locations: a component moving
from `sections/about/AboutBody.astro` to `about/AboutBody.astro` does
not get to start emitting JSON-LD just because its path changed.

#### Scenario: A relocated section component renders

- **GIVEN** `src/components/about/AboutBody.astro` after the rename
- **WHEN** its source is searched for `application/ld+json`
- **THEN** zero matches. JSON-LD assembly stays at the page frontmatter
  level.

#### Scenario: A relocated chrome component renders

- **GIVEN** `src/components/common/Header.astro` after the rename
- **WHEN** its source is searched for `application/ld+json`
- **THEN** zero matches.

## MODIFIED Requirements

_None._ I1 (one `@graph` per page), I2 (no standalone JSON-LD), and
I3 (typed via `schema-dts`) are unchanged at the layout / page
boundary. The ADDED requirement above extends I2 to the relocated
component set explicitly.

## REMOVED Requirements

_None._

## Notes

- **Audit hook.** `scripts/audit/jsonld-graph.mjs --strict` already
  walks every page and component file and reports any standalone
  JSON-LD outside the base layout. The audit is path-agnostic, so it
  continues to enforce the rule against relocated components without
  modification.
- **`SEO.astro` and `JsonLd.astro` paths.** The base layout's
  imports (`@/components/seo/SEO.astro`,
  `@/components/seo/JsonLd.astro`) are unchanged by this change.
  These files stay under `src/components/seo/` (an exempt subtree)
  for the reasons documented in design.md.
- **Relationship to change #28's spec delta.** Change #28's delta
  added "No section component emits its own JSON-LD". This change's
  delta restates that invariant in terms of the new directory layout
  (`<feature>/` instead of `sections/<feature>/`), so it remains
  enforceable against the post-rename tree.
