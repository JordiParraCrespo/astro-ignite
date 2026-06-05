# Proposal: docs-match-starter-perf-sitemap-config

## Why

`packages/templates/docs/astro.config.mjs` is missing two
production-grade defaults that the starter template (`packages/templates/starter/astro.config.mjs`)
already ships:

1. **`build.inlineStylesheets: 'always'`** — the starter inlines every
   stylesheet directly into the emitted HTML so the first paint never
   waits on a CSS round-trip. The justification recorded in the
   starter config (`packages/templates/starter/astro.config.mjs:18–22`)
   applies verbatim to a docs site:

   > "The largest bundle is ~25 KB (blog post route, Tailwind + tokens)
   > — that adds ~25 KB to the HTML per page, but eliminates one
   > render-blocking request and is a clear Speed-Index / FCP win for
   > a content-light site."

   Docs pages are content-light, Tailwind-heavy, and FCP-sensitive —
   the same trade-off lands on the right side of the budget. Today the
   docs template defaults to Astro's `inlineStylesheets: 'auto'`, which
   only inlines stylesheets below the size threshold and leaves the
   larger bundles as separate `<link rel="stylesheet">` requests.

2. **A sitemap `serialize` callback with per-page priorities.** The
   starter post-processes its sitemap to give the landing page
   `priority: 1.0`, demote `/legal/*` to `0.3`, and default the rest
   to `0.7` with `changefreq: 'weekly'`. The docs sitemap today is
   flat (sitemap defaults: `priority: 0.5` everywhere, `changefreq:
'weekly'` only because we already pass it). The flat sitemap under-
   signals the landing page (which is the canonical entry point) and
   over-signals legal templates (which are noindex-eligible boilerplate
   and shouldn't outrank guide pages).

The docs template is the second shipped template; agents using it via
`pnpm create astro-ignite` get a worse default than starter users for
no design reason — the divergence is leftover, not deliberate. This
change brings the two templates to parity on the production-grade
build + SEO config, mirrors the same changes into the manually-
maintained `apps/docs/` sibling, and records the parity rule in the
relevant capability specs so future templates don't drift again.

The change is config-only: no new components, no new dependencies, no
new client JS, no markup changes. The diff is roughly six lines per
config file, three files touched (`packages/templates/docs/astro.config.mjs`,
`apps/docs/astro.config.mjs`, and a changeset note).

## Scope

In scope:

- **Edit `packages/templates/docs/astro.config.mjs`** to:
  - Set `build.inlineStylesheets: 'always'` (currently `build` only
    has `format: 'directory'`).
  - Add `priority: 0.7` and a `serialize(item)` callback to the
    `sitemap()` integration that lifts `pathname === '/'` to `1.0`
    and demotes any URL containing `/legal/` to `0.3`. Preserve the
    existing `filter` (excluding `/og/` and `/api/`), `changefreq`,
    and `i18n` config exactly as they are today.
- **Mirror the same edits to `apps/docs/astro.config.mjs`.** Per the
  `apps/docs/` boundary (`apps/docs/CLAUDE.md`: "Mirror, not source.
  Bug fixes go to `packages/templates/docs/` first; mirror here in the
  same PR."), the app sibling must move in lockstep.
- **Add a changeset** at `.changeset/docs-perf-sitemap-defaults.md`
  recording the docs-template configuration parity as a minor bump for
  end users who scaffolded earlier. The change is opt-in for them via
  manual mirror; existing scaffolded sites are not affected unless the
  user copies the new config.
- **Update the change-folder spec deltas** under
  `openspec/changes/docs-match-starter-perf-sitemap-config/specs/<capability>/spec.md`
  for `templates-perf` (new "all templates ship inline-stylesheets-
  always parity" requirement) and `templates-seo-jsonld` (new
  "sitemap priority signals" requirement that broadens the capability
  to cover sitemap defaults, not just JSON-LD).

Out of scope (called out explicitly so the implementer does not
expand):

- **Migrating the docs template to Tailwind v4** — issue #38. Already
  tracked separately; the inline-stylesheet flag is independent.
- **Per-content-type `changefreq`** (e.g. `monthly` for legal,
  `daily` for guides). The issue body asks us to "stay coarse for
  now"; the `changefreq` stays at the default `weekly`.
- **Splitting the sitemap into per-locale indexes.** The existing
  `i18n` block on the `sitemap()` integration already emits `hreflang`
  annotations, which is the documented goal. The issue body confirms
  this is out of scope.
- **Backfilling the same `serialize` callback into a third template**
  (none exists yet besides starter and docs).
- **Tuning priorities beyond `/` = 1.0 and `/legal/*` = 0.3 plus the
  default `0.7`.** The issue mentions optionally bumping docs section
  pages to `0.8` and deep sub-pages to `0.6`; the issue body marks
  this as optional and recommends "a conservative first pass". We
  ship the conservative first pass to match starter behaviour exactly.
- **Auditing or refactoring `siteConfig.homePath`** — the docs `/`
  entry that we lift to `1.0` is rendered by
  `packages/templates/docs/src/pages/index.astro`, which renders the
  `siteConfig.homePath` doc inline (no HTTP redirect). The sitemap
  emits `/` as a real URL; the priority bump applies directly.

## Scenarios

### S1 — Docs template config sets `inlineStylesheets: 'always'`

- **GIVEN** the post-change tree
- **WHEN** `packages/templates/docs/astro.config.mjs` is read
- **THEN** the `defineConfig({ … })` `build` block contains
  `inlineStylesheets: 'always'` (verbatim string literal `'always'`,
  not `'auto'` or omitted), alongside the existing `format:
'directory'`.

### S2 — Docs template sitemap declares default + per-path priorities

- **GIVEN** the post-change tree
- **WHEN** `packages/templates/docs/astro.config.mjs` is read
- **THEN** the `sitemap({ … })` call passed to `integrations`
  contains:
  - `priority: 0.7` as the default,
  - `changefreq: 'weekly'` (preserved),
  - a `serialize(item)` function that: - parses `new URL(item.url).pathname` and sets `item.priority =
1.0` when it equals `'/'`, - sets `item.priority = 0.3` when `item.url.includes('/legal/')`, - returns the `item`.
  - The existing `filter: (page) => !page.includes('/og/') && !page.includes('/api/')`
    and the `i18n: { defaultLocale, locales }` block are preserved.

### S3 — `apps/docs/` mirrors the same config

- **GIVEN** the post-change tree
- **WHEN** `apps/docs/astro.config.mjs` is read
- **THEN** the `build.inlineStylesheets`, sitemap default `priority`,
  `changefreq`, and `serialize` callback are byte-equivalent to the
  template's. The two files differ only in the existing site/adapter
  surface that already diverges (none today; if the docs app later
  adds an adapter, that line is exempt).

### S4 — Built HTML inlines all first-party CSS

- **GIVEN** the post-change tree
- **WHEN** `pnpm --filter @astro-ignite/template-docs build` runs and
  the contents of every `dist/**/*.html` file are inspected
- **THEN** each page contains at least one inline `<style>` block
  carrying the page CSS, and contains **zero** `<link rel="stylesheet"
href="/_astro/*.css">` tags for first-party bundles. (Astro-emitted
  preload `<link>` hints for fonts are unaffected; only the
  stylesheet-link form is forbidden.)

### S5 — Generated sitemap reflects the priority signals

- **GIVEN** the post-change tree
- **WHEN** `pnpm --filter @astro-ignite/template-docs build` runs and
  `dist/sitemap-0.xml` is parsed
- **THEN** the XML contains:
  - exactly one `<url>` entry with `<loc>` equal to `<siteUrl>/` (the
    docs landing) and `<priority>1.0</priority>`,
  - one or more `<url>` entries whose `<loc>` contains `/legal/` and
    every such entry has `<priority>0.3</priority>`,
  - at least one `<url>` entry for a guide page (e.g. `/quick-start`
    or `/introduction`) with `<priority>0.7</priority>`.

### S6 — `apps/docs/` build produces the same inline-CSS + sitemap shape

- **GIVEN** the post-change tree
- **WHEN** `pnpm --filter @astro-ignite/docs build` runs
- **THEN** every emitted HTML page contains an inline `<style>` block
  and no first-party stylesheet `<link>`, and `dist/sitemap-0.xml`
  carries the same priority pattern as S5 against the apps/docs route
  set.

### S7 — No runtime dependencies added

- **GIVEN** the post-change tree
- **WHEN** `packages/templates/docs/package.json` and
  `apps/docs/package.json` are diffed against `main`
- **THEN** no entry is added to either `dependencies` or
  `peerDependencies` block. The change is config-only.

### S8 — Format / typecheck / test / audit / scaffold pass

- **GIVEN** the post-change tree
- **WHEN** `pnpm format:check`, `pnpm typecheck`, `pnpm test`,
  `pnpm audit:invariants --change docs-match-starter-perf-sitemap-config`,
  and `pnpm scaffold:test` run from the repo root
- **THEN** each exits 0. The dispatched audits include
  `tokens-only.mjs` and `tokens-only.mjs --layered` (unchanged), the
  perf gates (`scripts/perf/run.mjs --critical-css`, `--deps`,
  `--transfer`, `--page /`, `--page /quick-start`), and the new
  per-capability requirement checks introduced by the deltas below.

### S9 — Perf budget holds (and ideally improves) on the docs landing

- **GIVEN** the post-change tree
- **WHEN** `pnpm perf:budget` runs against the docs template / app
- **THEN** Performance, Accessibility, Best Practices, and SEO are
  each ≥ 95 on `/` and one inner page; LCP ≤ 2.0 s, INP ≤ 200 ms,
  CLS ≤ 0.05, TBT ≤ 200 ms, total compressed transfer on `/` ≤ 150
  KB. The implementer captures the report under
  `openspec/changes/docs-match-starter-perf-sitemap-config/runs/<ts>/perf.txt`
  and confirms FCP / Speed Index do not regress versus the previous
  recorded baseline (and ideally improve).

### S10 — Changeset documents the docs-template parity bump

- **GIVEN** the post-change tree
- **WHEN** `.changeset/` is listed
- **THEN** a new changeset file describes the docs template
  configuration parity (inline-stylesheets-always + sitemap priority
  defaults), notes it as a minor bump for end users who want to mirror
  it back to an existing scaffolded site, and bumps `astro-ignite` and
  `create-astro-ignite` (or whichever workspace packages the
  changeset convention requires) accordingly.
