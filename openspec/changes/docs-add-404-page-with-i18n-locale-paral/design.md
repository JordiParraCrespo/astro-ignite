# Design: docs-add-404-page-with-i18n-locale-paral

## Files touched

### `packages/templates/docs/` — the docs template (source of truth)

- NEW `packages/templates/docs/src/pages/404.astro` — default-locale 404
  page. Frontmatter sets `Astro.response.status = 404`, then renders
  `<BaseLayout title={t('seo.404.title')} description={t('seo.404.description')} noindex={true}><NotFoundHero /></BaseLayout>`.
  Mirror of `packages/templates/starter/src/pages/404.astro` adapted to
  the docs `BaseLayout` import surface.
- NEW `packages/templates/docs/src/pages/[lang]/404.astro` — non-default
  locale 404 page. Exports
  `getStaticPaths()` that emits one entry per
  `siteConfig.locales.filter((l) => l !== siteConfig.defaultLocale)`
  (same pattern as the starter's `[lang]/about.astro`,
  `[lang]/contact.astro`, etc.). Frontmatter sets
  `Astro.response.status = 404`. Renders the same `<BaseLayout> +
<NotFoundHero />` body as the default-locale page.
- NEW `packages/templates/docs/src/components/not-found/NotFoundHero.astro`
  — docs-flavored 404 surface. Differences vs the starter's
  `NotFoundHero.astro`:
  - Primary CTA reads `t('errors.404.back')` and links to
    `getRelativeLocaleUrl(locale, '/')` — the docs landing.
  - Secondary affordance reads `t('errors.404.search')`. The button has
    `popovertarget` / `data-search-trigger` (whichever attribute the
    existing `docs/SearchBox.astro` listens on) so clicking it opens
    the same search dialog the header chrome opens.
  - Imports come from `@/components/ui/text.astro`,
    `@/components/ui/button.astro`, `@/components/ui/link.astro`,
    and `@/components/docs/SearchBox.astro` only (no new atom).
  - Scoped `<style>` block (layered-CSS strategy) for the centered
    layout; spacing is in `rem`, colors flow through tokens.
- MOD `packages/templates/docs/src/i18n/en.json` — add
  `"errors.404.search": "Search the docs"`. Existing
  `errors.404.{heading,body,back}` and `seo.404.{title,description}`
  stay unchanged.
- MOD `packages/templates/docs/src/i18n/es.json` — add
  `"errors.404.search": "Buscar en la documentación"`. Existing keys
  stay unchanged.

### `apps/docs/` — manual mirror

Per `apps/docs/CLAUDE.md`, this app is a manual mirror of the docs
template — same files are added in the same PR:

- NEW `apps/docs/src/pages/404.astro` — verbatim copy of the template
  file (alias imports `@/...` resolve through the apps/docs `tsconfig`).
- NEW `apps/docs/src/pages/[lang]/404.astro` — verbatim copy of the
  template file.
- NEW `apps/docs/src/components/not-found/NotFoundHero.astro` — verbatim
  copy of the template component.
- MOD `apps/docs/src/i18n/en.json` — add the `errors.404.search` key.
- MOD `apps/docs/src/i18n/es.json` — add the `errors.404.search` key.

### Spec deltas (under this change's `specs/` tree)

- NEW
  `openspec/changes/docs-add-404-page-with-i18n-locale-paral/specs/templates-i18n/spec.md`
  — adds one `## ADDED Requirements` scenario covering the localized
  404 parallel (existing requirement "Every page has a `[lang]`
  parallel" already covers normal pages but explicitly _exempts_
  `404.astro` per the audit; this delta documents the docs template's
  opt-in to the localized 404 surface without changing the audit rule
  for other templates).
- NEW
  `openspec/changes/docs-add-404-page-with-i18n-locale-paral/specs/templates-css-tokens/spec.md`
  — empty `## ADDED Requirements` block (no new requirements); the
  change is bound by the existing I1/I4 invariants on the new
  component file.
- NEW
  `openspec/changes/docs-add-404-page-with-i18n-locale-paral/specs/templates-seo-jsonld/spec.md`
  — empty `## ADDED Requirements` block; the change is bound by the
  existing I1/I2 invariants on the new page files.
- NEW
  `openspec/changes/docs-add-404-page-with-i18n-locale-paral/specs/templates-perf/spec.md`
  — empty `## ADDED Requirements` block; the change is bound by the
  existing I1/I3/I4 invariants against a clean docs build.

## New signatures

### `NotFoundHero.astro` (template + apps/docs mirror)

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n';
import Button from '@/components/ui/button.astro';
import Text from '@/components/ui/text.astro';
import { useTranslations } from '@/i18n';
import { siteConfig } from '@/config/site';
import SearchBox from '@/components/docs/SearchBox.astro';

