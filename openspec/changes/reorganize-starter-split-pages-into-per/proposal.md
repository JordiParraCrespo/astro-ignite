# Proposal: reorganize-starter-split-pages-into-per

## Why

`packages/templates/starter/` is the canonical scaffold output. Today
five of its pages mix two responsibilities in a single `.astro` file:

1. Page-level concerns (layout choice, i18n setup, JSON-LD assembly,
   `getStaticPaths` for `[lang]/` parallels).
2. Visual section markup + scoped `<style>` blocks for a hero / page
   header / list / form.

The mixing has three concrete costs:

- **Pages don't read as a page.** `src/pages/index.astro` is 88 lines:
  ~50 of those are an inline features-grid section. A reader has to scan
  past markup to find that the page is "Hero + Features".
- **Default-locale and `[lang]/` parallels duplicate the section
  markup.** `index.astro` and `[lang]/index.astro` are byte-identical
  below the frontmatter; same for about/contact/blog/projects. Any visual
  edit has to be applied twice and can drift.
- **Users who scaffold the template and want to swap a section (drop
  Features, replace it with Pricing) have to surgically edit Astro
  expressions inside a long page file.** A `<FeaturesGrid />` import is
  a one-line swap.

The fix is structural, not behavioural: extract each visual section into
its own `.astro` file under `src/components/sections/`, then reduce each
page to its frontmatter (layout, i18n, schemas, data) plus a short list
of `<Section />` imports inside the layout. The default-locale page and
its `[lang]/` parallel import the same section components.

## Scope

In scope (only `packages/templates/starter/`):

- Pages refactored to composition-only:
  - `src/pages/index.astro` + `src/pages/[lang]/index.astro`
  - `src/pages/about.astro` + `src/pages/[lang]/about.astro`
  - `src/pages/contact.astro` + `src/pages/[lang]/contact.astro`
  - `src/pages/blog/index.astro` + `src/pages/[lang]/blog/index.astro`
  - `src/pages/projects/index.astro` + `src/pages/[lang]/projects/index.astro`
  - `src/pages/404.astro`
- New section components under
  `src/components/sections/<page>/<Section>.astro` (or a flat
  `src/components/sections/`; design.md picks one) covering:
  - Landing features grid (currently inline in `index.astro`)
  - About body (page header + prose)
  - Contact form (page header + form markup, success/error alerts)
  - Blog index list (page header + post grid)
  - Projects index list (page header + project grid)
  - 404 hero
- Each section owns the scoped `<style>` block that used to live on the
  page.

Out of scope:

- `apps/site/` and `apps/docs/` — the issue explicitly excludes them.
  These are scaffolded mirrors; updating them is a separate change.
- Other templates (`packages/templates/docs/`).
- `src/pages/blog/[...slug].astro`, `src/pages/projects/[...slug].astro`,
  `src/pages/legal/[...slug].astro` — already composition-only (each
  is `<Layout><Content /></Layout>` plus `getStaticPaths`).
- `src/pages/rss.xml.ts`, `src/pages/robots.txt.ts`,
  `src/pages/[lang]/rss.xml.ts` — endpoints, no visual sections.
- Header/footer/chrome components (`Nav.astro`, `Footer.astro`,
  `CookieBanner.astro`, `Analytics.astro`, `LocaleSwitcher.astro`,
  `ThemeToggle.astro`, `Brand.astro`, `Hero.astro`). The existing
  `Hero.astro` reusable atom is kept as-is; new section components
  compose it where applicable.
- Introducing a new chrome layout. `BaseLayout`/`ArticleLayout`/
  `LegalLayout` are untouched.
- Adding a shared `PageHeader.astro` extraction. The about/contact/
  blog/projects page-header markup (h1 + lede) repeats four times; an
  implementer may add `src/components/sections/PageHeader.astro` if they
  judge it cleaner, but it is optional — see design.md "Rejected
  alternative" for why the spec does not mandate it.
- The existing `src/components/blocks/not-found-state.astro` file. The
  404 section may consume it, replace it, or sit beside it — the
  implementer chooses, design.md captures the call.

## Scenarios

### S1 — Every refactored page is composition-only

- **GIVEN** the post-change tree
- **WHEN** each file listed in design.md's "Files touched" `MOD pages`
  set is read
