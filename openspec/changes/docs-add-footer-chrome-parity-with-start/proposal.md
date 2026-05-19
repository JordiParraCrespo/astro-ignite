# Proposal: docs-add-footer-chrome-parity-with-start

## Why

`packages/templates/docs/src/components/common/` ships `Brand.astro`,
`LocaleSwitcher.astro`, `ThemeToggle.astro`, and `Analytics.astro` — but
**no `Footer.astro`**. A scaffolded docs site therefore renders no
footer chrome at all: no entry point to the legal pages
(`/legal/{privacy,terms,cookies}` and the `[lang]/` parallels exist but
nothing links to them), no brand mark at the bottom of the page, no
"made with astro-ignite" credit, no copyright line, no RSS hint.

The starter template ships
`packages/templates/starter/src/components/common/Footer.astro` with:

- a brand mark + tagline / description,
- a legal column linking to `/legal/privacy`, `/legal/terms`,
  `/legal/cookies` (built via `getRelativeLocaleUrl(locale, ...)`),
- an RSS link in the same column,
- a social column listing whatever entries are in
  `siteConfig.social`,
- a bottom row with the copyright year + "Built with astro-ignite."

Docs deserves the same chrome — the legal pages already exist in the
docs template, they just have no entry point from the rest of the site.
The i18n bundle (`packages/templates/docs/src/i18n/en.json` and
`es.json`) already exposes `footer.{rights,builtWith,rss,legal,social}`
keys but no consumer renders them. This change wires it all together,
trimmed for docs flavor:

- No RSS link by default (the docs template does not ship a blog and
  has no `rss.xml.ts`); the RSS column slot becomes a Resources column
  with the docs landing + a GitHub repo link (`siteConfig.social.github`
  is the natural source — already optional, so the column hides itself
  when no value is configured, matching the starter pattern).
- Legal column still surfaces Privacy / Terms / Cookies — these three
  files exist in `src/content/legal/{locale}/{privacy,terms,cookies}.mdx`
  and are routed by `pages/legal/[...slug].astro` already.
- Bottom row keeps the copyright + "Built with astro-ignite." line.
- Wired into `BaseLayout.astro` after the `<slot />` so every page that
  uses the layout (index, `[...slug]` via DocsLayout → BaseLayout,
  legal/[...slug] via LegalLayout → BaseLayout, 404, `[lang]/*`
  parallels) inherits the footer.

The i18n bundles add three new keys —
`footer.{privacy,terms,cookies}` — already present in the starter's
bundles for the same column. The mirror at `apps/docs/` follows the
same change file-for-file (the manual-mirror rule from
`apps/docs/CLAUDE.md`).

## Scope

### In scope

- `packages/templates/docs/src/components/common/Footer.astro` —
  docs-flavored footer chrome (NEW).
- `packages/templates/docs/src/layouts/BaseLayout.astro` — render
  `<Footer />` after the `<slot />` so every page inherits it (MOD).
- `packages/templates/docs/src/i18n/en.json` and `es.json` — add
  `footer.{privacy,terms,cookies}` keys; existing
  `footer.{rights,builtWith,rss,legal,social}` keys stay unchanged (MOD).
- `apps/docs/src/components/common/Footer.astro`,
  `apps/docs/src/layouts/BaseLayout.astro`, and
  `apps/docs/src/i18n/{en,es}.json` — mirror of the template changes
  (`apps/docs` is a manual mirror; same PR).
- `packages/astro-ignite/templates/docs/` — refresh via the
  prepack `copy-templates.mjs` script so a fresh `pnpm pack` ships the
  new Footer + updated BaseLayout + updated i18n bundles.
- A changeset under `.changeset/` documenting the addition for end
  users who scaffolded an earlier docs template and want to mirror the
  chrome back.
- Spec deltas: `templates-i18n` (one new scenario covering the docs
  footer chrome and its localized links), `templates-css-tokens` (no
  new requirements; bound by I1 / I4 on the new component),
  `templates-perf` (no new requirements; bound by the existing budget
  invariants against a clean docs build).

