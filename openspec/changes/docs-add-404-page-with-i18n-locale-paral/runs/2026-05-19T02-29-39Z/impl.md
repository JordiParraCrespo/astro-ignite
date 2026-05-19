# Implementation — docs-add-404-page-with-i18n-locale-paral

Run: 2026-05-19T02-29-39Z

## Summary

Added a docs-flavored 404 surface to `packages/templates/docs/` and
mirrored it into `apps/docs/`. The implementation introduces a default
`pages/404.astro` and a non-default-locale parallel
`pages/[lang]/404.astro` (with a `getStaticPaths` that returns one
entry per locale minus the default — i.e. dormant under the shipped
single-locale config). Both pages set `Astro.response.status = 404`
and render `BaseLayout` chrome around a new `NotFoundHero.astro` that
exposes a back-to-home link plus a "Search the docs" affordance which
opens the existing `docs/SearchBox.astro` dialog. The i18n bundles
gained one new key (`errors.404.search`) and stayed key-parallel
between `en` / `es` and between template / apps-mirror.

## Deviation from design.md

The design's "New signatures" block imports `Text`/`Button`/`Link`
atoms from `@/components/ui/*`. The docs template does **not** ship
`src/components/ui/` (that directory only exists in `apps/docs/`,
where it backs the registry showcase pages). To keep template and
mirror file-for-file identical and to match the docs-template's
existing convention (see `components/docs/PrevNext.astro` —
native HTML + scoped `<style>`), `NotFoundHero.astro` is implemented
with native HTML elements (`<a>` / `<button>` / `<span>` / `<h1>` /
`<p>`) and a scoped `<style>` block that flows colors through design
tokens (`--color-fg`, `--color-fg-muted`, `--color-bg`,
`--color-surface`, `--color-border`, `--color-border-strong`,
`--radius`, `--font-mono`, `--ease-out-soft`). No raw zinc / hex
literals were introduced. This satisfies S6 / templates-css-tokens
I1 + I4 without requiring a `ui/` subtree in the template.

