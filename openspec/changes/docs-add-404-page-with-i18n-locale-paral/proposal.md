# Proposal: docs-add-404-page-with-i18n-locale-paral

## Why

`packages/templates/docs/src/pages/` has no `404.astro`. When a visitor
hits an unknown URL on a docs site scaffolded from this template, Astro
falls back to its built-in unstyled "Page not found" surface — no
chrome, no theme, no localized message, no link back into the docs.

The starter template ships a real 404 (`pages/404.astro`,
`components/not-found/NotFoundHero.astro`, `errors.404.*` i18n keys).
The docs template should match that bar, _scoped to a docs site_:

- Back-to-home points at the docs landing (`/`), not a marketing home.
- A second affordance exposes the existing docs search (the
  `docs/SearchBox.astro` dialog) — the most natural recovery action for
  someone who landed on a wrong URL inside docs.
- Chrome falls out of `BaseLayout` (theme toggle, locale switcher,
  cookie banner, JSON-LD `@graph`) without introducing a separate
  layout.

The i18n keys (`errors.404.heading|body|back`, `seo.404.title|description`)
already exist in both `packages/templates/docs/src/i18n/{en,es}.json`
**and** the mirror at `apps/docs/src/i18n/{en,es}.json` — they were
added earlier without consumers. This change wires them up and adds
one new key (`errors.404.search`) for the docs-flavored search
affordance.

Scope note: per the issue body and the issue author's request, the docs
template adds **both** `pages/404.astro` and a `pages/[lang]/404.astro`
parallel. The existing `i18n-parallels` audit
(`scripts/audit/i18n-parallels.mjs`) explicitly exempts `404.astro` from
the parallel-required rule, so this is opt-in richness, not an audit
fix. We add the parallel so non-default-locale visitors get a 404 page
rendered in their locale (with the right `<html lang>`, the right
`<LocaleSwitcher>` state, and localized chrome). The parallel stays
dormant under the default single-locale config, exactly like every other
`[lang]/` route.

## Scope

### In scope

- `packages/templates/docs/src/pages/404.astro` — default-locale 404
  page (NEW).
- `packages/templates/docs/src/pages/[lang]/404.astro` — non-default
  locale 404 with `getStaticPaths` (NEW).
- `packages/templates/docs/src/components/not-found/NotFoundHero.astro`
  — 404 surface component, docs-flavored (NEW).
- `packages/templates/docs/src/i18n/{en,es}.json` — add `errors.404.search`
  key; existing `errors.404.{heading,body,back}` and `seo.404.*` keys
  stay unchanged (MOD).
- `apps/docs/src/pages/404.astro`, `apps/docs/src/pages/[lang]/404.astro`,
  `apps/docs/src/components/not-found/NotFoundHero.astro`, and
  `apps/docs/src/i18n/{en,es}.json` — mirror of the template changes
  (`apps/docs` is a manual mirror; same PR).
- Spec deltas: `templates-i18n` (add a scenario for non-default-locale
  404 routing), `templates-css-tokens` (no new requirements; touched
  via component compliance), `templates-seo-jsonld` (no new
  requirements; touched via `noindex` + layout-emitted `@graph`),
  `templates-perf` (no new requirements; touched via the perf budget).

### Out of scope

- Server-side 404 routing for SSR. The docs template is `output:
'static'`; the rendered HTML lives at `dist/404.html` (default locale)
  and `dist/<lang>/404.html` (parallels), and the static host
  (`@astrojs/node` preview, Netlify, Vercel, Cloudflare Pages) is
  responsible for serving them with an HTTP 404. We set
  `Astro.response.status = 404` in the frontmatter because the issue
  body explicitly asks for it and Astro propagates the status through
  any SSR/preview path that honors it; we do not expand the static-host
  scope.