- **THEN** the page's template body (between `---` and end-of-file)
  contains only: a single root `<BaseLayout …>` element (or analogous
  layout wrapper), zero or more `<SectionComponentName />` element
  invocations, and at most JSX expressions for data already prepared in
  the frontmatter. There is no inline `<section>`, `<form>`, `<article
class="page">`, or grid/list markup; there is no scoped `<style>`
  block inside the page file.

### S2 — One section per file, under `src/components/sections/`

- **GIVEN** the post-change tree
- **WHEN** the new section component files are listed
- **THEN** each visual section enumerated in the proposal (landing
  features grid, about body, contact form, blog index list, projects
  index list, 404 hero) is exactly one `.astro` file under
  `packages/templates/starter/src/components/sections/` (or a designated
  per-page subfolder under `sections/`), and no two of those sections
  share a file.

### S3 — Default-locale page and `[lang]/` parallel import the same sections

- **GIVEN** the post-change tree
- **WHEN** for every page that has both `src/pages/<foo>.astro` and
  `src/pages/[lang]/<foo>.astro`, the set of section-component imports
  in each file is compared
- **THEN** the two sets are equal; neither page has an inline
  section-shaped subtree that the other delegates to a component.

### S4 — Scoped `<style>` blocks move with the section

- **GIVEN** the post-change tree
- **WHEN** the new section components are inspected
- **THEN** every scoped `<style>` block that previously lived in a page
  file now lives inside the section component that renders the styled
  markup, the layered-CSS strategy (above-the-fold scoped, below-the-fold
  Tailwind) is preserved, and no raw zinc (`bg-zinc-*`, `text-zinc-*`)
  or hex literal (`#0a0a0a`, etc.) is introduced in any new file.

### S5 — JSON-LD assembly stays at the page level

- **GIVEN** the post-change tree
- **WHEN** every section component file is inspected
- **THEN** no section component emits its own
  `<script type="application/ld+json">` tag and no section component
  assembles `schemas={…}` props. Per-page schema arrays continue to be
  built in the page frontmatter and passed to `BaseLayout`'s `schemas`
  prop (as today). The single `@graph` invariant of
  `templates-seo-jsonld` is upheld.

### S6 — No new runtime dependencies

- **GIVEN** the post-change tree
- **WHEN** `packages/templates/starter/package.json` is diffed against
  `main`
- **THEN** no entry is added to `dependencies`; entries may only be
  removed (none are expected). `devDependencies` may be unchanged or
  reduced, never expanded with a new runtime concern.

### S7 — Typecheck and audits stay green

- **GIVEN** the post-change tree
- **WHEN** `pnpm typecheck` and
  `pnpm audit:invariants --change reorganize-starter-split-pages-into-per`
  run from the repo root
- **THEN** both exit 0. The audits exercised include
  `i18n-parallels.mjs`, `internal-links-localized.mjs`, `tokens-only.mjs`
  (with `--layered`), and `jsonld-graph.mjs --strict`.

### S8 — Scaffold smoke test still passes

- **GIVEN** the post-change tree
- **WHEN** `pnpm scaffold:test` runs (CLI scaffolds the starter into
  `apps/playground/`, installs, builds, Lighthouses)
- **THEN** it exits 0. The scaffolded site renders the same set of
  routes (`/`, `/about`, `/contact`, `/blog`, `/projects`, `/404`,
  default-locale only since `siteConfig.locales = ['en']`).

### S9 — Lighthouse budget not regressed

- **GIVEN** the post-change tree
- **WHEN** `pnpm perf:budget` runs against the starter
- **THEN** Performance, Accessibility, Best Practices, and SEO are each
  ≥ 95 on the budgeted pages (`/`, `/blog`, plus the inner-page
  selection in `scripts/perf/run.mjs`); LCP, INP, CLS, TBT, and total
  compressed transfer for `/` stay within the `templates-perf` budget.
  Reference baseline is captured under
  `runs/<ts>/perf.txt` for the implementer-run.

### S10 — Boundary held: only `packages/templates/starter/` changes

- **GIVEN** the post-change tree
- **WHEN** `git diff --name-only main` is filtered against
  `apps/site/`, `apps/docs/`, `apps/playground/` (unless regenerated by
  `scripts/scaffold-test.mjs`), `packages/templates/docs/`,
  `packages/registry/`, and `packages/create-astro-ignite/`
- **THEN** no files outside `packages/templates/starter/`,
  `openspec/changes/reorganize-starter-split-pages-into-per/`, and
  `.changeset/` are listed. (The CI-regenerated playground is permitted
  to diff if `pnpm scaffold:test` was run; it is not a source edit.)
