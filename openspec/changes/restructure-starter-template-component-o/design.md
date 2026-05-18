# Design: restructure-starter-template-component-o

## Files touched

### `packages/templates/starter/` — the starter

Relocations / renames (one `MOD` per pair: the file moves, content
stays). The `committer --design` path-check accepts the file at either
endpoint of the move; the implementer makes the actual `git mv` (or
delete + write) commit by commit.

- MOD `packages/templates/starter/src/components/Nav.astro` →
  `packages/templates/starter/src/components/common/Header.astro`
  (rename + relocate; content unchanged; scoped `<style>` block
  travels with the file).
- MOD `packages/templates/starter/src/components/Footer.astro` →
  `packages/templates/starter/src/components/common/Footer.astro`.
- MOD `packages/templates/starter/src/components/Brand.astro` →
  `packages/templates/starter/src/components/common/Brand.astro`.
- MOD `packages/templates/starter/src/components/ThemeToggle.astro` →
  `packages/templates/starter/src/components/common/ThemeToggle.astro`.
- MOD `packages/templates/starter/src/components/LocaleSwitcher.astro` →
  `packages/templates/starter/src/components/common/LocaleSwitcher.astro`.
- MOD `packages/templates/starter/src/components/Analytics.astro` →
  `packages/templates/starter/src/components/common/Analytics.astro`.
- MOD `packages/templates/starter/src/components/Hero.astro` →
  `packages/templates/starter/src/components/common/Hero.astro`.
- MOD `packages/templates/starter/src/components/CookieBanner.astro` →
  `packages/templates/starter/src/components/legal/CookieBanner.astro`.
- MOD
  `packages/templates/starter/src/components/sections/landing/FeaturesGrid.astro`
  →
  `packages/templates/starter/src/components/common/FeaturesGrid.astro`
  (it is a parametrized features grid with a generic prop API; per the
  bucket semantics it lives in `common/`).
- MOD
  `packages/templates/starter/src/components/sections/about/AboutBody.astro`
  → `packages/templates/starter/src/components/about/AboutBody.astro`.
- MOD
  `packages/templates/starter/src/components/sections/blog/BlogIndexList.astro`
  → `packages/templates/starter/src/components/blog/BlogIndexList.astro`.
- MOD
  `packages/templates/starter/src/components/sections/contact/ContactSection.astro`
  →
  `packages/templates/starter/src/components/contact/ContactSection.astro`.
- MOD
  `packages/templates/starter/src/components/sections/projects/ProjectsIndexList.astro`
  →
  `packages/templates/starter/src/components/projects/ProjectsIndexList.astro`.
- MOD
  `packages/templates/starter/src/components/sections/not-found/NotFoundHero.astro`
  →
  `packages/templates/starter/src/components/not-found/NotFoundHero.astro`
  (after the merge in DEL below — the file at the destination absorbs
  the markup from `blocks/not-found-state.astro` if needed; if
  `NotFoundHero.astro` is already the full 404 surface, the absorption
  is a no-op).

Deletions:

- DEL
  `packages/templates/starter/src/components/blocks/not-found-state.astro`
  (merged into `not-found/NotFoundHero.astro`; the markup the page
  needs is consolidated into one file).
- DEL `packages/templates/starter/src/components/blocks/` (empty after
  the merge; remove the directory so the tree is exact).
- DEL `packages/templates/starter/src/components/sections/` (every
  file under it relocates; remove the empty directory).

Import rewrites — every consumer points at the new path. These are the
known sites:

- MOD `packages/templates/starter/src/layouts/BaseLayout.astro`
  (rewrites imports for `Nav` → `Header` from
  `@/components/common/Header.astro`, plus `Footer`, `CookieBanner`,
  `Analytics` at their new paths).
- MOD `packages/templates/starter/src/components/common/Footer.astro`
  (was importing `@/components/Brand.astro` → now imports
  `@/components/common/Brand.astro`; uses Text from `ui/` which is
  unchanged).
