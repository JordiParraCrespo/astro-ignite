# Spec delta: templates-i18n — docs-add-footer-chrome-parity-with-start

This change adds a docs-template footer chrome that renders on every
page via `BaseLayout.astro`. The long-lived
`openspec/specs/templates-i18n/spec.md` already covers the
"internal links use `getRelativeLocaleUrl`" (I5) and "`LocaleSwitcher`
in chrome" (I6) invariants that apply here. This delta adds one new
scenario that pins the docs footer as a chrome surface bound by those
invariants — the long-lived spec didn't enumerate "footer" explicitly
(it says "site chrome (header / footer)"), and we make that footer
explicit for the docs template now that one exists.

## ADDED Requirements

### Requirement: Docs template ships a localized footer chrome

The docs template SHALL render a `<Footer />` component on every page
that uses `BaseLayout`. The footer SHALL build every internal link
through `getRelativeLocaleUrl(locale, path)` and SHALL read every
visible string through `useTranslations(locale)` so the chrome is
fully localized whenever a non-default locale is configured.

#### Scenario: Bilingual docs site renders localized legal links in the footer

- **GIVEN** the docs template is built with
  `siteConfig.locales = ['en', 'es']` and `defaultLocale = 'en'`
- **WHEN** the user navigates to `/es/introduction` (or any
  `[lang]/` page that uses `BaseLayout`)
- **THEN** the footer renders Spanish labels for the legal column
  (`"Privacidad"`, `"Términos"`, `"Cookies"`) read from
  `useTranslations('es')`; every `<a href>` in the legal column
  resolves to `/es/legal/<slug>` because the link is built with
  `getRelativeLocaleUrl('es', '/legal/<slug>')`; the
  `internal-links-localized` audit reports zero violations on the
  new `Footer.astro` file.

#### Scenario: Single-locale docs site renders the footer at root

- **GIVEN** the docs template is built with the default
  `siteConfig.locales = ['en']`
- **WHEN** the user navigates to `/`
- **THEN** the footer renders English labels; every legal-column
  link resolves to `/legal/<slug>` (no `[lang]` prefix, because
  `getRelativeLocaleUrl('en', '/legal/<slug>')` returns the root
  path under the default-locale config); the footer ships the same
  static HTML in both English and Spanish builds (modulo the
  translated strings).

#### Scenario: i18n bundles stay key-parallel after the change

- **GIVEN** `packages/templates/docs/src/i18n/en.json` and
  `es.json` (plus the `apps/docs` mirrors)
- **WHEN** the change is applied
- **THEN** both locale bundles expose the same `footer.*` shape
  (existing `rights`, `builtWith`, `rss`, `legal`, `social` keys plus
  the new `privacy`, `terms`, `cookies` keys); running a structural
  diff of the two JSON files shows no missing keys in either
  direction.

## MODIFIED Requirements

_None — the long-lived "Internal links go through
`getRelativeLocaleUrl`" and "`LocaleSwitcher` lives in chrome"
requirements already cover the footer as part of "site chrome (header
/ footer)"; this delta just makes the docs footer explicit._

## REMOVED Requirements

_None._