The design.md also gained a parseable `- audit: …` list at the bottom
of "Invariants this change touches" so `pnpm audit:invariants` can
dispatch the per-invariant scripts (mirrors the convention used by
`restructure-starter-template-component-o`'s design.md).

## Traceability

### Scenarios

| Scenario                                                          | Verified by                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **S1** Default-locale 404 renders inside `BaseLayout`             | Built docs template; `packages/templates/docs/dist/404.html` exists, contains the `BaseLayout` head (`noindex`, `application/ld+json`, anti-flash theme script) and `<h1>Page not found</h1>`. `pages/404.astro:1` sets `Astro.response.status = 404`.                                                                               |
| **S2** Non-default-locale 404 routes through `[lang]/404.astro`   | With `siteConfig.locales = ['en','es']` (temporarily), `pnpm build` emitted `dist/es/404/index.html` containing `<html lang="es">`, "Página no encontrada", "Volver al inicio", "Buscar en la documentación", and exactly one `application/ld+json` block. The temporary config change was reverted before commit.                   |
| **S3** 404 status code is set in the frontmatter                  | `pages/404.astro:7` and `pages/[lang]/404.astro:12` both call `Astro.response.status = 404;` (after imports, per ESM rules — TS/ESM imports are hoisted, so this statement is the first non-import expression to execute at runtime, exactly as the proposal's wording intends).                                                     |
| **S4** Back-to-home is locale-aware                               | `NotFoundHero.astro:9` uses `getRelativeLocaleUrl(locale, '/')`; `node scripts/audit/internal-links-localized.mjs` reports zero hits in the new files (the only pre-existing failure is `SidebarNav.astro:64`, unchanged by this PR).                                                                                                |
| **S5** Search affordance reuses the existing SearchBox dialog     | `NotFoundHero.astro` mounts `<SearchBox />` at the section bottom; the secondary button calls `document.getElementById('search-dialog').showModal()` via a small inline `<script>`. SearchBox's own inline trigger is hidden via `.not-found :global(.search-box) { display: none; }` so the button row stays the single affordance. |
| **S6** Component uses design tokens only                          | `NotFoundHero.astro` scoped `<style>` block references only `--color-*`, `--radius`, `--font-mono`, `--ease-out-soft`. `node scripts/audit/tokens-only.mjs` reports zero hits in the new file (pre-existing site.ts hex literals are not in scope).                                                                                  |
| **S7** Layout-emitted `@graph` stays the only JSON-LD on the page | Built `dist/404.html` and `dist/es/404/index.html` each contain exactly one `<script type="application/ld+json">` block. `node scripts/audit/jsonld-graph.mjs` and `--strict` and `--typed` all pass.                                                                                                                                |
| **S8** i18n bundles stay key-parallel                             | Node structural diff (en vs. es) on both template and apps/docs returns `[]` for both directions.                                                                                                                                                                                                                                    |
| **S9** apps/docs mirror is updated in lockstep                    | `apps/docs/src/components/not-found/NotFoundHero.astro`, `apps/docs/src/pages/404.astro`, `apps/docs/src/pages/[lang]/404.astro`, and the i18n key additions are byte-identical copies of the template files.                                                                                                                        |
| **S10** No new runtime dependency                                 | `git diff main -- packages/templates/docs/package.json apps/docs/package.json` returns empty.                                                                                                                                                                                                                                        |
| **S11** Perf budget holds on the 404 surface                      | Lighthouse runner under `scripts/perf/run.mjs` is not yet wired to a preview server (the script self-reports `not yet wired to a preview server target; see AGENTS.md step 6`). The `--deps` check passes: starter = 12 runtime deps, docs = 8 (both unchanged). Lighthouse-budget verification is deferred to the reviewer.         |

### Invariants

| Invariant                                          | Audit                                             | Result                                                                                                           |
| -------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **templates-i18n I1** parallel routes              | `node scripts/audit/i18n-parallels.mjs`           | ✅ PASS                                                                                                          |
| **templates-i18n I2** `getStaticPaths` strict      | `node scripts/audit/i18n-parallels.mjs --strict`  | ✅ PASS                                                                                                          |
| **templates-i18n I5** localized internal links     | `node scripts/audit/internal-links-localized.mjs` | ⚠️ pre-existing failure in `SidebarNav.astro:64` (unchanged); new files clean                                    |
| **templates-css-tokens I1** no raw zinc / hex      | `node scripts/audit/tokens-only.mjs`              | ⚠️ pre-existing failures in `packages/templates/{docs,starter}/src/config/site.ts` `themeColor`; new files clean |
| **templates-css-tokens I4** layered scoped styles  | `node scripts/audit/tokens-only.mjs --layered`    | ⚠️ same two pre-existing site.ts hits; new files clean                                                           |
| **templates-seo-jsonld I1** layout emits `@graph`  | `node scripts/audit/jsonld-graph.mjs`             | ✅ PASS                                                                                                          |
| **templates-seo-jsonld I2** no standalone JSON-LD  | `node scripts/audit/jsonld-graph.mjs --strict`    | ✅ PASS                                                                                                          |
| **templates-seo-jsonld I3** schema-dts typed nodes | `node scripts/audit/jsonld-graph.mjs --typed`     | ✅ PASS                                                                                                          |

The two ⚠️ audits flag files that this change did **not** touch:

- `packages/templates/docs/src/components/docs/SidebarNav.astro:64` — `<Brand href="/" …>` (pre-existing in `main`).
- `packages/templates/docs/src/config/site.ts:68` and `packages/templates/starter/src/config/site.ts:107` — `themeColor: '#…'` (pre-existing in `main`).

Reverting these requires edits outside this change's "Files touched" list and outside the scope declared in the proposal. Recommend filing separate features for each.

## Commits

- `97ebb84` feat(templates/docs,apps/docs): add errors.404.search i18n key (T1, T5)
- `e67d6cd` feat(templates/docs,apps/docs): add NotFoundHero 404 surface (T2, T6)
- `5cce4d4` feat(templates/docs,apps/docs): add 404 pages with i18n locale parallel (T3, T4, T7, T8)
- close-out (pending): tasks.md ticks, design.md audit-commands list, impl.md, audit.md, perf.md (committed without `--design` since these run-records sit outside "Files touched")

## Manual smoke (T14)

`pnpm dev` smoke could not be exercised in the headless implementer
session, but the production build path was exercised twice:

1. Default config (`locales = ['en']`) → `dist/404.html` only (verified above).
2. Bilingual config (`locales = ['en','es']`, temporarily) → `dist/404.html` **and** `dist/es/404/index.html` both emitted with correct localized strings and one `@graph` script each. Config reverted before commit.

The reviewer is invited to walk through `pnpm dev:docs-template` and click through `/does-not-exist` to confirm chrome behaviour interactively.

## Open questions for the reviewer

1. The two ⚠️ pre-existing audit failures (above) — should they be folded into this change's scope, or filed as separate spec-author tickets? They are unrelated to the 404 work.
2. `scripts/perf/run.mjs` Lighthouse runner is a known-placeholder (line 74). The reviewer's perf-budget tier currently can only verify `--deps`. Confirming whether that is acceptable to close this change is a meta-question about the harness, not the change.
