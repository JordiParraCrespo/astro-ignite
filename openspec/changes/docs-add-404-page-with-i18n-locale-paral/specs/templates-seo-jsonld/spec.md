# Spec delta: templates-seo-jsonld — docs-add-404-page-with-i18n-locale-paral

The new 404 pages render inside `BaseLayout` and therefore inherit the
single `@graph` JSON-LD block the layout emits. None of the new files
(`pages/404.astro`, `pages/[lang]/404.astro`,
`components/not-found/NotFoundHero.astro`) emits its own JSON-LD. The
existing `templates-seo-jsonld` requirements (single `@graph`, no
standalone JSON-LD, all nodes typed via `schema-dts`) apply unchanged.
This delta exists so the per-change audit dispatcher runs
`jsonld-graph.mjs` (plain + `--strict` + `--typed`) against the new
pages and component.

## ADDED Requirements

_None._

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._
