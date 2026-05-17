# Capability: templates-i18n

## Purpose

Every template under `packages/templates/<kind>/` ships with parallel
localized routes from day one. The default locale lives at `/`; every
other locale lives at `/[lang]/`. The infrastructure stays dormant when
`siteConfig.locales = ['en']` but the wiring is already there, so adding
a second locale is configuration, not refactor.

## Boundary

Owned by: `packages/templates/<kind>/src/pages/`, `src/i18n/`,
`src/content/`, `src/components/LocaleSwitcher.astro` (and anywhere in
chrome that renders nav).

Touched by: `packages/create-astro-ignite/src/scaffold.ts` when it
templates locales into a fresh project.

## Requirements

### Requirement: Default locale at root, non-default under `/[lang]/`

The site SHALL serve the default locale at `/` and non-default locales
at `/[lang]/`.

#### Scenario: English-only site (the default)

- **GIVEN** `siteConfig.locales = ['en']` and `defaultLocale = 'en'`
- **WHEN** the site is built
- **THEN** every route appears only at `/`; no `/[lang]/` routes are
  emitted.

#### Scenario: Bilingual site

- **GIVEN** `siteConfig.locales = ['en', 'es']` and `defaultLocale = 'en'`
- **WHEN** the site is built
- **THEN** `/about` and `/es/about` both exist; `/en/about` does not.

### Requirement: Every page has a `[lang]` parallel

Every page that exists at `/foo` SHALL have a sibling at
`src/pages/[lang]/foo.astro` whose `getStaticPaths` emits exactly one
entry per `siteConfig.locales` minus the default locale.

#### Scenario: Adding a top-level page

- **GIVEN** the contributor adds `src/pages/pricing.astro`
- **WHEN** `pnpm audit:invariants` runs
- **THEN** the audit fails because `src/pages/[lang]/pricing.astro` is
  missing.

### Requirement: Content collections use `{locale}/{slug}.mdx`

Content collections (`blog`, `docs`, anywhere else MDX lives) SHALL be
organized as `<collection>/<locale>/<slug>.mdx`.

#### Scenario: Adding a blog post

- **GIVEN** a new English blog post
- **WHEN** the author creates the file
- **THEN** it lives at `src/content/blog/en/<slug>.mdx`, not
  `src/content/blog/<slug>.mdx`.

### Requirement: Internal links go through `getRelativeLocaleUrl`

All internal links in components and pages SHALL be produced by
`getRelativeLocaleUrl(lang, path)` from `astro:i18n`. Hardcoded `<a
href="/about">` is forbidden.

#### Scenario: A nav component links to the about page

- **GIVEN** a component renders a link to `/about`
- **WHEN** the audit runs
- **THEN** it passes only if the `href` is `getRelativeLocaleUrl(lang,
'/about')`.

### Requirement: `LocaleSwitcher` lives in chrome and hides unlocalized items

The site chrome (header / footer) SHALL render a `LocaleSwitcher` that
shows only locales for which the _current page_ has a localized entry.

#### Scenario: A page exists only in English

- **GIVEN** `siteConfig.locales = ['en', 'es']` but only the English
  version of `/blog/<slug>` exists
- **WHEN** the user views the English page
- **THEN** the LocaleSwitcher hides the Spanish option for this page.

## Invariants (audit table)

| Id  | Statement                                                   | Audit                                             |
| --- | ----------------------------------------------------------- | ------------------------------------------------- |
| I1  | Default locale at `/`, non-default at `/[lang]/`            | `node scripts/audit/i18n-parallels.mjs`           |
| I2  | `getStaticPaths` emits one entry per locale minus default   | `node scripts/audit/i18n-parallels.mjs --strict`  |
| I3  | Content collections use `{locale}/{slug}.mdx`               | `node scripts/audit/i18n-parallels.mjs --content` |
| I4  | `siteConfig.locales` defaults to `['en']` in new templates  | `node scripts/audit/i18n-parallels.mjs --config`  |
| I5  | Internal links use `getRelativeLocaleUrl`                   | `node scripts/audit/internal-links-localized.mjs` |
| I6  | `LocaleSwitcher` present in chrome, hides unlocalized items | manual (no static audit yet)                      |
