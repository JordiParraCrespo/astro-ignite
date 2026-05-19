# Design: docs-match-starter-perf-sitemap-config

## Files touched

### `packages/templates/docs/` — the docs template (source of truth)

- MOD `packages/templates/docs/astro.config.mjs` — add
  `build.inlineStylesheets: 'always'` to the `build` block; extend
  the `sitemap({ … })` integration call with `priority: 0.7` and a
  `serialize(item)` callback that lifts `pathname === '/'` to `1.0`
  and demotes `item.url.includes('/legal/')` to `0.3`. Preserve the
  existing `filter`, `changefreq: 'weekly'`, and `i18n` block.

### `apps/docs/` — docs site (manual mirror of the docs template)

- MOD `apps/docs/astro.config.mjs` — apply the same `build` and
  `sitemap` edits as the template, byte-equivalent. Per
  `apps/docs/CLAUDE.md` the app is a manual mirror; this change moves
  the two files together.

### `scripts/audit/` — sitemap + inline-stylesheets assertion

- NEW `scripts/audit/sitemap-priority.mjs` — small grep that asserts
  every `packages/templates/<kind>/astro.config.mjs` ships
  `inlineStylesheets: 'always'` and (when the file registers
  `sitemap()`) a default `priority:` literal plus the
  `serialize(item)` callback with the documented landing / `/legal/`
  branches. Registered in `scripts/doctor/audits-present.mjs` so the
  doctor check knows the file is required.
- MOD `scripts/doctor/audits-present.mjs` — add the new audit script
  to the doctor's required-scripts list so its absence is caught by
  `pnpm doctor`.

### Documentation + changeset

- NEW `.changeset/docs-perf-sitemap-defaults.md` — per the harness
  rule `require_changeset_to_close`. Body summarises the docs-template
  configuration parity with starter (inline-stylesheets-always +
  sitemap priority defaults), notes it as a minor bump for users
  mirroring back to a previously-scaffolded docs site, and bumps the
  workspace packages per the existing changeset convention (`astro-
ignite` and `create-astro-ignite` minor).

### Spec / change-dir artifacts

- MOD `openspec/changes/docs-match-starter-perf-sitemap-config/`
  (covers `tasks.md` checkbox flips, this `design.md` itself as it
  evolves during implementation, the spec deltas under
  `specs/templates-perf/spec.md` and `specs/templates-seo-jsonld/spec.md`,
  and the run-directory artifacts `runs/<ts>/{impl,audit,perf,review,notes}.md`
  / `perf.txt`).
- MOD `openspec/progress/current.md` — the implementer protocol
  requires noting feature / run state in this file at the start of
  the session and refreshing it as the run progresses.

## New signatures

This change is config-only — no new functions, no new component props,
no new helper APIs.

The shape of the additions in each `astro.config.mjs` is the same
literal block:

```js
build: {
  format: 'directory',
  // Inline ALL stylesheets so the first paint never waits on a CSS round-trip.
  // The largest bundle on a docs route is well under starter's ~25 KB blog-post
  // bundle (Tailwind + tokens only, no MDX-heavy components), and the FCP /
  // Speed-Index win on a content-light docs site mirrors the starter rationale.
  inlineStylesheets: 'always',
},
// inside the sitemap({ … }) call passed to integrations:
sitemap({
  // existing i18n + filter + changefreq preserved
  changefreq: 'weekly',
  priority: 0.7,
  serialize(item) {
    if (new URL(item.url).pathname === '/') item.priority = 1.0;
    if (item.url.includes('/legal/')) item.priority = 0.3;
    return item;
  },
}),
```

The `serialize` function uses the same `new URL(item.url).pathname`
parse for `/` (precise match — avoids matching `/intro/`) and the
cheaper `item.url.includes('/legal/')` substring check for the legal
prefix (mirrors the starter byte-for-byte so the two configs stay
diffable).

## Composition shape (illustrative)

After the change, `packages/templates/docs/astro.config.mjs` looks
like:

```js
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

import { siteConfig } from './src/config/site.ts';

export default defineConfig({
  site: siteConfig.url,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  i18n: {
    defaultLocale: siteConfig.defaultLocale,
    locales: siteConfig.locales,
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: siteConfig.defaultLocale,
        locales: Object.fromEntries(
          siteConfig.locales.map((l) => [l, siteConfig.hreflang[l] ?? l])
        ),
      },
      filter: (page) => !page.includes('/og/') && !page.includes('/api/'),
      changefreq: 'weekly',
      priority: 0.7,
      serialize(item) {
        if (new URL(item.url).pathname === '/') item.priority = 1.0;
        if (item.url.includes('/legal/')) item.priority = 0.3;
        return item;
      },
    }),
  ],
  vite: {
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
```

