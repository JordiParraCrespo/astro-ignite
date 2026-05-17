# Capability: banner-pipeline

## Purpose

Every banner / OG / blog hero image SHALL be generated from an HTML
source that uses the claude-design language, rendered through headless
Chrome to PNG. No hand-rolled SVG, no satori, no resvg.

## Boundary

Owned by: `apps/site/scripts/banners/`, `packages/design-fetch/`, the
blog post `heroImage` frontmatter field.

Touched by: every author who ships a blog post or an OG image.

## Requirements

### Requirement: Banners come from HTML, not from text-to-image tooling

Every PNG referenced as `heroImage` or `ogImage` in MDX frontmatter or
layout config SHALL be produced by
`node apps/site/scripts/banners/generate.mjs` from an HTML source under
`apps/site/scripts/banners/<slug>.html`.

#### Scenario: Adding a new blog post

- **GIVEN** the post needs a hero image
- **WHEN** the author creates the asset
- **THEN** the HTML source lives at
  `apps/site/scripts/banners/<slug>.html` and the PNG lives at
  `apps/site/src/content/blog/_assets/hero-<slug>.png`.

### Requirement: No inline SVG, no satori, no resvg

The repo SHALL NOT contain inline `<svg>` blocks rendered as hero
imagery, nor imports from `satori`, `@vercel/og`, `resvg-js`, or
`@resvg/resvg-js`.

#### Scenario: A contributor reaches for satori

- **GIVEN** the contributor adds `import satori from 'satori'`
- **WHEN** the audit runs
- **THEN** it rejects.

### Requirement: Banner HTML uses the claude-design tokens

Banner HTML files SHALL `@import` the shared `banner.css` and reference
the design tokens (zinc-950 base, Geist + Geist Mono fonts loaded
locally, grid overlay, pill chips, terminal panel).

#### Scenario: Auditing a new banner HTML file

- **GIVEN** a contributor adds `apps/site/scripts/banners/foo.html`
- **WHEN** the audit inspects it
- **THEN** the file imports `banner.css` and references token variables,
  not raw hex.

### Requirement: Font hash drift handled at generation time

If the Geist woff2 hash changes after an Astro build, the banner fonts
SHALL be re-copied from `apps/site/dist/_astro/fonts/` into
`apps/site/scripts/banners/fonts/` before the next banner generation.
This is the generator's responsibility — `apps/site/scripts/banners/generate.mjs`
should refuse to render with stale fonts. Not a harness-wide concern.

## Invariants (audit table)

| Id  | Statement                                                                                 | Audit                                                       |
| --- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| I1  | No inline SVG hero imagery in MDX                                                         | `node scripts/audit/banner-pipeline.mjs`                    |
| I2  | No imports from satori / @vercel/og / resvg                                               | `node scripts/audit/banner-pipeline.mjs --no-text-to-image` |
| I3  | Every `heroImage` reference has a matching HTML source under `apps/site/scripts/banners/` | `node scripts/audit/banner-pipeline.mjs --html-source`      |
| I4  | Banner CSS uses design tokens, not raw hex                                                | `node scripts/audit/banner-pipeline.mjs --tokens`           |