- MOD `packages/templates/starter/src/components/common/Header.astro`
  (renamed from `Nav.astro`; rewrites any internal imports of
  `@/components/Brand.astro` → `@/components/common/Brand.astro`,
  `@/components/ThemeToggle.astro` →
  `@/components/common/ThemeToggle.astro`,
  `@/components/LocaleSwitcher.astro` →
  `@/components/common/LocaleSwitcher.astro`).
- MOD `packages/templates/starter/src/components/common/Hero.astro`
  (its `@/components/ui/button.astro` import is unchanged; no other
  rewrite needed).
- MOD
  `packages/templates/starter/src/components/contact/ContactSection.astro`
  (its `@/components/ui/button.astro` import is unchanged).
- MOD
  `packages/templates/starter/src/components/projects/ProjectsIndexList.astro`
  (its `@/components/image/Image.astro` import is unchanged).
- MOD
  `packages/templates/starter/src/components/blog/BlogIndexList.astro`
  (its `@/components/image/Image.astro` import is unchanged).
- MOD
  `packages/templates/starter/src/components/not-found/NotFoundHero.astro`
  (its `@/components/ui/button.astro` and
  `@/components/ui/text.astro` imports are unchanged).
- MOD `packages/templates/starter/src/pages/index.astro` and
  `packages/templates/starter/src/pages/[lang]/index.astro`
  (rewrite `@/components/Hero.astro` →
  `@/components/common/Hero.astro` and
  `@/components/sections/landing/FeaturesGrid.astro` →
  `@/components/common/FeaturesGrid.astro`).
- MOD `packages/templates/starter/src/pages/about.astro` and
  `packages/templates/starter/src/pages/[lang]/about.astro`
  (rewrite `@/components/sections/about/AboutBody.astro` →
  `@/components/about/AboutBody.astro`).
- MOD `packages/templates/starter/src/pages/contact.astro` and
  `packages/templates/starter/src/pages/[lang]/contact.astro`
  (rewrite the `sections/contact/ContactSection` import to
  `contact/ContactSection`).
- MOD `packages/templates/starter/src/pages/blog/index.astro` and
  `packages/templates/starter/src/pages/[lang]/blog/index.astro`
  (rewrite the `sections/blog/BlogIndexList` import and the
  `type { PostCard }` re-export path to `blog/BlogIndexList`).
- MOD `packages/templates/starter/src/pages/projects/index.astro`
  and `packages/templates/starter/src/pages/[lang]/projects/index.astro`
  (rewrite the `sections/projects/ProjectsIndexList` import and the
  `type { ProjectCard }` re-export path to `projects/ProjectsIndexList`).
- MOD `packages/templates/starter/src/pages/404.astro` (rewrite the
  `sections/not-found/NotFoundHero` import to
  `not-found/NotFoundHero`; if it currently still imports
  `blocks/not-found-state.astro` for any sub-piece, remove that import
  — the markup now lives in `NotFoundHero.astro`).

### `packages/registry/` — registry blocks tier removed for now

- DEL `packages/registry/blocks/not-found-state.astro`.
- DEL `packages/registry/blocks/` (now empty; remove the directory).
- MOD `packages/registry/registry.json` — remove the
  `not-found-state` entry whose `type` is `registry:block`. No other
  entry has type `registry:block` today, so the `items[]` array is now
  exclusively `registry:lib` + `registry:ui`.

### `packages/templates/docs/` — docs template mirror

The docs template ships a subset of the chrome (no `Nav.astro`,
`Footer.astro`, or `Hero.astro` — docs uses its own
`docs/SidebarNav.astro` etc.). Only the components that exist in this
tree move; the docs-specific layout chrome is untouched.

- MOD `packages/templates/docs/src/components/Brand.astro` →
  `packages/templates/docs/src/components/common/Brand.astro`.
- MOD `packages/templates/docs/src/components/ThemeToggle.astro` →
  `packages/templates/docs/src/components/common/ThemeToggle.astro`.