`apps/docs/astro.config.mjs` ends up byte-equivalent in the `build`
and `sitemap` sections.

## Invariants this change touches

### `templates-perf`

- **I1 (Lighthouse mobile budget met on home page)** — must stay ≥ 95
  on `/`. `inlineStylesheets: 'always'` trades an extra ~10–25 KB of
  HTML for the elimination of one render-blocking stylesheet request.
  On a docs landing the bundle is well under starter's ~25 KB blog-
  post upper bound. The change is a clear FCP / Speed Index win for a
  content-light docs site; the implementer captures before/after
  numbers in `runs/<ts>/perf.txt` to confirm.
- **I2 (Lighthouse mobile budget met on one inner page)** — same
  reasoning applies to `/quick-start` or `/introduction`.
- **I3 (total transfer ≤ 150 KB compressed home)** — the inlined
  stylesheets shift bytes from a separate `*.css` response into the
  HTML response. Total compressed transfer is dominated by the same
  CSS+HTML payload; with brotli/gzip the inlined form is typically
  within a few KB of the linked form. The implementer verifies via
  `node scripts/perf/run.mjs --transfer` on the docs landing.
- **I4 (critical CSS inlined / Beasties output present)** — the
  audit at `scripts/perf/run.mjs --critical-css` checks for an
  inlined `<style>` block in the emitted HTML. With
  `inlineStylesheets: 'always'`, this requirement is satisfied
  trivially on every page, not just the routes Beasties chose to
  process. The audit therefore stays green and gets stricter in
  practice.
- **I5 (no undeclared runtime dep added)** — explicitly forbidden by
  scenario S7; the implementer adds no entries to any `dependencies`
  block.

Audit: `node scripts/perf/run.mjs --page /`,
`node scripts/perf/run.mjs --page /quick-start`,
`node scripts/perf/run.mjs --transfer`,
`node scripts/perf/run.mjs --critical-css`,
`node scripts/perf/run.mjs --deps`. Invoked via
`pnpm audit:invariants --change docs-match-starter-perf-sitemap-config`
and `pnpm perf:budget`.

### `templates-seo-jsonld`

- **I1, I2, I3** — preserved by construction. The `@graph` JSON-LD
  emission is unchanged; the sitemap is a separate SEO surface that
  does not touch the layout's `<script type="application/ld+json">`
  block.

The sitemap-priority requirement is **new** for this capability. It
is added via the `ADDED Requirements` delta in
`openspec/changes/docs-match-starter-perf-sitemap-config/specs/templates-seo-jsonld/spec.md`.
The delta broadens the capability's scope from "JSON-LD `@graph`
only" to "machine-readable SEO signals — JSON-LD `@graph` plus
sitemap priority defaults". The boundary statement in the long-lived
spec is preserved verbatim; the delta documents the broadening so
future spec readers do not have to guess.

Audit: a new check is wired through `scripts/audit/run-all.mjs --change`
that, when the change capability list includes `templates-seo-jsonld`
and the change touches an `astro.config.mjs`, verifies the `sitemap()`
call contains a `serialize` function and a default `priority` literal.
The check is implemented as a small grep in `_lib.mjs` style (no new
audit script file; the existing `jsonld-graph.mjs` is the closest
neighbour but the new check is sitemap-specific and lives separately
to keep `jsonld-graph.mjs` narrowly typed). Concretely the
implementer adds a tiny helper invocation invoked from
`audit:invariants` via the change-dispatch mapping. The audit asserts
the literal patterns documented in the spec delta.

Audit command summary (parseable by `scripts/audit/run-all.mjs --change`):

- audit: `node scripts/perf/run.mjs --critical-css`
- audit: `node scripts/perf/run.mjs --deps`
- audit: `node scripts/perf/run.mjs --transfer`
- audit: `node scripts/perf/run.mjs --page /`
- audit: `node scripts/perf/run.mjs --page /quick-start`
- audit: `node scripts/audit/jsonld-graph.mjs --strict --typed`
- audit: `node scripts/audit/tokens-only.mjs --layered`
- audit: `node scripts/audit/sitemap-priority.mjs`

