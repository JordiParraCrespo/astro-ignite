# Tasks: docs-add-404-page-with-i18n-locale-paral

Ordered checklist. Each task declares the scenarios (`S<n>`) and
invariants (`I<n>`) it covers. The implementer commits each task via
`scripts/committer --design openspec/changes/docs-add-404-page-with-i18n-locale-paral/design.md`.

## Template — `packages/templates/docs/`

- [ ] **T1** — Add the `errors.404.search` key to
      `packages/templates/docs/src/i18n/en.json` (value:
      `"Search the docs"`) and `packages/templates/docs/src/i18n/es.json`
      (value: `"Buscar en la documentación"`). Confirm the two JSON
      files stay key-parallel by structural diff.
      _Covers: S8._
- [ ] **T2** — Create
      `packages/templates/docs/src/components/not-found/NotFoundHero.astro`.
      Compose `Text`, `Button`, and `SearchBox` (from `@/components/docs/SearchBox.astro`)
      per the signature in `design.md`. Use `getRelativeLocaleUrl(locale, '/')`
      for the back-to-home link. Put layout styles in a scoped `<style>`
      block using design tokens — no raw zinc / hex. Wire the secondary
      "Search the docs" button to the SearchBox dialog trigger.
      _Covers: S4, S5, S6; templates-i18n I5, templates-css-tokens I1,
      I4._
- [ ] **T3** — Create
      `packages/templates/docs/src/pages/404.astro`. Set
      `Astro.response.status = 404;` as the first statement after the
      imports. Render `<BaseLayout noindex={true}
title={t('seo.404.title')} description={t('seo.404.description')}>`
      around `<NotFoundHero />`. Do not emit any standalone JSON-LD.
      _Covers: S1, S3, S7; templates-seo-jsonld I1, I2._
- [ ] **T4** — Create
      `packages/templates/docs/src/pages/[lang]/404.astro`. Export a
      `getStaticPaths()` that returns
      `siteConfig.locales.filter((l) => l !== siteConfig.defaultLocale).map((lang) => ({ params: { lang } }))`.
      Set `Astro.response.status = 404`. Render the same `<BaseLayout>
  - <NotFoundHero />`body as T3 so the default locale and`[lang]`
    surface use the same component (no markup duplication).
    _Covers: S2, S3; templates-i18n I1, I2._

## Apps mirror — `apps/docs/`

- [ ] **T5** — Mirror T1 in `apps/docs/src/i18n/en.json` and
      `apps/docs/src/i18n/es.json` (add the `errors.404.search` key
      with the same values).
      _Covers: S8, S9._
- [ ] **T6** — Mirror T2: create
      `apps/docs/src/components/not-found/NotFoundHero.astro` —
      verbatim copy of the template component (alias imports resolve
      through the `apps/docs` `tsconfig`).
      _Covers: S6, S9._
- [ ] **T7** — Mirror T3: create `apps/docs/src/pages/404.astro` —
      verbatim copy of the template page.
      _Covers: S1, S3, S9._
- [ ] **T8** — Mirror T4: create `apps/docs/src/pages/[lang]/404.astro`
      — verbatim copy of the template `[lang]` page.
      _Covers: S2, S3, S9._

## Verification

- [ ] **T9** — Confirm no new runtime dependency was added by diffing
      `packages/templates/docs/package.json` and
      `apps/docs/package.json` against `main`.
      _Covers: S10; templates-perf I5._
- [ ] **T10** — Run
      `pnpm audit:invariants --change docs-add-404-page-with-i18n-locale-paral`
      and confirm `i18n-parallels`, `internal-links-localized`,
      `tokens-only`, and `jsonld-graph` audits stay green.
      _Covers: templates-i18n I1, I2, I4, I5; templates-css-tokens I1,
      I4; templates-seo-jsonld I1, I2, I3._
- [ ] **T11** — Run `pnpm typecheck`, `pnpm format:check`, and
      `pnpm test` from the workspace root; confirm all green.
      _Covers: S1, S2, S6._
- [ ] **T12** — Run `pnpm scaffold:test`. Confirm the scaffolded
      playground (built from the docs template) ships the new 404
      surface and the build does not regress.
      _Covers: S1, S2, S11._
- [ ] **T13** — Run `pnpm perf:budget` against the docs build for the
      404 surface (`--page /404.html` or `--page /does-not-exist`).
      Confirm Lighthouse mobile Performance/Accessibility/Best
      Practices/SEO all ≥ 95 and total transfer is within the
      templates-perf budget.
      _Covers: S11; templates-perf I1, I3, I4._
- [ ] **T14** — Manual smoke: `pnpm dev:docs-template`, request
      `/does-not-exist` in the browser, confirm the styled 404 renders
      with chrome (theme toggle works, locale switcher visible when
      `siteConfig.locales.length > 1`); request `/es/does-not-exist`
      (after temporarily setting `siteConfig.locales = ['en', 'es']`)
      and confirm the Spanish 404 renders. Revert the config change
      before commit.
      _Covers: S1, S2, S4._

## Out of scope (do NOT do in this change)

- Editing `packages/templates/starter/` 404 wiring (single-emit choice
  preserved).
- Removing the `registry:block` `not-found-state` entry from
  `packages/registry/registry.json` (that belongs to
  `restructure-starter-template-component-o`).
- Adding folder-level 404 surfaces (one global 404 per locale is
  enough).
- Adding a full search experience inside the 404 page beyond opening
  the existing dialog.
