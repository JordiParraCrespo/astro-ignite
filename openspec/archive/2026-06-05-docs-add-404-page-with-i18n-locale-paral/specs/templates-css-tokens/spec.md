# Spec delta: templates-css-tokens — docs-add-404-page-with-i18n-locale-paral

This change adds three new component files
(`NotFoundHero.astro` + two page wrappers) under the docs template.
They are bound by the existing `templates-css-tokens` requirements
("Components reference tokens, never raw zinc", "Layered CSS strategy")
without modification. This delta does not add, modify, or remove any
requirement — it exists so the per-change audit dispatcher knows the
capability is touched and runs `tokens-only.mjs` (plain + `--layered`)
against the new files.

## ADDED Requirements

_None._

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._