- MOD `packages/templates/docs/src/components/LocaleSwitcher.astro` →
  `packages/templates/docs/src/components/common/LocaleSwitcher.astro`.
- MOD `packages/templates/docs/src/components/Analytics.astro` →
  `packages/templates/docs/src/components/common/Analytics.astro`.
- MOD `packages/templates/docs/src/components/CookieBanner.astro` →
  `packages/templates/docs/src/components/legal/CookieBanner.astro`.
- MOD every layout or component in
  `packages/templates/docs/src/layouts/` and
  `packages/templates/docs/src/components/docs/` that imports the
  moved files — rewrite to the new paths.

### `apps/site/` — site mirror

`apps/site/` carries the full chrome set plus its own
`landing/` and `blocks/terminal/` compositions (those are local to the
site, not part of the starter migration).

- MOD `apps/site/src/components/Nav.astro` →
  `apps/site/src/components/common/Header.astro`.
- MOD `apps/site/src/components/Footer.astro` →
  `apps/site/src/components/common/Footer.astro`.
- MOD `apps/site/src/components/Brand.astro` →
  `apps/site/src/components/common/Brand.astro`.
- MOD `apps/site/src/components/ThemeToggle.astro` →
  `apps/site/src/components/common/ThemeToggle.astro`.
- MOD `apps/site/src/components/LocaleSwitcher.astro` →
  `apps/site/src/components/common/LocaleSwitcher.astro`.
- MOD `apps/site/src/components/Analytics.astro` →
  `apps/site/src/components/common/Analytics.astro`.
- MOD `apps/site/src/components/CookieBanner.astro` →
  `apps/site/src/components/legal/CookieBanner.astro`.
- MOD `apps/site/src/layouts/BaseLayout.astro` (or whatever wraps the
  pages) — rewrite all chrome imports to the new paths.
- The site's own `landing/` and `blocks/terminal/` directories stay
  put; they are site-specific and not part of the starter rename
  contract.

### `apps/docs/` — docs app mirror

Same shape as `packages/templates/docs/`. Move
`Brand`, `ThemeToggle`, `LocaleSwitcher`, `Analytics` into `common/`
and `CookieBanner` into `legal/`. Update the layouts.

- MOD `apps/docs/src/components/Brand.astro` → `apps/docs/src/components/common/Brand.astro`.
- MOD `apps/docs/src/components/ThemeToggle.astro` → `apps/docs/src/components/common/ThemeToggle.astro`.
- MOD `apps/docs/src/components/LocaleSwitcher.astro` → `apps/docs/src/components/common/LocaleSwitcher.astro`.
- MOD `apps/docs/src/components/Analytics.astro` → `apps/docs/src/components/common/Analytics.astro`.
- MOD `apps/docs/src/components/CookieBanner.astro` → `apps/docs/src/components/legal/CookieBanner.astro`.
- MOD `apps/docs/src/layouts/` import rewrites (BaseLayout, DocsLayout, ComponentsLayout).
- MOD `apps/docs/src/pages/design.astro` (rewrites `@/components/Brand.astro` → `@/components/common/Brand.astro`).

### `apps/playground/` — scaffold smoke fixture

`apps/playground/` is regenerated by `pnpm scaffold:test`. The
implementer mirrors the same renames so a fresh `git pull` reflects
the desired state. After the implementer reruns `scaffold:test` the
tree converges automatically.

- MOD `apps/playground/src/components/Nav.astro` →
  `apps/playground/src/components/common/Header.astro`.
- MOD `apps/playground/src/components/Footer.astro` →
  `apps/playground/src/components/common/Footer.astro`.
- MOD `apps/playground/src/components/Brand.astro` →
  `apps/playground/src/components/common/Brand.astro`.
- MOD `apps/playground/src/components/ThemeToggle.astro` →
  `apps/playground/src/components/common/ThemeToggle.astro`.
