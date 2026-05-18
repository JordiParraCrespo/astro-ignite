# Delta: templates-i18n — add-e2e-testing-to-all-templates-and-app

The long-lived `templates-i18n` spec already lists invariants
**I1–I6** that govern parallel routes, `getStaticPaths` parity, content
collection layout, `siteConfig.locales` default, `getRelativeLocaleUrl`
for internal links, and `LocaleSwitcher` presence in chrome. Static
audits cover I1–I5; I6 was previously _"manual (no static audit
yet)"_. This change does not modify I1–I6. It adds an end-to-end test
suite that exercises the rendered chrome in a real browser, and files
**I7** + **I8** so the suite is a first-class invariant rather than
an out-of-band test.

## ADDED Requirements

### Requirement: LocaleSwitcher behaviour is covered by an e2e test

When a template / app is configured with at least two locales, an
end-to-end test SHALL drive the LocaleSwitcher in a real browser and
assert that:

1. Clicking a non-default locale entry navigates to the corresponding
   `/[lang]/<path>` URL,
2. `<html lang>` updates to the chosen locale,
3. The LocaleSwitcher hides the entry that corresponds to the page's
   current locale and any locale for which no parallel route exists,
4. With a single-locale configuration (`siteConfig.locales = ['en']`),
   the switcher is absent from the DOM or rendered with no clickable
   entries.

#### Scenario: Two-locale fixture swaps the route

- **GIVEN** the e2e test runs the target with `SITE_E2E=1` so the
  template's `astro.config.mjs` extends `siteConfig.locales` to
  `['en', 'es']`
- **WHEN** the test is on `/about` and clicks the Spanish entry in the
  LocaleSwitcher
- **THEN** the URL becomes `/es/about`, `<html lang>` is `es`, and the
  Spanish entry is no longer offered as a selectable option for the
  current page.

#### Scenario: Single-locale config hides the switcher

- **GIVEN** the default `siteConfig.locales = ['en']`
- **WHEN** the home page renders
- **THEN** the LocaleSwitcher is absent or rendered without selectable
  entries.

### Requirement: Header / footer internal nav is covered by an e2e test

For every non-playground target, an e2e test SHALL click every internal
link in `<header>` and the legal links in `<footer>` and assert that
each navigation:

1. Results in a 200 with the expected `<h1>` rendered,
2. Produces no `page.on('console', 'error')` events outside the
   documented allow-list,
3. Renders the layout's `@graph` JSON-LD block (cross-checked, not
   asserted as a new requirement).

#### Scenario: Header nav on the starter

- **GIVEN** the starter dev server
- **WHEN** the test visits `/` and clicks every internal link in the
  header
- **THEN** every resulting page returns 200, renders an `<h1>`, and no
  console error fires.

#### Scenario: Footer legal links

- **GIVEN** any non-playground target's home page
- **WHEN** the test clicks the privacy, terms, and cookies legal links
- **THEN** the URL matches `/legal/<slug>`, the page renders an `<h1>`,
  and no console error fires.

## MODIFIED Requirements

_None._ The existing requirements (parallel routes, `getStaticPaths`,
content collection layout, `getRelativeLocaleUrl`, LocaleSwitcher
presence) are unchanged in scope and audit.

## REMOVED Requirements

_None._

## Invariants delta

| Id  | Statement                                           | Audit                          |
| --- | --------------------------------------------------- | ------------------------------ |
| I7  | LocaleSwitcher behavior covered by an e2e test      | `pnpm test:e2e --grep '@i18n'` |
| I8  | Header / footer internal nav covered by an e2e test | `pnpm test:e2e --grep '@nav'`  |

I7 supersedes the manual / no-static-audit status of the existing I6 —
a Playwright run is now the canonical machine check, with the audit
script left in place for the structural half of the invariant.

## Notes

- The e2e suite does **not** replace
  `scripts/audit/i18n-parallels.mjs` or
  `scripts/audit/internal-links-localized.mjs`. Static audits catch
  structural drift cheaply (no browser boot, no dev server, runs on
  every commit). Playwright catches the live-browser behaviour that
  static checks cannot see — the LocaleSwitcher rendering decisions,
  whether the click handler actually navigates, whether `<html lang>`
  is in sync.
- The single-locale scenario in Requirement 1 is the inverse of the
  templates-i18n I4 default (`siteConfig.locales = ['en']`). It exists
  to guard against shipping a confusing one-entry switcher.