The sitemap-priority assertion is captured by the spec delta as a
testable requirement; the implementer wires it into the change
dispatch (either as a new tiny script under `scripts/audit/` or as
an inline check inside the change's `runs/<ts>/audit.md`). The
reviewer accepts either, provided the assertion runs in CI via
`pnpm audit:invariants --change …`.

## Performance budget applicability

The change's capabilities match `/^templates-/`, so the harness rule
`require_perf_budget_to_close_when` applies.

Expected impact (relative to current docs-template baseline):

- **CSS round-trips on first paint:** one fewer per page. With
  `inlineStylesheets: 'always'`, the docs landing no longer issues a
  blocking `<link rel="stylesheet">` for the first-party bundle.
- **First Contentful Paint / Speed Index:** small improvement on
  simulated 4G slow CPU — the round-trip saved is in the critical
  rendering path.
- **Largest Contentful Paint:** unchanged or slightly improved
  (docs LCP is the H1 above the fold, which now paints with no CSS
  wait).
- **Total compressed transfer on `/`:** approximately equal — the
  bytes move from a separate CSS response into the HTML response;
  with brotli the inlined form is typically within a few KB of the
  linked form. The implementer verifies via `--transfer`.
- **JS bundle / dependencies:** unchanged.
- **Sitemap:** an additional `<priority>` element per `<url>` entry
  (negligible bytes).

Risk areas the implementer must verify in the perf run:

- **Total transfer on `/`** — capture compressed bytes via
  `node scripts/perf/run.mjs --transfer`; confirm ≤ 150 KB.
- **LCP on `/`** — confirm ≤ 2.0 s on simulated 4G slow CPU.
- **One inner page (`/quick-start`)** — same checks.
- **`apps/docs/`** — re-run the same `--page /` against the app
  build to confirm the mirror is in sync.

If perf regresses anywhere, the change is rejected; the implementer
investigates the regression rather than tuning the budget.

## Rejected alternative — leave the docs template on `inlineStylesheets: 'auto'`

`'auto'` is Astro's default and inlines only stylesheets below a size
threshold (typically ~4 KB). The argument for keeping it is that
small CSS bundles are cheap to fetch in parallel and inlining a large
bundle into every HTML page can balloon total transfer for
multi-page crawls.

Rejected because:

1. The docs template ships content-light Tailwind-only routes; the
   per-route CSS bundle is well under starter's ~25 KB upper bound.
   The same trade-off the starter explicitly accepted (one fewer
   render-blocking request per page > a few KB of HTML duplication
   per page) lands the same way on a docs site.
2. The issue body cites the starter rationale verbatim and asks for
   parity. Faithfully applying the issue's intent matters more than
   re-litigating the trade-off here.
3. Brotli compression on the HTML response largely reabsorbs the
   duplicated CSS bytes across pages; the practical transfer cost is
   small.
4. The audit at `scripts/perf/run.mjs --critical-css` becomes
   trivially green on every route, not only the routes Beasties
   chose to process. This is strictly stricter, which the spec
   delta records.

## Rejected alternative — also tune `changefreq` per content type

The issue body lists "Tweaking changefreq per content type (e.g.
`monthly` for legal)" as out of scope. We honour that — the
`changefreq` stays at the default `'weekly'` for every entry. A
follow-up issue can refine if the recorded crawl behaviour suggests
benefit.

Reason: introducing a `changefreq` map would expand the surface and
the diff for a marginal SEO signal. Search engines treat
`changefreq` as a hint anyway; the priority signal is the higher-
leverage knob.

## Rejected alternative — bump docs section pages to a higher priority

The issue body raises the option of bumping top-level guide pages to
`priority: 0.8` and deep sub-pages to `0.6`. Rejected for this
change because:

1. The issue body marks it as optional and recommends "a
   conservative first pass (just `/` and `/legal/*`) is fine."
2. The starter's `serialize` callback today does not differentiate
   guide depth. Adding the differentiation here would diverge from
   starter parity, which is the whole point of this change.
3. A follow-up issue can introduce a depth-aware sitemap heuristic
   if we observe under-indexing of deep docs pages in production
   analytics.

## Rejected alternative — refactor the shared sitemap config into a helper

We could factor the `serialize` callback (and the default
`priority`/`changefreq`) into a `packages/registry/lib/sitemap-config.ts`
helper imported by both templates. Rejected because:

1. The astro-ignite "no abstraction before the third copy" rule
   applies: we have starter and docs today; a third template (issue
   #1, `blog-only-template`) is on the backlog but not yet shipped.
   The right time to extract the helper is when the third copy
   arrives.
2. The templates are user-owned after scaffold. Importing the
   helper from a workspace package would either bind the scaffolded
   project to the registry at runtime (forbidden by the architecture
   principle "no runtime dependency on the scaffolder") or require
   the CLI to also copy the helper, doubling the surface of
   `scripts/scaffold.ts` for marginal benefit.
3. The serialize callback is six lines. Duplicating it across two
   configs keeps the configs readable and self-contained.

## Out-of-scope mirroring rules

`apps/docs/` is the manual mirror of `packages/templates/docs/` per
`apps/docs/CLAUDE.md`. No other tree mirrors this template (the
docs template is not regenerated into `apps/playground/`, which is
the starter smoke fixture). If a future scaffolded mirror of the
docs template lands, it picks up the new config automatically when
the CLI regenerates it; existing manually-maintained mirrors are
each contributors' responsibility to update — the changeset notes
this expectation.