- Removing the registry `not-found-state` block. That cleanup belongs to
  `restructure-starter-template-component-o` (#35) and to the starter,
  not the docs template.
- Customizing 404 surfaces per docs section (folder-level error pages).
  One global 404 per locale is sufficient.
- Adding a full search _experience_ to the 404. We reuse the existing
  `docs/SearchBox.astro` dialog or — when the build hasn't shipped the
  pagefind index yet — fall back to a localized link into the docs root.

## Scenarios

### S1: Default-locale 404 renders inside BaseLayout

- **GIVEN** the docs template is built with the default config
  (`siteConfig.locales = ['en']`, `defaultLocale = 'en'`)
- **WHEN** a visitor requests `/does-not-exist`
- **THEN** Astro serves `dist/404.html`; the page sets
  `Astro.response.status = 404`; the response renders the `BaseLayout`
  chrome (theme script, `<JsonLd>` `@graph`, `<Analytics>`,
  `<CookieBanner>`) and the `<NotFoundHero />` surface; the
  `<head>` carries `noindex` and `seo.404.{title,description}` from the
  English i18n bundle.

### S2: Non-default-locale 404 routes through `[lang]/404.astro`

- **GIVEN** `siteConfig.locales = ['en', 'es']` and `defaultLocale = 'en'`
- **WHEN** a visitor requests `/es/does-not-exist`
- **THEN** Astro serves `dist/es/404.html` built from
  `src/pages/[lang]/404.astro` (whose `getStaticPaths` emits one entry
  per locale minus the default); `Astro.currentLocale` is `'es'`; the
  `<html lang>` attribute is `es`; `<NotFoundHero />` renders Spanish
  strings via `useTranslations('es')`; the LocaleSwitcher offers
  swapping between the locales that have a 404 entry.

### S3: 404 status code is set in the frontmatter

- **GIVEN** `pages/404.astro` and `pages/[lang]/404.astro`
- **WHEN** the frontmatter executes
- **THEN** both files set `Astro.response.status = 404;` as the first
  statement after imports, so any SSR/preview path that honors the
  Astro response status reports the correct code (the static `404.html`
  / `<lang>/404.html` files still rely on the host for the actual HTTP
  status — see "Out of scope").

### S4: Back-to-home is locale-aware

- **GIVEN** `NotFoundHero.astro` rendered in any locale
- **WHEN** the component composes the primary back-to-home link
- **THEN** the `href` is `getRelativeLocaleUrl(locale, '/')` — never a
  hardcoded `/` or `/en/`; the link target is the docs landing for the
  current locale; the `internal-links-localized` audit stays green.

### S5: Search affordance reuses the existing SearchBox dialog

- **GIVEN** `NotFoundHero.astro`
- **WHEN** the component renders the secondary recovery affordance
- **THEN** it triggers the existing `docs/SearchBox.astro` dialog (the
  same widget the header chrome opens) — no second copy of the search
  UI is introduced; the trigger label is `t('errors.404.search')`; the
  search dialog opens client-side without a navigation (the dialog
  works on any page that mounts it, even when the page itself is a
  static 404 file).

### S6: Component uses design tokens only

- **GIVEN** `components/not-found/NotFoundHero.astro`
- **WHEN** the file is audited
- **THEN** no raw `bg-zinc-*`, `text-zinc-*`, or hex literal appears in
  the component; colors flow through `--color-fg`, `--color-fg-muted`,
  `--color-bg`, `--color-border`, etc. or Tailwind utilities wired to
  the token layer; layout styles live in a scoped `<style>` block;
  the `tokens-only` audit stays green.

### S7: Layout-emitted `@graph` stays the only JSON-LD on the page

- **GIVEN** the 404 page rendered via `BaseLayout`
- **WHEN** the HTML output is inspected
- **THEN** the page contains exactly one
  `<script type="application/ld+json">` block — the layout's `@graph`
  — and `NotFoundHero.astro` does not emit a standalone JSON-LD tag;
  the `jsonld-graph` audit stays green.

### S8: i18n bundles stay key-parallel

- **GIVEN** `packages/templates/docs/src/i18n/en.json` and `es.json`
  (plus the `apps/docs` mirrors)
- **WHEN** the change is applied
- **THEN** both locale bundles expose the same `errors.404.*` shape
  (`heading`, `body`, `back`, **new** `search`) and the same `seo.404.*`
  shape; running a structural diff of the two JSON files shows no
  missing keys in either direction.

### S9: apps/docs mirror is updated in lockstep

- **GIVEN** every file added under `packages/templates/docs/src/**`
- **WHEN** the change is merged
- **THEN** the corresponding paths under `apps/docs/src/**` are
  identical (modulo the import-alias resolution); `apps/docs` does not
  drift from the template even though the mirror is manual.

### S10: No new runtime dependency

- **GIVEN** the implementation
- **WHEN** `packages/templates/docs/package.json` and
  `apps/docs/package.json` are diffed against `main`
- **THEN** no new `dependencies` entry is added; the 404 surface
  composes existing `ui/` atoms (`text.astro`, `button.astro`, `link.astro`)
  and reuses `docs/SearchBox.astro`.

### S11: Perf budget holds on the 404 surface

- **GIVEN** a clean build of the docs template
- **WHEN** `pnpm perf:budget` runs against `/does-not-exist` (or
  `/404.html` directly)
- **THEN** Lighthouse mobile Performance/Accessibility/Best
  Practices/SEO all stay ≥ 95; total transferred bytes for the page
  stay within the templates-perf budget; no Beasties critical-CSS
  regression is observed.
