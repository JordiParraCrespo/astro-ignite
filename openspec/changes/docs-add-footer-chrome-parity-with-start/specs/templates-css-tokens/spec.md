# Spec delta: templates-css-tokens — docs-add-footer-chrome-parity-with-start

This change adds a new component file
(`packages/templates/docs/src/components/common/Footer.astro` and its
`apps/docs` mirror). The existing `templates-css-tokens` requirements
apply unchanged:

- I1 ("No raw zinc / hex in component files") applies to the new
  `Footer.astro` — every color flows through `--color-*` tokens via
  Tailwind arbitrary-value utilities.
- I2 / I3 are untouched — `global.css` and the tri-state dark-mode
  wiring are not modified.
- I4 ("Above-the-fold uses scoped `<style>`") applies _negatively_:
  the footer is below-the-fold by definition, so it does NOT carry a
  scoped `<style>` block. The `tokens-only --layered` heuristic only
  flags `Hero.astro` / `Header.astro` overuse, so the footer's
  tokenized utility classes are accepted.

This delta exists so the per-change audit dispatcher and the
reviewer's invariants tier know to include `Footer.astro` (and its
`apps/docs` mirror) in the `tokens-only` and `tokens-only --layered`
runs.

## ADDED Requirements

_None._

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._