const locale = Astro.currentLocale ?? siteConfig.defaultLocale;
const t = useTranslations(locale);
const homeHref = getRelativeLocaleUrl(locale, '/');
---
```

Renders one `<section class="not-found">` with:

- `<Text variant="eyebrow">404</Text>`
- `<Text variant="h1">{t('errors.404.heading')}</Text>`
- `<Text variant="lead">{t('errors.404.body')}</Text>`
- Action row: primary `<Button href={homeHref}>` for back-to-home,
  secondary `<Button>` wired to the SearchBox trigger (no `href`; opens
  the dialog client-side).
- One `<SearchBox />` instance at the end of the section so the dialog
  is mounted (matches how the header chrome mounts it elsewhere).

### `pages/404.astro` (template + apps/docs mirror)

```astro
---
Astro.response.status = 404;

import BaseLayout from '@/layouts/BaseLayout.astro';
import NotFoundHero from '@/components/not-found/NotFoundHero.astro';
import { useTranslations } from '@/i18n';
import { siteConfig } from '@/config/site';

const locale = Astro.currentLocale ?? siteConfig.defaultLocale;
const t = useTranslations(locale);
---

<BaseLayout title={t('seo.404.title')} description={t('seo.404.description')} noindex={true}>
  <NotFoundHero />
</BaseLayout>
```

### `pages/[lang]/404.astro` (template + apps/docs mirror)

```astro
---
Astro.response.status = 404;

import BaseLayout from '@/layouts/BaseLayout.astro';
import NotFoundHero from '@/components/not-found/NotFoundHero.astro';
import { useTranslations } from '@/i18n';
import { siteConfig } from '@/config/site';

export function getStaticPaths() {
  return siteConfig.locales
    .filter((l) => l !== siteConfig.defaultLocale)
    .map((lang) => ({ params: { lang } }));
}

const locale = Astro.currentLocale ?? siteConfig.defaultLocale;
const t = useTranslations(locale);
---

<BaseLayout title={t('seo.404.title')} description={t('seo.404.description')} noindex={true}>
  <NotFoundHero />