- MOD `apps/playground/src/components/LocaleSwitcher.astro` →
  `apps/playground/src/components/common/LocaleSwitcher.astro`.
- MOD `apps/playground/src/components/Analytics.astro` →
  `apps/playground/src/components/common/Analytics.astro`.
- MOD `apps/playground/src/components/Hero.astro` →
  `apps/playground/src/components/common/Hero.astro`.
- MOD `apps/playground/src/components/CookieBanner.astro` →
  `apps/playground/src/components/legal/CookieBanner.astro`.
- DEL `apps/playground/src/components/blocks/` (and every file under
  it — the playground replays the starter's tree).
- MOD `apps/playground/src/layouts/BaseLayout.astro` import rewrites.
- MOD `apps/playground/src/pages/index.astro` (rewrites
  `@/components/Hero.astro` → `@/components/common/Hero.astro`; the
  `feature-grid` block import goes away when `blocks/` is removed —
  replaced with `@/components/common/FeaturesGrid.astro` once the
  starter mirror lands via T33's `scaffold:test`; the hand-mirror
  swaps it in eagerly to keep typecheck green).
- MOD `apps/playground/src/pages/[lang]/index.astro` (same rewrites
  as the default-locale `index.astro`).

### Documentation

- MOD `packages/templates/starter/AGENTS.md` (symlinked to
  `CLAUDE.md`). The "Layered CSS" invariant (#4) currently names
  "Hero, Nav, BaseLayout" — update to "Hero, Header, BaseLayout"
  after the rename.
- MOD `apps/site/AGENTS.md` if it names any of the moved paths.
- NEW `.changeset/restructure-starter-components.md` — per the
  `feature_list.json` rule `require_changeset_to_close`. Documents
  the breaking starter reorganization for end users and the
  registry-blocks tier removal. Bumps `astro-ignite` and
  `create-astro-ignite` as `minor` (no behavioural change, but a
  visible source-tree restructure for anyone who scaffolded earlier).

### Spec / change-dir artifacts

- MOD `openspec/changes/restructure-starter-template-component-o/`
  (covers `tasks.md` checkbox flips, this `design.md` itself as it
  evolves during implementation, the spec deltas under
  `specs/<capability>/spec.md`, and the run-directory artifacts
  `runs/<ts>/{impl,audit,perf,review,notes}.md` / `perf.txt`).

## New signatures

This change is structural — no new function signatures, no new
component props, no new helper APIs. Every relocated component
preserves its existing prop interface byte-for-byte.

The one nominal "rename" is the consumer-side import:

```ts
// Before
import Nav from '@/components/Nav.astro';

// After
import Header from '@/components/common/Header.astro';
```

The component itself is unchanged; only its file path and default
import name change.

## Composition shape (illustrative)

After the change, `packages/templates/starter/src/layouts/BaseLayout.astro`
looks like:

```astro
---
import '@/styles/global.css';
import { siteConfig } from '@/config/site';
import { siteSchemas } from '@/lib/jsonld';
import { useTranslations } from '@/i18n';

import SEO from '@/components/seo/SEO.astro';
import JsonLd from '@/components/seo/JsonLd.astro';
import Header from '@/components/common/Header.astro';
import Footer from '@/components/common/Footer.astro';
import CookieBanner from '@/components/legal/CookieBanner.astro';
import Analytics from '@/components/common/Analytics.astro';
---

<!doctype html>
<html lang={locale}>
  <head>{/* …unchanged… */}<Analytics /></head>
  <body>
    <a href="#main" class="skip-link">{t('nav.skipToContent')}</a>
    <Header />
    <main id="main"><slot /></main>
    <Footer />
    <CookieBanner />
  </body>
</html>
```

A starter page (e.g. `src/pages/index.astro`) shrinks accordingly:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from '@/components/common/Hero.astro';
import FeaturesGrid from '@/components/common/FeaturesGrid.astro';
// schemas + data prep…
---

<BaseLayout …>
  <Hero … />
  <FeaturesGrid … />
</BaseLayout>
```

## Invariants this change touches

The change is path-level and structural. Every invariant must hold
after the rename / relocation. The audit list below is the regression
fence — none of these are loosened.

### `templates-i18n`

- **I1, I2, I3, I4** — preserved. No route moves, no
  `getStaticPaths` shape changes, no content-collection layout
  changes, `siteConfig.locales` default still `['en']`.
- **I5 (`getRelativeLocaleUrl` for internal links)** — preserved.
  The Header (renamed from Nav) and `common/LocaleSwitcher.astro`
  continue to call `getRelativeLocaleUrl(lang, '/about')`-style
  helpers. Path renames don't change the audit's regex over `<a
href="…">` literals.
- **I6 (LocaleSwitcher in chrome)** — preserved. The switcher lives
  at `common/LocaleSwitcher.astro` and is rendered by
  `common/Header.astro` (was `Nav.astro`).

Audit: `node scripts/audit/i18n-parallels.mjs`,
`--strict`, `--content`, `--config`, plus
`node scripts/audit/internal-links-localized.mjs`. Invoked via
`pnpm audit:invariants --change restructure-starter-template-component-o`.

### `templates-css-tokens`

- **I1 (no raw zinc / hex in component files)** — preserved. The
  relocations move file content byte-for-byte; no new colour is
  introduced.
- **I2, I3** — preserved by construction (`global.css` unchanged;
  tri-state dark mode unchanged).
- **I4 (above-the-fold uses scoped `<style>`)** — preserved. The
  audit script at `scripts/audit/tokens-only.mjs` line 83 names the
  above-the-fold set as `['Hero.astro', 'Header.astro', 'Nav.astro']`.
  After this change, `Hero.astro` lives at `common/Hero.astro` and
  `Header.astro` (renamed from `Nav.astro`) lives at
  `common/Header.astro`. The audit's `walkFiles` finds files by name
  (`(full, n) => n === name`), independent of subdirectory, so the
  rename + relocation keep the audit green. The obsolete `Nav.astro`
  lookup returns no file (the early-`continue` skips it) and is a
  no-op — cleaning up the list is a separate, optional follow-up
  (out of scope here).

Audit: `node scripts/audit/tokens-only.mjs` and
`node scripts/audit/tokens-only.mjs --layered`.

### `templates-seo-jsonld`

- **I1 (layout emits one `@graph` script)** — preserved. The
  `JsonLd.astro` import path in `BaseLayout.astro` is unchanged
  (it lives under `seo/` which is not touched by this change). The
  graph assembly in `siteSchemas(locale) + page schemas` is
  unchanged.
- **I2 (no page emits standalone JSON-LD outside the layout)** —
  preserved. No relocated section/common component introduces a new
  `<script type="application/ld+json">` block — they move byte-for-
  byte from their previous location, where invariant T20 of change
  #28 already prohibited standalone JSON-LD emission.
- **I3 (all nodes typed via `schema-dts`)** — preserved by
  construction.

Audit: `node scripts/audit/jsonld-graph.mjs` with `--strict` and
`--typed`.

### `templates-consent`

- **Boundary statement.** The capability spec's "Boundary" section
  names the paths it owns:
  > Owned by:
  > `packages/templates/<kind>/src/components/CookieBanner.astro`,
  > `src/components/Analytics.astro`, …
  > This change relocates both files. The boundary statement is the
  > spec's natural-language framing; it remains accurate in spirit
  > (the template still owns the consent surface), but the literal
  > paths in the spec drift. The spec delta below documents the new
  > paths so future spec readers do not have to grep.
- **I1 (analytics gated behind consent)** — preserved. The audit
  walks the template tree looking for `Analytics.astro` by **name**
  (`n === 'Analytics.astro'`), not by path; relocation into
  `common/` does not break the lookup.
- **I2 (CookieBanner rendered in base layout)** — preserved. The
  audit walks by name (`n === 'CookieBanner.astro'`), then verifies
  that the base layout file's content contains the string
  `"CookieBanner"`. After this change, `BaseLayout.astro` imports
  `CookieBanner from '@/components/legal/CookieBanner.astro'` and
  renders `<CookieBanner />` — the regex `/CookieBanner/.test(…)`
  continues to match.
- **I3 (cookie policy page exists and is linked from the banner)** —
  preserved. The legal pages (`/legal/cookies` and its `[lang]/`
  parallel) are unchanged; the banner's link target is unchanged.
- **I4 (analytics tag lives only in `Analytics.astro`)** — preserved.
  The audit greps for `plausible` outside `Analytics.astro`; the
  rename does not introduce new sites of the script string.

Audit: `node scripts/audit/consent-gated-analytics.mjs` with
`--banner`, `--policy`, `--boundary`.

### `templates-perf`

- **I1, I2 (Lighthouse mobile budget on home + one inner page)** —
  must stay ≥ 95 across Performance / Accessibility / Best Practices /
  SEO. Path renames do not change rendered HTML, CSS, or JS; the
  Astro build still emits the same compiled assets.
- **I3 (total transfer ≤ 150KB compressed home)** — preserved by
  construction.
- **I4 (Beasties critical CSS)** — preserved; Beasties inspects
  emitted HTML and `<style>` blocks regardless of source-file path.
- **I5 (no undeclared runtime dep added)** — explicitly forbidden by
  scenario S13; the implementer adds no entries to any
  `dependencies` block.

Audit: `pnpm perf:budget` (which runs
`scripts/perf/run.mjs --page /`, `--page /blog`, `--transfer`,
`--critical-css`, `--deps`). The implementer captures the report
under `runs/<ts>/perf.txt`.

### `registry-blocks`

- **I1 (no React / Vue / Svelte / Radix in `blocks/`)** — vacuously
  preserved after this change: `packages/registry/blocks/` is removed.
  The audit script at
  `scripts/audit/no-react-in-atoms.mjs --include-blocks` continues to
  run; it finds zero block files and reports pass. The relevant audit
  is `pnpm audit:invariants` which dispatches based on the change's
  capabilities.
- **I2 (every block has a demo under
  `apps/site/src/pages/blocks/`)** — vacuously preserved. No blocks
  exist; no demos required.
- **I3, I4** — vacuously preserved.

This change adds one MODIFIED requirement in the
`registry-blocks` delta below: the tier is **deferred** until a real
composition lands. The existing requirements stay in place for when
blocks are reintroduced, but the registry manifest must not list any
`registry:block` entry until then.

## Performance budget applicability

The change's capabilities match `/^templates-/` and `/^registry-/`, so
the harness rule `require_perf_budget_to_close_when` applies.

Expected impact:

- **JS bundle:** unchanged. Path renames don't add or remove JS.
- **CSS:** unchanged. Scoped `<style>` blocks move with their
  components byte-for-byte. Tailwind utility scanning continues to
  pick up the same class set (the markup didn't change).
- **HTML output:** identical. The rendered DOM trees under
  `<BaseLayout>` are byte-for-byte equivalent across the rename.
- **Critical-CSS extraction:** Beasties inspects rendered HTML +
  emitted `<style>` blocks; both sets are unchanged. No drift
  expected.

Risk areas the implementer must verify in the perf run:

- **LCP on `/`** — the H1 inside `common/Hero.astro` (renamed from
  `Hero.astro`) is the LCP candidate; confirm in `runs/<ts>/perf.txt`
  that no regression appears.
- **Total transfer** — re-check ≤ 150 KB compressed on `/`. The
  implementer runs `node scripts/perf/run.mjs --transfer`.

## Rejected alternative — make `Hero` and `FeaturesGrid` feature components under `landing/`

`Hero.astro` is the landing page's hero today. Putting it under
`landing/Hero.astro` would group it with future landing-specific
pieces and avoid coupling chrome and landing in `common/`.

Rejected because:

1. Per the issue's decision rule — "If I rename this component with a
   generic name, does its prop API still make sense?" — `Hero(title,
description, cta)` reads as a generic prop API. The Hero in the
   starter today already accepts a prop interface that does not
   reference any landing-specific schema or content collection.
2. The issue's proposed structure explicitly lists `common/Hero.astro`
   and `common/FeaturesGrid.astro`. Faithfully applying the issue's
   intent matters more than a debatable judgment call here.
3. The promotion rule documented in the issue covers the inverse case
   (move feature component → common/ on second consumer); it doesn't
   require splitting `common/` into per-page subfolders.

If a contributor later decides Hero is landing-specific, the
promotion rule lets them move it to `landing/Hero.astro` as a
follow-up.

## Rejected alternative — also restructure `image/` and `seo/` into `common/`

A strict reading of the issue's "single rule" would require moving
`components/image/{Image, HeroImage}.astro` and
`components/seo/{SEO, JsonLd}.astro` into `common/` too, since
`image/` and `seo/` are neither `ui/`, `common/`, nor `<feature>/`.

Rejected because:

1. The issue's migration map and proposed structure don't mention
   them. Quietly expanding the diff beyond the issue's scope makes
   the change harder to review and harder to bisect if a perf
   regression appears.
2. `image/` and `seo/` are already namespaced subdirectories — they
   are not the "loose root files" or "duplicated bucket" problems
   the issue is trying to solve. They behave like internal utility
   namespaces consumed by layouts.
3. A follow-up issue can rename them once we have a clearer rule for
   layout chrome vs feature chrome.

The "every file lives in `ui/`, `common/`, or `<feature>/`" rule is
captured in the spec delta as a relaxation: "every loose `*.astro` at
the root of `components/`" is forbidden; subdirectories that hold
cross-cutting infrastructure (`image/`, `seo/`) are exempt and called
out explicitly. This is a faithful interpretation of the issue's
intent (which calls out four specific overlapping buckets:
`ui/blocks/sections/<root>`).

## Rejected alternative — keep `Nav.astro` instead of renaming to `Header.astro`

A `git mv` plus path rewrites is cheaper than a name change because
it leaves the `<Nav />` identifier untouched. The issue body
explicitly names the rename (`Header.astro (renamed from Nav.astro)`),
so we apply it. Reasoning the issue author gave: "Header" is the
more conventional name across the front-end ecosystem and matches
shadcn-style scaffolding.

The audit's `aboveTheFold` list at
`scripts/audit/tokens-only.mjs:83` includes both `Nav.astro` and
`Header.astro`, so it accommodates the rename without an audit edit.
Cleaning up the obsolete `Nav.astro` entry is left as a tiny
follow-up; this change does not depend on it.

## Rejected alternative — bundle the registry blocks-tier removal into a separate change

The registry blocks tier removal could go in its own change so the
starter restructure is a smaller PR. We bundle them because:

1. The starter's `blocks/not-found-state.astro` was a mirror of the
   registry block. Deleting one without the other leaves
   `registry.json` claiming a block that no template uses.
2. The acceptance criterion in the issue ("`packages/registry/blocks/`
   and any `registry:block` items in `registry.json` are removed for
   now") lives next to the structural starter changes. Splitting them
   produces two PRs that depend on each other for coherence.
3. The registry-blocks delta is small (one requirement modified) and
   does not change the implementer's commit cadence.

## Out-of-scope mirroring rules

`apps/site/`, `apps/docs/`, `apps/playground/`, and
`packages/templates/docs/` are scaffolded mirrors of the starter
(per `apps/site/AGENTS.md`: "When you change one template, audit
whether `apps/site` and `apps/docs` need the same change — they don't
auto-update"). The issue explicitly asks for the same renames in all
four mirrors, so this change applies them in lockstep.

If a future contributor introduces a new mirror tree, they pick the
new layout up automatically by referencing the starter as the source
of truth.