### Out of scope

- Adding a newsletter / subscribe form to the footer. The starter
  doesn't ship one and neither will the docs footer.
- Rebuilding the footer as a registry `block`. It stays a template
  component for now — consistent with the starter, which keeps the
  footer in `src/components/common/Footer.astro`.
- Theming differences between the starter and docs footer beyond the
  link set / copy (the visual language is identical — same tokens,
  same Text variants, same spacing scale).
- Adding RSS to the docs template just so the footer has an RSS link.
  The docs template has no blog collection; if a future change adds
  one, that change owns wiring `footer.rss` back in.
- Rewriting the existing `footer.{rss,social}` keys out of the docs
  i18n bundles — they stay so a downstream user who wants to surface
  RSS / social can do it without re-translating.
- Removing the existing chrome (Brand, LocaleSwitcher, ThemeToggle,
  Analytics) — those keep their current placements.

## Scenarios

### S1: Footer renders on every docs page through BaseLayout

- **GIVEN** the docs template is built with the default config
  (`siteConfig.locales = ['en']`, `defaultLocale = 'en'`)
- **WHEN** the user navigates to `/`, `/introduction` (or any
  `[...slug]` route via DocsLayout), `/legal/privacy` (via
  LegalLayout), or `/does-not-exist` (the 404 surface)
- **THEN** the page renders the new `<Footer />` component once,
  positioned in the DOM **after** the `<slot />` content emitted by
  `BaseLayout` — both for default-locale pages and their `[lang]/`
  parallels.

### S2: Footer composes ui/ atoms and uses design tokens only

- **GIVEN** `packages/templates/docs/src/components/common/Footer.astro`
- **WHEN** the file is audited
- **THEN** no raw `bg-zinc-*`, `text-zinc-*`, `border-zinc-*`, or
  6-/8-digit hex literal appears in the component; every color,
  border, and surface flows through `--color-fg`, `--color-fg-muted`,
  `--color-bg`, `--color-border`, etc. (via Tailwind arbitrary-value
  utilities like `text-[var(--color-fg-muted)]` or token-resolved
  utilities); body copy is rendered through the `<Text>` atom from
  `@/components/ui/text.astro`; any scoped `<style>` block carries a
  leading `<!-- tailwind-exception: <reason> -->` comment naming what
  Tailwind cannot express; `tokens-only` and (in the docs template's
  Layered CSS mode) `tokens-only --layered` audits stay green.

### S3: Internal links inside the footer go through getRelativeLocaleUrl

- **GIVEN** `Footer.astro`
- **WHEN** the component composes the legal-column links
  (`/legal/privacy`, `/legal/terms`, `/legal/cookies`) and the
  resources-column docs-landing link
- **THEN** every `href` is produced by
  `getRelativeLocaleUrl(locale, '/legal/<slug>')` (or
  `getRelativeLocaleUrl(locale, '/')` for the docs-landing link) — no
  hardcoded `/legal/privacy`, `/legal/`, or `/` string appears as an
  `href` value; `scripts/audit/internal-links-localized.mjs` stays
  green.

### S4: i18n bundles stay key-parallel

- **GIVEN** `packages/templates/docs/src/i18n/en.json` and
  `packages/templates/docs/src/i18n/es.json` (plus the mirrors at
  `apps/docs/src/i18n/{en,es}.json`)
- **WHEN** the change is applied
- **THEN** both locale bundles add the same three new keys —
  `footer.privacy`, `footer.terms`, `footer.cookies` (English values
  `"Privacy"`, `"Terms"`, `"Cookies"`; Spanish values `"Privacidad"`,
  `"Términos"`, `"Cookies"`) — and a structural diff of the two JSON
  files shows no missing keys in either direction; the existing
  `footer.{rights,builtWith,rss,legal,social}` keys are unchanged.

### S5: External links (GitHub repo) carry safe rel attributes

- **GIVEN** `Footer.astro` rendering a resources column that exposes
  the configured GitHub repo (when `siteConfig.social.github` is set)
