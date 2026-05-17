# Capability: templates-consent

## Purpose

Analytics (Plausible by default) and any third-party script that sets a
cookie or fingerprints the visitor are **consent-gated**. The cookie
banner is in the templates on day one; users can't ship analytics by
accident. A cookie policy link is mandatory wherever consent is asked.

## Boundary

Owned by: `packages/templates/<kind>/src/components/CookieBanner.astro`,
`src/components/Analytics.astro`, `src/lib/consent/*`, the legal pages
under `src/pages/legal/`.

Touched by: nothing else — third-party scripts route through
`Analytics.astro` or are forbidden.

## Requirements

### Requirement: Analytics scripts are gated on consent

`Analytics.astro` (and any wrapper for a third-party script that sets a
persistent identifier) SHALL render its `<script>` tag only after the
user has granted consent. Before consent, no network request to the
analytics endpoint is made.

#### Scenario: Fresh visit

- **GIVEN** a visitor lands on the home page with no prior consent
- **WHEN** the page loads
- **THEN** no request to `plausible.io` (or the configured endpoint) is
  fired.

#### Scenario: Consent granted

- **GIVEN** the visitor clicks "Accept" in the cookie banner
- **WHEN** the next navigation happens
- **THEN** `Analytics.astro` injects the Plausible script and pageview
  events fire.

### Requirement: Cookie banner is present on every page

`CookieBanner.astro` SHALL render in the base layout for every page,
hidden once consent has been recorded.

#### Scenario: Visitor on a deep blog post

- **GIVEN** the visitor has not yet given consent
- **WHEN** they land on `/blog/some-post`
- **THEN** the cookie banner is visible.

### Requirement: Cookie policy link is required where consent is asked

The cookie banner SHALL link to a cookie policy page that lives in the
template (`/legal/cookies` or equivalent).

#### Scenario: A new template ships

- **GIVEN** a contributor adds a new template
- **WHEN** the audit runs
- **THEN** the audit fails if `CookieBanner.astro` exists but
  `src/pages/legal/cookies.astro` (and its `[lang]` parallel) does not.

### Requirement: Analytics provider is swappable at the boundary

The third-party tag SHALL be encapsulated in `Analytics.astro`. Switching
Plausible → Umami / Fathom / GA is a single-file edit.

#### Scenario: Swapping providers

- **GIVEN** a user wants Umami instead of Plausible
- **WHEN** they edit `Analytics.astro`
- **THEN** no other file needs to change.

## Invariants (audit table)

| Id  | Statement                                                                | Audit                                                       |
| --- | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| I1  | Analytics scripts gated behind consent guard                             | `node scripts/audit/consent-gated-analytics.mjs`            |
| I2  | `CookieBanner.astro` rendered in base layout                             | `node scripts/audit/consent-gated-analytics.mjs --banner`   |
| I3  | Cookie policy page exists and is linked from the banner                  | `node scripts/audit/consent-gated-analytics.mjs --policy`   |
| I4  | Analytics tag lives only in `Analytics.astro` (no other file injects it) | `node scripts/audit/consent-gated-analytics.mjs --boundary` |
