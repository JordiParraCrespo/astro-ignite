# Proposal: restructure-starter-template-component-o

## Why

`packages/templates/starter/src/components/` currently has four
overlapping buckets that have grown without a consistent rule:

- `ui/` — atoms mirrored from `packages/registry/base/` (kebab-case).
- `blocks/` — one file, `not-found-state.astro`, mirrored from the
  registry's not-yet-populated `blocks/` tier.
- `sections/` — per-page compositions added by the
  `reorganize-starter-split-pages-into-per` change (#28):
  `landing/FeaturesGrid.astro`, `about/AboutBody.astro`,
  `contact/ContactSection.astro`, `blog/BlogIndexList.astro`,
  `projects/ProjectsIndexList.astro`, `not-found/NotFoundHero.astro`.
- Loose `*.astro` at the root: `Nav.astro`, `Footer.astro`,
  `Brand.astro`, `ThemeToggle.astro`, `LocaleSwitcher.astro`,
  `CookieBanner.astro`, `Analytics.astro`, plus an `Hero.astro`
  composition atom and `image/`, `seo/` utility subfolders.

Three concrete problems:

1. **"section vs block" has no consistent rule.**
   `blocks/not-found-state.astro` and `sections/not-found/NotFoundHero.astro`
   both render 404 surface — a leftover from the old registry blocks
   tier colliding with the new per-section split. Future contributors
   can't tell where to put a new composition.
2. **Loose root files break the "one rule" principle.**
   Seven chrome components sit flat at the root next to the `ui/`,
   `blocks/`, `sections/` folders. New contributors are forced to learn
   four conventions just to read the tree.
3. **The proposed "starter as showcase" growth (services pages, case
   studies, more marketing surfaces) doesn't scale on the current
   layout.** Per-feature folders give us a natural place to add new
   feature surfaces without inventing a new bucket each time.

This change collapses the model to **three buckets and a single rule**:

> Every file lives in `ui/`, `common/`, or `<feature>/`. Nothing flat at
> the root of `components/`.

`ui/` keeps the registry atom convention. `common/` absorbs all the
loose chrome plus genuinely cross-feature compositions. Each feature
gets its own folder (`blog/`, `projects/`, `about/`, `contact/`,
`legal/`, `not-found/`) so domain-aware compositions live next to the
content collections / schemas / i18n keys they reference.

The decision rule for `common/` vs `<feature>/` is:

> "If I rename this component with a generic name, does its prop API
> still make sense?"
>
> - `Hero(title, description, cta)` → yes → `common/`.
> - `PostCard(post: BlogPost)` → renaming to `FeatureCard` is nonsense
>   → `blog/`.

Two side effects this change also resolves:

- The registry's **blocks tier is empty in practice**. The only entry
  is `not-found-state` which the starter no longer needs (it merges
  into `not-found/NotFoundHero.astro`). Per the issue body, we strip
  `registry:block` items from `registry.json` and delete
  `packages/registry/blocks/` until there's a real composition worth
  distributing. The future home for re-introduced blocks is documented
  but not built here.
- The CookieBanner moves into `legal/`. Per the bucket semantics:
  "legal/CookieBanner is the runtime arm of the legal/cookies surface,
  not despite being site-wide-rendered." This makes the relationship
  between the banner and `/legal/cookies` page explicit in the file
  tree.

The four scaffolded copies of the starter component tree
(`apps/site/`, `apps/docs/`, `apps/playground/`, and the docs template
at `packages/templates/docs/`) mirror the relevant renames so the
manual-mirror practice documented in `apps/*/AGENTS.md` stays
internally consistent after the change.

## Scope

In scope:

- **Restructure `packages/templates/starter/src/components/`** per
  the migration map in `design.md` — move every loose root file into
  `common/` or `legal/`; collapse `sections/<page>/` into per-feature
  folders at the root of `components/`; delete the now-empty
  `sections/` and `blocks/` directories.
- **Rename `Nav.astro` → `Header.astro`.** All other relocations
  preserve filenames.
- **Merge `blocks/not-found-state.astro` into
  `not-found/NotFoundHero.astro`** so there is a single 404 surface
  composition. The merged file lives at
  `src/components/not-found/NotFoundHero.astro` and is the only thing
  `src/pages/404.astro` imports for the 404 hero.
- **Update every import path** in starter pages, layouts, and
  components that referenced an old location (`@/components/Nav.astro`
  → `@/components/common/Header.astro`, etc.).
- **Strip `registry:block` from `packages/registry/registry.json`** and
  delete `packages/registry/blocks/not-found-state.astro` and the
  `packages/registry/blocks/` directory.
- **Mirror the renames** to `packages/templates/docs/src/components/`,
  `apps/site/src/components/`, `apps/docs/src/components/`, and
  `apps/playground/src/components/` for the components that exist in
  each tree. The docs template and `apps/docs/` have no `Nav.astro`
  (the docs chrome differs), but they do have the chrome trio
  (`Brand`, `ThemeToggle`, `LocaleSwitcher`, `CookieBanner`,
  `Analytics`); those move to the same `common/` and `legal/` slots.
  `apps/playground/` is CI-regenerated by `pnpm scaffold:test` and
  will pick the new layout up automatically after T-final reruns it,
  but the implementer commits the mirror explicitly so a fresh
  `git pull` shows the desired state regardless of whether scaffold
  has been run.
- **Update `tokens-only.mjs --layered` if needed** — the audit's
  `aboveTheFold` list today is `['Hero.astro', 'Header.astro',
'Nav.astro']`. After this change, `Nav.astro` no longer exists; the
  audit happily finds `Header.astro` and `Hero.astro` and the
  `Nav.astro` lookup is a no-op. No script edit is strictly required.
- **Update boundary docs** that name the old paths:
  `packages/templates/starter/AGENTS.md` (lists "Nav, BaseLayout" in
  the layered-CSS invariant) and `apps/site/AGENTS.md` if applicable.
  CLAUDE.md files at each package root are symlinks of AGENTS.md, so
  one edit lands in both.
- **Add a changeset** under `.changeset/` flagging this as a breaking
  reorganization for end users who scaffolded an earlier version of
  the starter and want to mirror it back.

Out of scope (documented explicitly so the implementer doesn't drift):

- **Adding new components or new pages.** The `common/` proposal in
  the issue lists `Hero.astro`, `CtaBand.astro`, `FeaturesGrid.astro`,
  `TestimonialsCarousel.astro` as _future homes_. Only what the
  starter ships today gets moved. Concretely: `Hero.astro` is moved
  (it exists at the root today); `CtaBand.astro` and
  `TestimonialsCarousel.astro` are not introduced.
- **Reintroducing registry blocks.** That's a follow-up issue once
  there is a real composition worth distributing.
- **Module-level colocation** (UI + actions + schemas + i18n per
  folder) — documented in the issue as a possible future evolution;
  not part of this change.
- **Restructuring `image/` and `seo/` subdirectories.** They are
  already namespaced subdirectories (not loose root files) and they
  hold cross-cutting utilities consumed by layouts, not feature
  compositions. They stay as-is to keep the diff focused and the
  layout imports stable. The "single rule" is interpreted as "every
  _new_ placement lives in ui/, common/, or <feature>/" — the existing
  `image/` and `seo/` subdirectories are documented exemptions in
  design.md.
- **Editing the `tokens-only.mjs` audit script** to remove the
  obsolete `Nav.astro` entry. The audit still passes after the rename
  (the lookup simply returns no file); cleaning up the list is a
  separate, optional follow-up.

## Scenarios

### S1 — Final layout matches the proposed structure

- **GIVEN** the post-change tree
- **WHEN** `packages/templates/starter/src/components/` is listed
- **THEN** the immediate subdirectories are exactly:
  `ui/`, `common/`, `blog/`, `projects/`, `about/`, `contact/`,
  `legal/`, `not-found/`, `image/`, `seo/`. There are zero `*.astro`
  files at the root of `components/` and no `sections/` or `blocks/`
  directory exists.

### S2 — Every relocated file lands at its mapped path

- **GIVEN** the post-change tree
- **WHEN** the migration map in `design.md` is checked file-by-file
- **THEN** every "old path → new path" pair maps to a real file at
  the new path, no file remains at the old path, and the two paths do
  not coexist. Specifically:
  - `Nav.astro` is gone; `common/Header.astro` exists.
  - `Footer.astro`, `Brand.astro`, `ThemeToggle.astro`,
    `LocaleSwitcher.astro`, `Analytics.astro`, `Hero.astro` are gone
    from the root; `common/Footer.astro`, `common/Brand.astro`,
    `common/ThemeToggle.astro`, `common/LocaleSwitcher.astro`,
    `common/Analytics.astro`, `common/Hero.astro` exist.
  - `CookieBanner.astro` is gone from the root; `legal/CookieBanner.astro`
    exists.
  - `sections/landing/FeaturesGrid.astro` is gone;
    `common/FeaturesGrid.astro` exists.
  - `sections/about/AboutBody.astro` → `about/AboutBody.astro`.
  - `sections/blog/BlogIndexList.astro` → `blog/BlogIndexList.astro`.
  - `sections/contact/ContactSection.astro` →
    `contact/ContactSection.astro`.
  - `sections/projects/ProjectsIndexList.astro` →
    `projects/ProjectsIndexList.astro`.
  - `sections/not-found/NotFoundHero.astro` →
    `not-found/NotFoundHero.astro`.
  - `blocks/not-found-state.astro` no longer exists at any path under
    `packages/templates/starter/`.

### S3 — One 404 surface, no duplicate

- **GIVEN** the post-change tree
- **WHEN** every file under `packages/templates/starter/src/components/`
  that renders a 404 layout (heading + lede + CTA back to home) is
  enumerated
- **THEN** exactly one file matches: `not-found/NotFoundHero.astro`.
  `src/pages/404.astro` imports this single component for its hero;
  nothing else imports it; `blocks/not-found-state.astro` does not
  exist.

### S4 — File-naming convention applied

- **GIVEN** the post-change tree
- **WHEN** every `.astro` file under `src/components/` is checked
- **THEN** files inside `ui/` keep their kebab-case names
  (`card-header.astro`, `dropdown-menu-item.astro`, etc.); every other
  `.astro` file under `common/`, `blog/`, `projects/`, `about/`,
  `contact/`, `legal/`, `not-found/` uses PascalCase
  (`Header.astro`, `FeaturesGrid.astro`, `AboutBody.astro`,
  `BlogIndexList.astro`, `ContactSection.astro`,
  `ProjectsIndexList.astro`, `CookieBanner.astro`,
  `NotFoundHero.astro`, `Footer.astro`, `Brand.astro`,
  `ThemeToggle.astro`, `LocaleSwitcher.astro`, `Analytics.astro`,
  `Hero.astro`).

### S5 — Every page is thin

- **GIVEN** the post-change tree
- **WHEN** every `.astro` file under
  `packages/templates/starter/src/pages/` (including `[lang]/`
  parallels) is read
- **THEN** the body between `---` and end-of-file contains only a
  single layout wrapper (`<BaseLayout …>`, `<ArticleLayout …>`,
  `<LegalLayout …>`, or `<ProjectLayout …>`) with one or more
  `<Composition />` imports inside it; no inline `<section>`,
  `<article class="page">`, `<form>`, or grid markup; no scoped
  `<style>` block. The page frontmatter still builds schemas, data,
  and translation strings, and passes them through. This is the
  invariant introduced by change #28; this change preserves it as the
  imports are rewritten to the new component paths.

### S6 — Every old import path is rewritten

- **GIVEN** the post-change tree
- **WHEN** the starter is searched for `@/components/<name>.astro`
  with `<name>` ∈ `{Nav, Footer, Brand, ThemeToggle, LocaleSwitcher,
Analytics, CookieBanner, Hero}` (the loose-root set) and for any
  path under `@/components/sections/` or `@/components/blocks/`
- **THEN** zero matches remain. Every consumer has been rewritten to
  the new path (e.g. `@/components/common/Header.astro`,
  `@/components/legal/CookieBanner.astro`,
  `@/components/blog/BlogIndexList.astro`).

### S7 — Registry blocks tier is removed for now

- **GIVEN** the post-change tree
- **WHEN** `packages/registry/registry.json` is parsed and
  `packages/registry/blocks/` is listed
- **THEN** `items[]` contains no entry whose `type` is
  `registry:block`; `packages/registry/blocks/` does not exist
  (directory removed). The `items[]` array still contains every
  `registry:ui` and `registry:lib` entry it had before.

### S8 — Mirrors are kept in sync

- **GIVEN** the post-change tree
- **WHEN** the four scaffolded-mirror trees are inspected:
  `apps/site/src/components/`, `apps/docs/src/components/`,
  `apps/playground/src/components/`, and
  `packages/templates/docs/src/components/`
- **THEN** for every component that exists in each tree, it lives at
  the same new path as in the starter — `common/Header.astro` /
  `common/Footer.astro` / `common/Brand.astro` /
  `common/ThemeToggle.astro` / `common/LocaleSwitcher.astro` /
  `common/Analytics.astro` / `legal/CookieBanner.astro` — and every
  import in those trees that referenced the old path is rewritten.
  Components that only exist in one tree (`apps/site/` has
  `landing/HeroSection.astro` etc., `packages/templates/docs/` has
  `docs/SidebarNav.astro` etc.) are not moved.

### S9 — Consent boundary preserved

- **GIVEN** the post-change tree
- **WHEN** the consent audit runs
  (`scripts/audit/consent-gated-analytics.mjs` and its `--banner`,
  `--policy`, `--boundary` modes)
- **THEN** every check still passes: `Analytics.astro` exists at its
  new path, gated behind a consent guard; `CookieBanner.astro` exists
  (now under `legal/`); the base layout imports both at their new
  paths and renders them; the cookie policy page
  (`/legal/cookies`) and its `[lang]/` parallel still exist; no other
  file injects the analytics script.

### S10 — JSON-LD assembly stays at the layout / page boundary

- **GIVEN** the post-change tree
- **WHEN** the JSON-LD audit runs
  (`scripts/audit/jsonld-graph.mjs --strict --typed`)
- **THEN** the base layout still emits exactly one
  `<script type="application/ld+json">` block whose payload is the
  `@graph`; no relocated component emits its own JSON-LD block; every
  graph node is `schema-dts`-typed.

### S11 — i18n parallels unchanged at the route level

- **GIVEN** the post-change tree
- **WHEN** `scripts/audit/i18n-parallels.mjs` and its `--strict`,
  `--content`, `--config` modes run, plus
  `scripts/audit/internal-links-localized.mjs`
- **THEN** every check passes: every page that exists at `/foo` still
  has a `[lang]/foo.astro` parallel; `getStaticPaths` emits one entry
  per locale minus default; content collections still live at
  `content/<collection>/<locale>/<slug>.mdx`; every internal link in
  the relocated chrome (`common/Header.astro` and
  `common/LocaleSwitcher.astro`) goes through
  `getRelativeLocaleUrl(lang, path)`.

### S12 — Layered CSS strategy preserved through the renames

- **GIVEN** the post-change tree
- **WHEN** `scripts/audit/tokens-only.mjs --layered` runs
- **THEN** the audit's `aboveTheFold` lookup finds a `<style>` block
  inside `common/Header.astro` (renamed from `Nav.astro`) and
  `common/Hero.astro`; the rule "above-the-fold uses scoped `<style>`,
  below-the-fold uses Tailwind" continues to hold; the scoped blocks
  that used to live in `Nav.astro` / `Hero.astro` / sections move
  byte-for-byte with the file.

### S13 — No new runtime dependencies

- **GIVEN** the post-change tree
- **WHEN** `packages/templates/starter/package.json`,
  `packages/templates/docs/package.json`, `apps/site/package.json`,
  `apps/docs/package.json`, `apps/playground/package.json`, and
  `packages/registry/package.json` are diffed against `main`
- **THEN** no entry is added to any `dependencies` block. This is a
  structural change only — no library is introduced.

### S14 — Typecheck, format, audits, and scaffold smoke stay green

- **GIVEN** the post-change tree
- **WHEN** the following commands run from the repo root:
  `pnpm format:check`, `pnpm typecheck`,
  `pnpm audit:invariants --change restructure-starter-template-component-o`,
  `pnpm test`, `pnpm scaffold:test`
- **THEN** each exits 0. The audits exercised include
  `consent-gated-analytics`, `jsonld-graph --strict`,
  `i18n-parallels --strict --content --config`,
  `internal-links-localized`, `tokens-only` and
  `tokens-only --layered`, plus the registry-blocks audit
  (`no-react-in-atoms --include-blocks`, which now has zero blocks to
  scan but must report pass).

### S15 — Lighthouse budget not regressed

- **GIVEN** the post-change tree
- **WHEN** `pnpm perf:budget` runs against the starter
- **THEN** Performance, Accessibility, Best Practices, and SEO are
  each ≥ 95 on `/`, `/blog`, `/projects`, `/about`, `/contact`;
  LCP / INP / CLS / TBT / total compressed transfer on `/` stay
  inside the `templates-perf` budget. The implementer captures the
  report under
  `openspec/changes/restructure-starter-template-component-o/runs/<ts>/perf.txt`.

### S16 — Changeset documents the breaking move

- **GIVEN** the post-change tree
- **WHEN** `.changeset/` is listed
- **THEN** a new changeset file documents this restructure as a
  breaking-for-end-users reorganization: it lists the old → new
  component paths, notes that the registry `blocks/` tier is
  temporarily removed, and bumps the relevant packages
  (`astro-ignite` and `create-astro-ignite` at a minimum) per the
  workspace's changeset convention.