- **WHEN** the component composes the external link
- **THEN** the `<a>` carries `rel="noopener noreferrer me"` and
  `target="_blank"` — matching the starter footer's social-link
  pattern; when `siteConfig.social.github` is unset (the default),
  the resources column omits the GitHub link cleanly (no empty bullet,
  no broken `href`).

### S6: LocaleSwitcher echo is rendered only when relevant

- **GIVEN** the docs `BaseLayout` already renders `LocaleSwitcher`
  inside `DocsLayout` (which composes BaseLayout) and inside any
  chrome that pages use
- **WHEN** `Footer.astro` is rendered on a single-locale config
  (`siteConfig.locales = ['en']`)
- **THEN** the footer does NOT render a second LocaleSwitcher
  instance (the existing in-content LocaleSwitcher in DocsLayout's
  page-header row stays the only place); when
  `siteConfig.locales.length > 1`, the footer is allowed to render a
  small LocaleSwitcher echo or to omit it — the choice is documented
  in `design.md` and matches the starter's pattern (single instance
  in the header — the footer doesn't duplicate the dropdown).

### S7: apps/docs mirror is updated in lockstep

- **GIVEN** every file added or modified under
  `packages/templates/docs/src/**`
- **WHEN** the change is merged
- **THEN** the corresponding paths under `apps/docs/src/**` are
  identical (modulo the import-alias resolution); `apps/docs` does not
  drift from the template even though the mirror is manual; a
  byte-diff of `Footer.astro`, `BaseLayout.astro`, and the two i18n
  files between the template and `apps/docs` is empty.

### S8: CLI template cache is refreshed

- **GIVEN** `packages/astro-ignite/templates/docs/`
- **WHEN** the prepack copy-templates script
  (`packages/astro-ignite/scripts/copy-templates.mjs`) runs as part of
  this change
- **THEN** the CLI cache mirrors `packages/templates/docs/` and ships
  the new Footer, the updated BaseLayout, and the updated i18n
  bundles; a fresh `pnpm pack` from `packages/astro-ignite/` would
  scaffold a docs project that renders the footer on first load.

### S9: No new runtime dependency

- **GIVEN** the implementation
- **WHEN** `packages/templates/docs/package.json` and
  `apps/docs/package.json` are diffed against `main`
- **THEN** no new `dependencies` entry is added; the footer composes
  existing `ui/` atoms (`text.astro`) and reuses `Brand.astro` only.

### S10: Perf budget holds on docs pages

- **GIVEN** a clean build of the docs template
- **WHEN** `pnpm perf:budget` runs against the docs landing `/` and
  at least one inner page (e.g. `/introduction` or the equivalent
  representative slug)
- **THEN** Lighthouse mobile Performance / Accessibility / Best
  Practices / SEO all stay ≥ 95; LCP / INP / CLS / TBT / total
  transfer stay within the templates-perf budget; the added footer
  markup does not push the home page past the 150 KB compressed
  transfer threshold.

### S11: All workspace gates stay green

- **GIVEN** the implementation is complete
- **WHEN** `pnpm format:check`, `pnpm typecheck`, `pnpm test`,
  `pnpm audit:invariants --change docs-add-footer-chrome-parity-with-start`,
  and `pnpm scaffold:test` are run
- **THEN** every command exits 0; the per-change audit dispatcher
  reports `i18n-parallels`, `internal-links-localized`, and
  `tokens-only` (plus the `--layered` pass while the docs template is
  still on Layered CSS) all green; the scaffolded playground built by
  `scaffold:test` from the docs template ships the new footer on its
  rendered HTML.

### S12: Changeset describes the addition

- **GIVEN** the change is opened
- **WHEN** `.changeset/` is inspected
- **THEN** a new changeset file exists naming
  `@astro-ignite/template-docs`, `@astro-ignite/docs`, and
  `astro-ignite` (the CLI), describing the footer addition as a
  non-breaking refactor and pointing at the legal-link entry point as
  the user-visible improvement.
