# Tasks: docs-add-footer-chrome-parity-with-start

Ordered checklist. Each task declares the scenarios (`S<n>`) and
invariants (`I<n>`) it covers. The implementer commits each task via
`scripts/committer --design openspec/changes/docs-add-footer-chrome-parity-with-start/design.md`.

## Template — `packages/templates/docs/`

- [x] **T1** — Add the three new keys to
      `packages/templates/docs/src/i18n/en.json` (`footer.privacy`:
      `"Privacy"`, `footer.terms`: `"Terms"`, `footer.cookies`:
      `"Cookies"`) and to
      `packages/templates/docs/src/i18n/es.json` (`"Privacidad"`,
      `"Términos"`, `"Cookies"`). Confirm the two bundles stay
      key-parallel via a structural diff.
      _Covers: S4._
- [x] **T2** — Create
      `packages/templates/docs/src/components/common/Footer.astro` per
      the signature in `design.md`. Compose `<Text>` from
      `@/components/ui/text.astro` for every body string; render the
      Legal column via `legalLinks` built from
      `getRelativeLocaleUrl(locale, '/legal/<slug>')`; render the
      optional Resources column (docs landing + GitHub) only when
      `siteConfig.social.github` is set; use Tailwind arbitrary-value
      utilities resolving to `--color-*` tokens for every color. Do
      NOT add a scoped `<style>` block (footer is below-the-fold) and
      do NOT add any `<script>`.
      _Covers: S2, S3, S5, S9; templates-i18n I5; templates-css-tokens
      I1, I4._
- [x] **T3** — Modify
      `packages/templates/docs/src/layouts/BaseLayout.astro` to import
      `Footer` from `@/components/common/Footer.astro` and render
      `<Footer />` between the `<slot />` and the `<CookieBanner />`.
      Leave the skip-link, slot, and cookie-banner placements
      otherwise unchanged.
      _Covers: S1._

## Apps mirror — `apps/docs/`

- [x] **T4** — Mirror T1 in `apps/docs/src/i18n/en.json` and
      `apps/docs/src/i18n/es.json`.
      _Covers: S4, S7._
- [x] **T5** — Mirror T2: create
      `apps/docs/src/components/common/Footer.astro` — verbatim copy
      of the template component (alias imports resolve through the
      `apps/docs` `tsconfig`).
      _Covers: S2, S3, S5, S7._
- [x] **T6** — Mirror T3 in `apps/docs/src/layouts/BaseLayout.astro`.
      _Covers: S1, S7._

## CLI cache — `packages/astro-ignite/templates/docs/`

- [x] **T7** — Refresh the CLI template cache by running
      `packages/astro-ignite/scripts/copy-templates.mjs` (or by
      copying the changed files by hand). The diff under
      `packages/astro-ignite/templates/docs/` should add
      `src/components/common/Footer.astro`, modify
      `src/layouts/BaseLayout.astro`, and modify
      `src/i18n/{en,es}.json` so a fresh `pnpm pack` ships the chrome.
      _Covers: S8._

## Changeset

- [x] **T8** — Add `.changeset/docs-add-footer-chrome-parity-with-start.md`
      naming `@astro-ignite/template-docs`, `@astro-ignite/docs`, and
      `astro-ignite` as `patch` bumps. Body explains the user-visible
      improvement (legal-page entry points, brand mark, attribution
      line) and notes that existing scaffolded docs sites can mirror
      the change by copying `Footer.astro` and updating their
      `BaseLayout`.
      _Covers: S12._

## Verification

- [x] **T9** — Confirm no new runtime dependency was added by diffing
      `packages/templates/docs/package.json` and
      `apps/docs/package.json` against `main`.
      _Covers: S9; templates-perf I5._
- [x] **T10** — Run
      `pnpm audit:invariants --change docs-add-footer-chrome-parity-with-start`
      and confirm `i18n-parallels`, `internal-links-localized`,
      `tokens-only`, and `tokens-only --layered` audits stay green.
      _Covers: S2, S3; templates-i18n I1, I2, I4, I5; templates-css-tokens
      I1, I4._
- [x] **T11** — Run `pnpm typecheck`, `pnpm format:check`, and
      `pnpm test` from the workspace root; confirm all green.
      _Covers: S11._
- [x] **T12** — Run `pnpm scaffold:test`. Confirm the scaffolded
      playground built from the docs template includes the new Footer
      in its rendered HTML and the build does not regress.
      _Covers: S1, S8, S11._
- [x] **T13** — Run `pnpm perf:budget` against the docs build for `/`
      and at least one inner page (e.g. `/introduction`). Confirm
      Lighthouse mobile Performance / Accessibility / Best Practices
      / SEO all ≥ 95 and total transfer is within the templates-perf
      budget.
      _Covers: S10; templates-perf I1, I2, I3, I4._
- [x] **T14** — Manual smoke: `pnpm dev:docs-template`. Confirm the
      footer renders on `/`, on a `[...slug]` page (e.g.
      `/introduction`), on `/legal/privacy`, and on `/does-not-exist`
      (404). Confirm theme toggle still works and the footer's tokens
      flip when `.light` is toggled on `<html>`. After temporarily
      setting `siteConfig.locales = ['en', 'es']` and a representative
      `social.github` value, confirm the legal-column links resolve
      to `/es/legal/<slug>` on `[lang]/` pages and the GitHub link
      opens in a new tab with `rel="noopener noreferrer me"`. Revert
      the config changes before commit.
      _Covers: S1, S3, S5, S6._

## Out of scope (do NOT do in this change)

- Editing `packages/templates/starter/` footer wiring.
- Adding RSS to the docs template just so the footer can link to it.
- Building a "newsletter / subscribe" form in the footer.
- Moving the footer into a registry `block`.
- Refactoring the existing Brand / LocaleSwitcher / ThemeToggle /
  Analytics chrome.
- Adding a new runtime dependency (icon library, link metadata
  fetcher, etc.).