</BaseLayout>
```

## Invariants this change touches

This change is constrained by the following invariants from the
capabilities it touches. Each invariant is identified by its
`I<n>` id in the matching `openspec/specs/<capability>/spec.md` and
audited by the cited command.

### `templates-i18n` (`openspec/specs/templates-i18n/spec.md`)

- **I1** — Default locale at `/`, non-default at `/[lang]/`.
  Audit: `node scripts/audit/i18n-parallels.mjs`.
  Applies because we add a `pages/404.astro` (default locale) **and** a
  `pages/[lang]/404.astro` (non-default locale parallel).
- **I2** — `getStaticPaths` emits one entry per locale minus default.
  Audit: `node scripts/audit/i18n-parallels.mjs --strict`.
  Applies to the new `pages/[lang]/404.astro` — the strict audit will
  read the file and confirm it exports `getStaticPaths`. The audit
  currently exempts `404.astro` from the **parallel-required** rule,
  but the `--strict` pass still checks that any `[lang]/*.astro` we
  ship contains a `getStaticPaths` call.
- **I4** — `siteConfig.locales` defaults to `['en']`.
  Audit: `node scripts/audit/i18n-parallels.mjs --config`.
  Untouched — we do not modify `siteConfig`.
- **I5** — Internal links use `getRelativeLocaleUrl`.
  Audit: `node scripts/audit/internal-links-localized.mjs`.
  Applies to the back-to-home link inside `NotFoundHero.astro` and
  to any link/button `href` we introduce.
- **I6** — `LocaleSwitcher` present in chrome, hides unlocalized items.
  Audit: manual.
  Indirectly applies — the new `[lang]/404.astro` ensures the
  LocaleSwitcher has a real localized target for the 404 surface.

### `templates-css-tokens` (`openspec/specs/templates-css-tokens/spec.md`)

- **I1** — No raw zinc / hex in component files.
  Audit: `node scripts/audit/tokens-only.mjs`.
  Applies to the new `NotFoundHero.astro` and the two new page files.
- **I4** — Above-the-fold uses scoped `<style>` (layered CSS).
  Audit: `node scripts/audit/tokens-only.mjs --layered`.
  Applies because the 404 surface is essentially above the fold; its
  layout styles live in a scoped `<style>` block, not in a Tailwind
  class soup.

### `templates-seo-jsonld` (`openspec/specs/templates-seo-jsonld/spec.md`)

- **I1** — Layout emits exactly one JSON-LD `@graph` script.
  Audit: `node scripts/audit/jsonld-graph.mjs`.
  Applies to the rendered 404 pages — only the `BaseLayout` may emit
  the `@graph` block.
- **I2** — No page emits standalone JSON-LD outside the layout.
  Audit: `node scripts/audit/jsonld-graph.mjs --strict`.
  Applies to `pages/404.astro`, `pages/[lang]/404.astro`, and
  `components/not-found/NotFoundHero.astro` — none of them may inline
  a `<script type="application/ld+json">` block.
- **I3** — All graph nodes are typed via `schema-dts`.
  Audit: `node scripts/audit/jsonld-graph.mjs --typed`.
  Indirectly applies — we do not add a custom node for the 404, but the
  layout's default `WebSite`/`Organization`/`WebPage` graph still has
  to typecheck.

### `templates-perf` (`openspec/specs/templates-perf/spec.md`)

- **I1** — Lighthouse budget met on home page.
  Audit: `node scripts/perf/run.mjs --page /`.
  Untouched — the 404 surface is not the home page, but the budget
  must still hold against the docs build.
- **I3** — Total transfer ≤ 150KB compressed (home).
  Audit: `node scripts/perf/run.mjs --transfer`.
  Indirectly applies — the 404 page should fit the same budget; the
  reviewer adds `--page /does-not-exist` (or builds and curls
  `dist/404.html`) to confirm.
- **I4** — Critical CSS inlined (Beasties output present).
  Audit: `node scripts/perf/run.mjs --critical-css`.
  Applies to the new 404 HTML files — Beasties must inline their
  critical CSS just like every other page.
- **I5** — No undeclared runtime dep added since last archive.
  Audit: `node scripts/perf/run.mjs --deps`.
  Applies because the implementer MUST NOT add a new runtime dep in
  `packages/templates/docs/package.json` or `apps/docs/package.json`.

### Per-change audit

`pnpm audit:invariants --change docs-add-404-page-with-i18n-locale-paral`
dispatches the four capability audits above plus the per-change
manifest assembled by `scripts/audit/run-all.mjs`.

Audit commands (parseable by `scripts/audit/run-all.mjs --change`):

- audit: `node scripts/audit/i18n-parallels.mjs`
- audit: `node scripts/audit/i18n-parallels.mjs --strict`
- audit: `node scripts/audit/internal-links-localized.mjs`
- audit: `node scripts/audit/tokens-only.mjs`
- audit: `node scripts/audit/tokens-only.mjs --layered`
- audit: `node scripts/audit/jsonld-graph.mjs`
- audit: `node scripts/audit/jsonld-graph.mjs --strict`
- audit: `node scripts/audit/jsonld-graph.mjs --typed`

## Performance budget applicability

The change capabilities match `/^(templates|registry)-/`, so per
`openspec/feature_list.json` `rules.require_perf_budget_to_close_when`
the perf-budget step **is required** to close. The reviewer runs:

- `node scripts/perf/run.mjs --page /` against the docs build (existing
  invariant) — must stay ≥ 95 across the four Lighthouse mobile scores.
- `node scripts/perf/run.mjs --page /404.html` (or equivalent) — same
  thresholds; ensures the 404 surface doesn't drag the budget down.
- `node scripts/perf/run.mjs --transfer` — total transfer for the 404
  page stays within the templates-perf transfer budget.

The implementer is expected to keep the 404 surface JS-free (the
SearchBox dialog mounts whatever client JS it already shipped — no new
script is added).

## Rejected alternative

**Skip the `[lang]/404.astro` parallel and rely on a single
`pages/404.astro` for every locale.** This is what the starter does
today and what `scripts/audit/i18n-parallels.mjs` allows (the audit
explicitly exempts `404.astro` from the parallel-required rule).

Rejected because:

1. The issue body specifically asks for parallel routes (acceptance
   item 2 in the issue: "`packages/templates/docs/src/pages/[lang]/404.astro`
   exists with a `getStaticPaths` that emits one entry per
   `siteConfig.locales` minus the default").
2. Without the parallel, a non-default-locale visitor lands on a 404
   whose `<html lang>` is the default locale, the `LocaleSwitcher`
   defaults to the wrong active locale, and the back-to-home link
   resolves to the default-locale home (`/`) instead of the localized
   home (`/<lang>/`). That's a noticeably worse experience for the
   exact users the docs template's i18n wiring exists to serve.
3. The implementation cost is one extra file (~25 lines) with a
   `getStaticPaths` that emits nothing under the default
   single-locale config — i.e. dormant infrastructure, the same shape
   as every other `[lang]/` route in the template.

The starter's single-emit choice is preserved for the starter; it can
be revisited in a separate change if and when the starter wants the
same richness.
