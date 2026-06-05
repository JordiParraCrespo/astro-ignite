# Delta: templates-i18n — restructure-starter-template-component-o

This change relocates the chrome that participates in i18n —
specifically `LocaleSwitcher.astro` and the new `Header.astro`
(renamed from `Nav.astro`) — into
`packages/templates/<kind>/src/components/common/`. The capability's
behaviour (parallel routes, `getStaticPaths` parity, content
collection layout, `getRelativeLocaleUrl`, switcher in chrome) is
preserved.

The audit script `scripts/audit/internal-links-localized.mjs` walks
template files looking for `<a href="…">` literals and verifies that
each goes through `getRelativeLocaleUrl(lang, …)`. It is path-
agnostic, so it continues to pass after the chrome relocation.

## ADDED Requirements

### Requirement: Chrome that drives i18n lives in `common/`

In every template, the chrome that drives i18n — header, locale
switcher, and any future locale-aware sibling — SHALL live under
`src/components/common/`. The header file is named `Header.astro`
(the canonical, post-rename name); the switcher file is named
`LocaleSwitcher.astro`.

This pins the location so the previous boundary requirement
"LocaleSwitcher lives in chrome" cannot be satisfied by a loose-root
or sections-folder placement.

#### Scenario: A new template adds a header

- **GIVEN** a contributor adds a new template under
  `packages/templates/<new>/`
- **WHEN** they add a `Header.astro` at the root of `src/components/`
- **THEN** the audit fails and instructs them to move it to
  `src/components/common/Header.astro`.

#### Scenario: A contributor adds a locale switcher

- **GIVEN** a new locale switcher file in the starter
- **WHEN** the audit runs
- **THEN** the audit passes only if the file is
  `src/components/common/LocaleSwitcher.astro`.

## MODIFIED Requirements

### Requirement: `LocaleSwitcher` lives in chrome and hides unlocalized items

The site chrome (header / footer) SHALL render a
`LocaleSwitcher` that shows only locales for which the _current
page_ has a localized entry. The switcher component file SHALL live at
`src/components/common/LocaleSwitcher.astro` (relocated from the
loose-root `src/components/LocaleSwitcher.astro`).

#### Scenario: A page exists only in English

- **GIVEN** `siteConfig.locales = ['en', 'es']` but only the English
  version of `/blog/<slug>` exists
- **WHEN** the user views the English page
- **THEN** the LocaleSwitcher hides the Spanish option for this page.

#### Scenario: Finding the switcher in the tree

- **GIVEN** the post-change starter
- **WHEN** the switcher is located
- **THEN** it lives at `src/components/common/LocaleSwitcher.astro`,
  not at any other path.

## REMOVED Requirements

_None._ I1–I5 are unchanged at the route level.

## Notes

- **Relationship to I5.** I5 (`getRelativeLocaleUrl` for internal
  links) is unaffected. The relocated `Header.astro` and
  `LocaleSwitcher.astro` continue to call
  `getRelativeLocaleUrl(lang, '/about')` etc.; the audit walks every
  template file regardless of subdirectory, so the rename and
  relocation are invisible to it.
- **Relationship to change #28's ADDED requirement (`default-locale
and [lang]/ parallels import the same section components`)**. That
  requirement still holds after the rename. The relocated section
  components (`about/AboutBody.astro`, `blog/BlogIndexList.astro`,
  etc.) are imported by both default-locale and `[lang]/` pages at
  the same new path. The two pages remain symmetric.
