# Delta: templates-consent — restructure-starter-template-component-o

This change relocates `CookieBanner.astro` and `Analytics.astro` in
the starter and in every scaffolded mirror. The capability's behaviour
(consent gating, banner presence, cookie policy link, analytics
boundary) is preserved. The only thing that shifts is the **owned-by**
path enumeration in the capability boundary: instead of
`src/components/CookieBanner.astro` and
`src/components/Analytics.astro`, the files now live at
`src/components/legal/CookieBanner.astro` and
`src/components/common/Analytics.astro`.

The existing audits remain green because they walk the template tree
by filename, not by hardcoded path
(`scripts/audit/consent-gated-analytics.mjs` uses
`walkFiles(join(tpl, 'src'), (full, n) => n === 'Analytics.astro')`
and the analogous lookup for `CookieBanner.astro`).

## ADDED Requirements

### Requirement: Consent surface lives in feature-folder subdirectories

`CookieBanner.astro` SHALL live at
`src/components/legal/CookieBanner.astro` and `Analytics.astro` SHALL
live at `src/components/common/Analytics.astro` in every template
(`packages/templates/<kind>/`). The base layout SHALL import them from
these paths.

This requirement is structural — it preserves the consent contract
but pins down the new file locations so future contributors do not
restore the loose-root pattern.

#### Scenario: A fresh template ships

- **GIVEN** a contributor adds a new template under
  `packages/templates/<new>/`
- **WHEN** the audit runs
- **THEN** the audit fails if `CookieBanner.astro` sits at the root of
  `src/components/` (loose) instead of under `legal/`; likewise for
  `Analytics.astro` under `common/`.

#### Scenario: Importing the banner in the base layout

- **GIVEN** the starter base layout
- **WHEN** the file is read
- **THEN** it imports `CookieBanner` from
  `@/components/legal/CookieBanner.astro` and `Analytics` from
  `@/components/common/Analytics.astro`.

## MODIFIED Requirements

### Requirement: Cookie banner is present on every page

`CookieBanner.astro` SHALL render in the base layout for every page,
hidden once consent has been recorded. The component SHALL live at
`src/components/legal/CookieBanner.astro` (renamed from the loose-root
`src/components/CookieBanner.astro`).

#### Scenario: Visitor on a deep blog post

- **GIVEN** the visitor has not yet given consent
- **WHEN** they land on `/blog/some-post`
- **THEN** the cookie banner is visible, and the file that supplies
  it is `src/components/legal/CookieBanner.astro`.

### Requirement: Analytics provider is swappable at the boundary

The third-party tag SHALL be encapsulated in
`src/components/common/Analytics.astro` (relocated from the loose
root). Switching Plausible → Umami / Fathom / GA is a single-file
edit at the new path.

#### Scenario: Swapping providers

- **GIVEN** a user wants Umami instead of Plausible
- **WHEN** they edit `src/components/common/Analytics.astro`
- **THEN** no other file needs to change.

## REMOVED Requirements

_None._ I1, I3, and I4 are unchanged; I2 is restated with the new
path.

## Notes

- **Audit hook (existing).**
  `scripts/audit/consent-gated-analytics.mjs` walks the template tree
  for files named `Analytics.astro` and `CookieBanner.astro`
  regardless of subdirectory, so it continues to pass after the
  relocation. The `--banner` mode tests that
  `BaseLayout.astro` contains the string `CookieBanner`; that test
  is path-agnostic. The `--boundary` mode tests that `plausible`
  appears only in `Analytics.astro` (filename match); also
  path-agnostic.
- **Why `legal/` for the banner?** Per the bucket semantics: the
  cookie banner is the runtime arm of the legal/cookies surface — it
  asks consent, links to the cookie policy, and is the user's
  primary touch with the legal disclosures. Co-locating with the
  legal page chrome makes the relationship explicit in the file
  tree.
- **Why `common/` for the analytics tag?** The analytics file is a
  generic third-party-script boundary, parametrised by `siteConfig`.
  It is consumed by the base layout the way `Header` and `Footer`
  are; `common/` is the right neighbour.
- **Capability boundary update.** The spec's "Boundary" section
  names the paths it owns. After this change the boundary section
  (in the long-lived spec under `openspec/specs/templates-consent/`)
  reads `src/components/legal/CookieBanner.astro` and
  `src/components/common/Analytics.astro` instead of the loose-root
  paths. The reviewer applies that text edit when archiving this
  delta into the long-lived spec; the spec_author does not edit the
  long-lived spec.
