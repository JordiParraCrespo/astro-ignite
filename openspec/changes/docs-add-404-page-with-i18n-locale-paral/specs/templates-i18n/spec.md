# Spec delta: templates-i18n — docs-add-404-page-with-i18n-locale-paral

This change adds a docs-template 404 surface with a localized
`[lang]/404.astro` parallel. The long-lived
`openspec/specs/templates-i18n/spec.md` already covers the parallel /
`getStaticPaths` / `getRelativeLocaleUrl` / `LocaleSwitcher` invariants
that apply here. This delta only adds one new scenario that pins down
the localized 404 surface as a deliberate addition for the docs
template — the long-lived spec's audit (`scripts/audit/i18n-parallels.mjs`)
exempts `404.astro` from the parallel-required rule, and we are not
changing that exemption.

## ADDED Requirements

### Requirement: Docs template ships a localized 404 surface

The docs template SHALL emit a 404 page at the root for the default
locale AND a localized 404 page at `[lang]/404.astro` for every
non-default locale.

#### Scenario: Bilingual docs site emits both 404 surfaces

- **GIVEN** the docs template is built with
  `siteConfig.locales = ['en', 'es']` and `defaultLocale = 'en'`
- **WHEN** the build completes
- **THEN** `dist/404.html` is rendered in English from
  `src/pages/404.astro`; `dist/es/404.html` is rendered in Spanish
  from `src/pages/[lang]/404.astro`; both pages set
  `Astro.response.status = 404` in their frontmatter; both pages emit
  their back-to-home link via `getRelativeLocaleUrl(locale, '/')`;
  the `LocaleSwitcher` lists both locales as targets when rendered
  on either page.

#### Scenario: Single-locale docs site emits one 404 surface only

- **GIVEN** the docs template is built with the default
  `siteConfig.locales = ['en']`
- **WHEN** the build completes
- **THEN** `dist/404.html` exists (built from `src/pages/404.astro`);
  the `getStaticPaths` exported from `src/pages/[lang]/404.astro`
  returns an empty array, so no `dist/<lang>/404.html` is emitted —
  the parallel infrastructure stays dormant exactly like every other
  `[lang]/` route in the template.

## MODIFIED Requirements

_None — the long-lived "Every page has a `[lang]` parallel" requirement
already permits the `404.astro` opt-in pattern this delta describes
(the static-analysis audit explicitly skips `404.astro`)._

## REMOVED Requirements

_None._
