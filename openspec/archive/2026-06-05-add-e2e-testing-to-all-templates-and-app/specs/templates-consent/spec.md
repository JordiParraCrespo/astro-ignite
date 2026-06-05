# Delta: templates-consent — add-e2e-testing-to-all-templates-and-app

The long-lived `templates-consent` spec lists invariants **I1–I4**
covering consent-gated analytics, banner presence in the base layout,
the cookie-policy link, and the analytics-tag boundary. The static
audits at `scripts/audit/consent-gated-analytics.mjs` cover the
structural side of I1–I4 (the script tag's gating logic, the file
location of `<CookieBanner>`, the existence of `/legal/cookies`, the
single-injection-point invariant). The _behavioural_ side — does the
banner actually render on a fresh visit, does clicking accept actually
emit a Plausible request, does Plausible truly stay silent pre-consent
— has been unverified. This change does not modify I1–I4. It adds an
end-to-end test that drives the banner in a real browser and files
**I5** + **I6** so consent gating becomes a first-class invariant
rather than an implicit promise.

## ADDED Requirements

### Requirement: Cookie banner + analytics gating covered by an e2e test (pre-consent)

For every non-playground target whose template ships
`CookieBanner.astro`, an end-to-end test SHALL assert the pre-consent
state in a real browser:

1. On a fresh browser context (no `cookie-consent` value in
   `localStorage`), the cookie banner is visible.
2. The banner contains a link to `/legal/cookies` (or the localized
   equivalent under `/[lang]/legal/cookies`).
3. While the banner is visible, no request is made to the configured
   analytics endpoint (Plausible by default;
   `siteConfig.analytics.endpoint` if overridden). The test asserts
   this via `page.route('https://plausible.io/**', route =>
{ hits++; route.abort(); })` and `expect(hits).toBe(0)` over the
   entire pre-consent visit, including a same-origin navigation.

#### Scenario: First-visit, no consent

- **GIVEN** a fresh context (`localStorage` cleared)
- **WHEN** the test visits `/`
- **THEN** `#cookie-banner` is visible, links to `/legal/cookies`, and
  no `plausible.io` request fires for the duration of the visit
  (including one same-origin navigation to `/about`).

### Requirement: Cookie banner + analytics gating covered by an e2e test (post-consent)

For every non-playground target whose template ships
`CookieBanner.astro`, an end-to-end test SHALL assert the post-consent
state:

1. Clicking the banner's "Accept" button hides the banner,
2. `localStorage.getItem('cookie-consent')` becomes `'accept'`,
3. On the next same-origin navigation, exactly one request to the
   configured analytics endpoint fires,
4. Reloading the page does not re-show the banner.

#### Scenario: Accept then navigate

- **GIVEN** the banner is visible
- **WHEN** the test clicks "Accept" and then navigates to `/about`
- **THEN** the banner is hidden, `cookie-consent` is `accept`, and
  exactly one analytics request has fired.

#### Scenario: Decline persists silence

- **GIVEN** the banner is visible
- **WHEN** the test clicks "Decline"
- **THEN** the banner hides, `cookie-consent` is `decline`, and no
  analytics request fires on the subsequent navigation.

## MODIFIED Requirements

_None._ The "Analytics scripts are gated on consent" requirement and
its existing audit (`scripts/audit/consent-gated-analytics.mjs`) are
unchanged in scope and behaviour.

## REMOVED Requirements

_None._

## Invariants delta

| Id  | Statement                                                                          | Audit                                      |
| --- | ---------------------------------------------------------------------------------- | ------------------------------------------ |
| I5  | Cookie banner visible pre-consent; analytics endpoint not contacted before consent | `pnpm test:e2e --grep '@consent-pregate'`  |
| I6  | Accept → consent stored → analytics fires on next navigation                       | `pnpm test:e2e --grep '@consent-postgate'` |

Both invariants live alongside the existing I1–I4. The static audit
remains the fast cheap check that the code path _exists_; Playwright
proves the code path _works_ in a real browser.

## Notes

- Tests do not depend on Plausible itself being reachable.
  `page.route('https://plausible.io/**', ...)` intercepts every
  request and asserts on the routed traffic — no network call ever
  leaves the runner. This keeps the suite deterministic and offline.
- If a contributor swaps Plausible for Umami / Fathom / GA per
  `templates-consent` Requirement 4 (provider swappability), the test
  uses the endpoint configured in `siteConfig.analytics.endpoint`,
  not a hardcoded `plausible.io`. The helper in
  `tests/e2e/shared/consent.ts` reads the endpoint from the same
  config the template renders.
