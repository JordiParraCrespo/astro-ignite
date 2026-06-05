# Design: migrate-docs-template-to-tailwind-css

## Files touched

The change is mechanical: each file's scoped `<style>` block is
converted into Tailwind utility classes on the markup. The markup
structure (elements, hierarchy, `class` attribute layering, `is:inline`
scripts) is preserved. Each file is listed individually so
`scripts/committer --design` can validate paths; the implementer is
free to commit them in batches per the "Tasks" phase grouping.

### `packages/templates/docs/` — primary migration

#### Layouts

- MOD `packages/templates/docs/src/layouts/BaseLayout.astro` —
  inspect for any scoped `<style>` block; convert to Tailwind utility
  classes on the layout shell (skip link, header, `<main>` wrapper).
- MOD `packages/templates/docs/src/layouts/DocsLayout.astro` —
  convert the regular `<style>` block (`.docs-shell`, `.docs-main`,
  `.docs-toolbar`, `.docs-toolbar-actions`, `.docs-header`,
  `.docs-header h1`, `.docs-lede`, `.docs-tags`, `.docs-tag`,
  `.docs-meta`, `.docs-prose`) to Tailwind utilities on the
  corresponding elements. The `<style is:global>` block that styles
  MDX-emitted prose (`.docs-prose h2/h3/a/p/ul/ol/li/code/pre/
blockquote/table/th/td/hr`) is either (a) rewritten using Tailwind
  `@apply` inside a kept `<style is:global>` block, (b) rewritten as
  `:global(.docs-prose h2)` selectors with Tailwind utility composition
  via `@apply`, or (c) kept as raw CSS with a one-line
  `/* Why kept: MDX-emitted elements are not in Tailwind's scan path */`
  comment. The implementer picks the option that minimizes byte count
  and records the choice in `runs/<ts>/notes.md`. Responsive
  breakpoints (`@media (max-width: 1024px)`, `@media (max-width:
720px)`) become Tailwind responsive variants (`md:`, `lg:`) on the
  corresponding elements.
- MOD `packages/templates/docs/src/layouts/LegalLayout.astro` —
  same treatment as `DocsLayout` (regular `<style>` → Tailwind on
  elements; any MDX-emitted prose block is kept-and-justified or
  `@apply`-ed). The legal layout uses the docs prose; the
  implementer may share the MDX-prose treatment between
  `DocsLayout.astro` and `LegalLayout.astro` via a single
  `<style is:global>` block in the layout that already does it, or
  promote the prose ruleset into `global.css` if the implementer judges
  the duplication too costly (recorded in `notes.md`).

#### Components — `common/` chrome

- MOD `packages/templates/docs/src/components/common/Brand.astro` —
  convert scoped `<style>` (logo svg sizing, brand label typography,
  caret animation `.caret` reference) to Tailwind utilities. The
  `.caret` animation class lives in `global.css` and is referenced via
  `class="caret"`; that reference stays.
- MOD `packages/templates/docs/src/components/common/ThemeToggle.astro`
  — convert scoped block (button sizing, icon visibility per theme,
  hover state) to Tailwind utilities. The `<script is:inline>` body
  that flips `<html class>` is unchanged (it sets a class on `<html>`,
  not a style attribute; Tailwind classes already pick up the new
  state via the variable cascade).
- MOD `packages/templates/docs/src/components/common/LocaleSwitcher.astro`
  — convert scoped block (popover, dropdown items, active marker) to
  Tailwind utilities. The popover API attributes
  (`popovertarget`, `popover="auto"`) are unchanged.
- MOD `packages/templates/docs/src/components/common/Analytics.astro` —
  inspect for a scoped `<style>` block (analytics injection usually
  has none, but `Brand.astro`-style consent affordances might).
  Convert any block found.

#### Components — `legal/`

- MOD `packages/templates/docs/src/components/legal/CookieBanner.astro`
  — convert scoped block (fixed-bottom banner positioning, button row,
  link styling, slide-in animation if any) to Tailwind utilities. Any
  `@keyframes` for the slide-in is the one residual case where the
  scoped block survives — kept inline with a one-line comment, or
  promoted into `global.css` next to `@keyframes ig-blink`.

#### Components — `docs/` bucket

- MOD `packages/templates/docs/src/components/docs/SidebarNav.astro` —
  convert both scoped blocks (regular + `is:global` for active-state
  selectors). The active-state highlight, group-heading typography,
  external-link icon spacing, and sticky positioning become Tailwind
  utilities on the corresponding `<a>` / `<li>` / `<aside>` elements.
  The `is:global` block (if used to reach into `<details name>`
  internal markup) is either kept-and-justified or rewritten via
  `:global()` + `@apply`.
- MOD `packages/templates/docs/src/components/docs/OnThisPage.astro` —
  convert scoped block (sticky right rail, heading typography, active-
  link highlight via `IntersectionObserver`) to Tailwind utilities. The
  observer JS is unchanged; the highlight is a single utility flip
  applied by setting / removing a Tailwind class on the active link.
- MOD `packages/templates/docs/src/components/docs/Breadcrumbs.astro`
  — convert scoped block (separator chevron, link typography, hover
  state) to Tailwind utilities.
- MOD `packages/templates/docs/src/components/docs/PrevNext.astro` —
  convert scoped block (two-column flex card layout, hover lift,
  arrow positioning) to Tailwind utilities.
- MOD `packages/templates/docs/src/components/docs/SearchBox.astro` —
  convert scoped block (input pill, kbd-hint, result-list popover) to
  Tailwind utilities. The Pagefind UI mount point keeps its required
  data attributes.
- MOD `packages/templates/docs/src/components/docs/CodeBlock.astro` —
  convert scoped block (`pre` overflow, line-number gutter if present,
  copy-button affordance) to Tailwind utilities. Syntax-highlighter
  output (Shiki / `astro-shiki`) keeps its inline `style` attributes
  — those are the highlighter's contract, not styling we own.
- MOD `packages/templates/docs/src/components/docs/Callout.astro` —
  convert scoped block (variant accent bar, icon, title weight) to
  Tailwind utilities. The variant prop (`info` / `warning` / `tip` /
  `danger`) maps to a small Tailwind class lookup in the frontmatter.
- MOD `packages/templates/docs/src/components/docs/ComponentShowcase.astro`
  — convert scoped block (preview pane + code pane split, tab
  affordance) to Tailwind utilities.

#### Components — `image/` bucket

- MOD `packages/templates/docs/src/components/image/Image.astro` —
  convert any scoped block (aspect ratio, border, caption typography)
  to Tailwind utilities on the `<picture>` / `<img>` / `<figcaption>`.
- The sibling `image/HeroImage.astro` is inspected; if it currently
  carries no scoped block, no MOD is needed. If it does, it migrates
  with the same treatment.

#### Pages

- MOD `packages/templates/docs/src/pages/index.astro` — the docs
  landing. Convert any scoped block (above-the-fold landing hero, intro
  prose) to Tailwind utilities. If the page already uses Tailwind
  classes throughout (likely; pages tend to be thin), the `MOD` is a
  no-op and the implementer drops it from the commit.
- MOD `packages/templates/docs/src/pages/[lang]/index.astro` — same
  treatment as the default-locale `index.astro`.
- MOD `packages/templates/docs/src/pages/[...slug].astro` and
  `packages/templates/docs/src/pages/[lang]/[...slug].astro` — these
  are the dynamic docs route entry points. They render via
  `DocsLayout` and have no body styling of their own; inspect for any
  scoped block and convert if found.
- MOD `packages/templates/docs/src/pages/legal/[...slug].astro` and
  `packages/templates/docs/src/pages/[lang]/legal/[...slug].astro` —
  render via `LegalLayout`; same inspect-and-convert treatment.

### `apps/docs/` — mirror migration

Every file in the docs-template list above has a one-to-one mirror at
the same relative path under `apps/docs/src/`. The implementer applies
the same Tailwind rewrite to each:

- MOD `apps/docs/src/layouts/BaseLayout.astro`
- MOD `apps/docs/src/layouts/DocsLayout.astro`
- MOD `apps/docs/src/layouts/LegalLayout.astro`
- MOD `apps/docs/src/layouts/ComponentsLayout.astro` (this layout is
  app-only — it does not exist in the template — but it shares the
  Tailwind-primary pattern; convert any scoped block found).
- MOD `apps/docs/src/components/common/Brand.astro`
- MOD `apps/docs/src/components/common/ThemeToggle.astro`
- MOD `apps/docs/src/components/common/LocaleSwitcher.astro`
- MOD `apps/docs/src/components/common/Analytics.astro`
- MOD `apps/docs/src/components/legal/CookieBanner.astro`
- MOD `apps/docs/src/components/docs/SidebarNav.astro`
- MOD `apps/docs/src/components/docs/OnThisPage.astro`
- MOD `apps/docs/src/components/docs/Breadcrumbs.astro`
- MOD `apps/docs/src/components/docs/PrevNext.astro`
- MOD `apps/docs/src/components/docs/SearchBox.astro`
- MOD `apps/docs/src/components/docs/CodeBlock.astro`
- MOD `apps/docs/src/components/docs/Callout.astro`
- MOD `apps/docs/src/components/docs/ComponentShowcase.astro`
- MOD `apps/docs/src/components/image/Image.astro` (and HeroImage if
  it carries a block)
- MOD `apps/docs/src/components/blocks/not-found-state.astro` —
  app-only; inspect and convert any scoped block (404 hero typography)
  to Tailwind utilities.
- MOD `apps/docs/src/pages/index.astro` and
  `apps/docs/src/pages/[lang]/index.astro`
- MOD `apps/docs/src/pages/[...slug].astro` and
  `apps/docs/src/pages/[lang]/[...slug].astro`
- MOD `apps/docs/src/pages/legal/[...slug].astro` and
  `apps/docs/src/pages/[lang]/legal/[...slug].astro`
- MOD `apps/docs/src/pages/design.astro` (the visual design reference
  page — convert any scoped block to Tailwind).
- MOD `apps/docs/src/pages/blocks/index.astro` and
  `apps/docs/src/pages/[lang]/blocks/index.astro` (block-tier index;
  app-only).
- MOD `apps/docs/src/pages/blocks/not-found-state.astro` and
  `apps/docs/src/pages/[lang]/blocks/not-found-state.astro` (block-
  demo pages; app-only).

The `apps/docs/src/components/ui/*` atoms are NOT touched — they are
registry-owned and migrate separately under the `registry-atoms`
capability when that becomes its own spec.

The `apps/docs/src/pages/components/*.astro` and
`apps/docs/src/pages/[lang]/components/*.astro` demo pages (24 files)
are inspected; any scoped block they carry is converted, but their
primary content is `<ComponentShowcase>` invocations whose styling
flows from `ComponentShowcase.astro`.

### CLI template cache

- MOD `packages/astro-ignite/templates/docs/` — every file under this
  directory is byte-canonically refreshed by running
  `node packages/astro-ignite/scripts/copy-templates.mjs` after the
  docs-template migration is complete. The implementer commits the
  resulting 78-file (today) cache diff so the cache and the source do
  not diverge on the next `pnpm pack`. The `committer --design` path
  check is satisfied by this `MOD` line; the implementer does not
  hand-edit individual cache files.

### Documentation

- MOD `packages/templates/docs/AGENTS.md` (symlinked to `CLAUDE.md`).
  - "Stack snapshot" line: rewrite "Tailwind v4 — layered with scoped
    `<style>` blocks above the fold" to "Tailwind v4 — primary styling
    mechanism; scoped `<style>` only where Tailwind cannot express
    the rule (MDX prose via `:global`, keyframes, container queries,
    OS-level features in `global.css`)."
  - Invariant #4 ("Layered CSS"): rewrite to "Tailwind-primary CSS.
    Components, layouts, and pages express styling through Tailwind
    v4 utilities — including arbitrary-value utilities resolving
    through CSS variables (`bg-[var(--color-bg)]`,
    `text-[var(--color-fg-muted)]`). Beasties extracts critical CSS
    at build time."
- MOD `apps/docs/AGENTS.md` if it names the layered-CSS strategy
  (audit first; only edit if a stale reference exists).
- NEW `.changeset/migrate-docs-template-to-tailwind-css.md` — per the
  workspace rule `require_changeset_to_close`. Body summarizes the
  Tailwind-primary migration, lists the migrated-file count, notes
  that no runtime behaviour changes, and bumps `astro-ignite` and (if
  applicable) `create-astro-ignite` per the workspace's changeset
  convention.

### Spec / change-dir artifacts

- MOD `openspec/changes/migrate-docs-template-to-tailwind-css/`
  (covers `tasks.md` checkbox flips, this `design.md` itself as it
  evolves during implementation, the spec delta under
  `specs/templates-css-tokens/spec.md`, and the run-directory
  artifacts `runs/<ts>/{impl,audit,perf,review,notes}.md` /
  `perf.txt`).

## New signatures

This change is a styling rewrite — no new function signatures, no new
component props, no new helper APIs. Every migrated component
preserves its existing prop interface byte-for-byte. The only nominal
"new" is a documented convention for Tailwind arbitrary-value
references against tokens:

```astro
<!-- Before -->
<div class="docs-toolbar">…</div>
<style>
  .docs-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
</style>

<!-- After -->
<div class="mb-6 flex items-center justify-between">…</div>
```

```astro
<!-- Before -->
<span class="docs-tag mono">{t}</span>
<style>
  .docs-tag {
    font-size: 11px;
    color: var(--color-fg-muted);
    padding: 3px 7px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface-2);
  }
</style>

<!-- After -->
<span
  class="mono rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-[7px] py-[3px] text-[11px] text-[var(--color-fg-muted)]"
>
  {t}
</span>
```

The `mono` helper class lives in `global.css` (zero-cost utility) and
its reference is preserved. Token references use Tailwind's arbitrary-
value syntax `bg-[var(--…)]`, `text-[var(--…)]`,
`border-[var(--…)]`, `rounded-[var(--…)]`. Length values that don't
correspond to a Tailwind scale stop (e.g., `3px`, `11px`) use
arbitrary-value lengths (`px-[3px]`, `text-[11px]`).

Where a Tailwind scale stop is exact (e.g., `mb-6` for `1.5rem`,
`text-sm` for `0.875rem`), the scale stop wins on byte count and
readability.

## Composition shape (illustrative)

After the change, `packages/templates/docs/src/layouts/DocsLayout.astro`
looks like (excerpt):

```astro
---
import BaseLayout from './BaseLayout.astro';
import SidebarNav from '@/components/docs/SidebarNav.astro';
import OnThisPage from '@/components/docs/OnThisPage.astro';
import Breadcrumbs from '@/components/docs/Breadcrumbs.astro';
import PrevNext from '@/components/docs/PrevNext.astro';
import ThemeToggle from '@/components/common/ThemeToggle.astro';
import LocaleSwitcher from '@/components/common/LocaleSwitcher.astro';
// schemas + data prep…
---

<BaseLayout …>
  <div
    class="grid min-h-screen items-start grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_220px]"
  >
    <SidebarNav currentPath={Astro.url.pathname} />

    <main id="main" class="min-w-0 max-w-full px-5 pb-12 pt-6 md:px-12 md:pb-16 md:pt-7">
      <div class="mb-6 flex items-center justify-between">
        <Breadcrumbs currentSlug={slug} currentTitle={title} />
        <div class="flex items-center gap-1.5">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <article class="…" data-pagefind-body>
        <header class="mb-7">
          {
            tags.length > 0 && (
              <div class="mb-3 flex gap-1.5">
                {tags.map((t) => (
                  <span class="mono rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-[7px] py-[3px] text-[11px] text-[var(--color-fg-muted)]">
                    {t}
                  </span>
                ))}
              </div>
            )
          }
          <h1
            class="m-0 mb-3 text-[clamp(1.75rem,3vw,2.375rem)] font-medium leading-[1.05] tracking-[-0.04em] text-[var(--color-fg)]"
          >
            {title}
          </h1>
          <p class="m-0 mb-4 max-w-[60ch] text-base leading-[1.55] text-[var(--color-fg-muted)]">
            {description}
          </p>
          {
            lastUpdated && (
              <div class="mono flex items-center gap-1.5 text-[11px] tracking-[-0.005em] text-[var(--color-fg-muted)]">
                <span>Last updated</span>
                <time datetime={lastUpdated.toISOString()}>{dateFmt.format(lastUpdated)}</time>
              </div>
            )
          }
        </header>

        <div class="docs-prose max-w-[64ch] text-[15px] leading-[1.65] text-[var(--color-fg)]">
          <slot />
        </div>

        <PrevNext currentSlug={slug} />
      </article>
    </main>

    <OnThisPage headings={headings} class="hidden lg:block" />
  </div>
</BaseLayout>

<style is:global>
  /*
   * Kept: MDX-emitted prose elements are not in Tailwind's class scan path
   * (they are produced by the MDX compiler at render time, not authored as
   * literal class= attributes). Expressed via @apply so the rules still
   * reuse Tailwind utilities and the token layer.
   */
  .docs-prose h2 {
    @apply mt-10 mb-4 scroll-mt-4 text-[22px] font-medium leading-[1.3] tracking-[-0.03em] text-[var(--color-fg)];
  }
  .docs-prose h3 {
    @apply mt-8 mb-2 scroll-mt-4 text-[18px] font-medium leading-[1.4] tracking-[-0.02em] text-[var(--color-fg)];
  }
  /* …et al, mirroring the previous block one-for-one… */
</style>
```

The `.docs-prose` selector is retained because MDX output cannot be
classed at authoring time. The body of the `<style is:global>` block
expresses each rule via `@apply` so the source of truth remains
Tailwind utilities + the token layer — the block is structural
(scoping), not a parallel design system.

## Invariants this change touches

### `templates-css-tokens`

- **I1 (no raw zinc / hex in component files)** — preserved by
  construction. The migration converts CSS declarations referencing
  `var(--color-*)` into Tailwind utilities referencing the same
  `var(--color-*)` via arbitrary values. No raw zinc utility (`bg-
zinc-900`, `text-zinc-400`, …) is introduced. The
  `scripts/audit/tokens-only.mjs` regex
  `/\b(?:bg|text|border|ring|from|to|via)-zinc-\d+/` continues to
  return zero matches.
- **I2 (`global.css` defines `--color-*` tokens)** — preserved. The
  token layer at `packages/templates/docs/src/styles/global.css` is
  not touched by this change.
- **I3 (tri-state dark mode wired via `.light`)** — preserved. The
  `.light` selector in `global.css` continues to flip every
  `--color-*` token; Tailwind arbitrary-value utilities resolve at
  render time, so the toggle continues to work without per-component
  `dark:` variants.
- **I4 (above-the-fold uses scoped `<style>`)** — MODIFIED for the
  docs template. The capability spec's "Layered CSS strategy"
  requirement is updated by this change's delta at
  `openspec/changes/migrate-docs-template-to-tailwind-css/specs/
templates-css-tokens/spec.md` to permit the "Tailwind-primary"
  pattern as an explicit alternative for templates whose above-the-
  fold chrome is non-marketing (sidebar-based docs surface,
  dashboards). The audit script's filename-based heuristic
  (`['Hero.astro', 'Header.astro', 'Nav.astro']` at
  `scripts/audit/tokens-only.mjs:83`) is unchanged — none of those
  filenames exist in the docs template, so the heuristic vacuously
  passes today and continues to vacuously pass after this change.
  The starter template is not touched; its scoped-style above-the-
  fold pattern continues to satisfy the heuristic via
  `common/Hero.astro` and `common/Header.astro`.

Audit: `node scripts/audit/tokens-only.mjs` and
`node scripts/audit/tokens-only.mjs --layered`. Invoked via
`pnpm audit:invariants --change migrate-docs-template-to-tailwind-css`.

### `templates-i18n`

- **I1, I2, I3, I4** — preserved. The migration is a styling
  rewrite. No route file moves. `getStaticPaths` shapes are unchanged.
  Content collections remain at `src/content/docs/<locale>/<slug>.mdx`.
  `siteConfig.locales` stays `['en']`.
- **I5 (internal links use `getRelativeLocaleUrl`)** — preserved. The
  audit's grep over `<a href="…">` literals continues to find every
  internal link wrapped in `getRelativeLocaleUrl(locale, path)`. The
  styling rewrite changes `class` attributes, not `href` attributes.
  Specifically, the migrated docs chrome (`docs/SidebarNav.astro`,
  `docs/Breadcrumbs.astro`, `docs/PrevNext.astro`,
  `docs/OnThisPage.astro`, `common/LocaleSwitcher.astro`,
  `common/Brand.astro`) keeps every `getRelativeLocaleUrl` call site
  byte-for-byte.
- **I6 (LocaleSwitcher in chrome, hides unlocalized items)** —
  preserved. The switcher's predicate (filtering by per-page
  localized entry availability) is JS / TS frontmatter logic,
  unaffected by the styling rewrite.

Audit: `node scripts/audit/i18n-parallels.mjs` and
`node scripts/audit/internal-links-localized.mjs`. Invoked via
`pnpm audit:invariants --change migrate-docs-template-to-tailwind-css`.

### `templates-perf`

- **I1 (Lighthouse mobile budget on home)** — must stay ≥ 95 across
  Performance / Accessibility / Best Practices / SEO. The migration
  produces semantically equivalent HTML output (same DOM, same content,
  same link targets); the only diff is the `class` attribute string
  set. Tailwind v4's JIT scan picks up the new utility set; total
  emitted CSS size may differ slightly (smaller, typically, because
  Tailwind dedupes shared rules).
- **I2 (Lighthouse mobile budget on inner page)** — same; verified
  against `/getting-started` or an equivalent docs page that the
  implementer selects from the docs collection's emitted route set.
- **I3 (total transfer ≤ 150KB compressed home)** — must hold. The
  implementer verifies via `node scripts/perf/run.mjs --transfer` and
  records the result in `runs/<ts>/perf.txt`. Expected impact: neutral
  or slightly favourable — Tailwind's deduplication often emits less
  CSS than hand-authored scoped blocks that repeat the same selectors.
- **I4 (Beasties critical CSS)** — preserved. Beasties inspects
  rendered HTML and extracts above-the-fold rules into an inlined
  `<style>` block. The source of those rules (scoped `<style>` in the
  Astro component, or compiled Tailwind utilities emitted into the
  document stylesheet) is invisible to Beasties; the inline-critical
  step continues to function.
- **I5 (no undeclared runtime dep added)** — explicitly forbidden by
  scenario S12. The implementer adds no entries to any `dependencies`
  block. Tailwind v4 is already present via `@tailwindcss/vite` in
  both `packages/templates/docs/package.json` and
  `apps/docs/package.json`.

Audit: `pnpm perf:budget` (which runs
`scripts/perf/run.mjs --page /`, `--page /<inner>`, `--transfer`,
`--critical-css`, `--deps`). The implementer captures the report
under `runs/<ts>/perf.txt`.

### Secondary capabilities (preserved without delta)

These specs are not modified, but the migration must continue to
satisfy their existing invariants. Each is exercised by
`pnpm audit:invariants --change migrate-docs-template-to-tailwind-css`.

- **`templates-consent`** — `CookieBanner.astro` and `Analytics.astro`
  live in their current slots (`common/`, `legal/`); the consent
  guard, banner-visibility predicate, and `Analytics` boundary
  (analytics script only loaded behind consent) are JS / TS
  frontmatter logic unaffected by the styling rewrite. The
  `consent-gated-analytics.mjs` audit walks by filename, then
  inspects content; the migration preserves the filenames and the
  inspect-strings (`"CookieBanner"`, `plausible`).
- **`templates-seo-jsonld`** — the JSON-LD graph is emitted by
  `BaseLayout.astro` (one `<script type="application/ld+json">` tag
  per page, payload = `@graph`). The migration touches the layout's
  CSS, not its JSON-LD assembly. `JsonLd.astro` and `SEO.astro` live
  under `components/seo/` and are inspected for any residual scoped
  block (typically none — they emit `<script>` and `<link>` tags
  only).

Audit commands (parseable by `scripts/audit/run-all.mjs --change`):

- audit: `node scripts/audit/tokens-only.mjs`
- audit: `node scripts/audit/tokens-only.mjs --layered`
- audit: `node scripts/audit/tokens-only.mjs --config`
- audit: `node scripts/audit/tokens-only.mjs --darkmode`
- audit: `node scripts/audit/i18n-parallels.mjs`
- audit: `node scripts/audit/i18n-parallels.mjs --strict`
- audit: `node scripts/audit/i18n-parallels.mjs --content`
- audit: `node scripts/audit/i18n-parallels.mjs --config`
- audit: `node scripts/audit/internal-links-localized.mjs`
- audit: `node scripts/audit/consent-gated-analytics.mjs`
- audit: `node scripts/audit/consent-gated-analytics.mjs --banner`
- audit: `node scripts/audit/consent-gated-analytics.mjs --policy`
- audit: `node scripts/audit/consent-gated-analytics.mjs --boundary`
- audit: `node scripts/audit/jsonld-graph.mjs --strict --typed`

## Performance budget applicability

The change's capabilities match `/^templates-/`, so the harness rule
`require_perf_budget_to_close_when` applies.

Expected impact:

- **JS bundle:** unchanged. The migration touches `class` attributes
  and `<style>` blocks; component scripts and `<script is:inline>`
  bodies are preserved byte-for-byte.
- **CSS:** neutral to slightly favourable. Tailwind v4's JIT scan
  emits utilities once and reuses them across consumers; hand-authored
  scoped blocks often repeat selector patterns (`.docs-toolbar` +
  `.docs-toolbar-actions` + nested rules) that the JIT can dedupe.
  Beasties continues to inline the above-the-fold subset.
- **HTML output:** byte-for-byte identical for the rendered DOM
  (elements, hierarchy, content). Only `class` attribute strings
  differ.
- **Critical-CSS extraction:** Beasties inspects rendered HTML +
  emitted `<style>` blocks; both signals are preserved (Tailwind
  utilities live in the emitted stylesheet that Beasties traces). No
  drift expected.

Risk areas the implementer must verify in the perf run:

- **LCP candidate on `/`** — the docs landing's hero text (or the
  first `<article>` heading depending on layout) is the LCP candidate.
  Confirm in `runs/<ts>/perf.txt` that LCP stays ≤ 2.0 s.
- **CLS on `/` and inner pages** — confirm CLS stays ≤ 0.05. The
  responsive-grid rewrite (`grid-template-columns: 240px 1fr 220px`
  → `lg:grid-cols-[240px_1fr_220px]`) must produce equivalent layout
  at every breakpoint; CLS is the canary that catches a mistake here.
- **Total transfer** — re-check ≤ 150 KB compressed on `/`. Expected
  unchanged or slightly favourable.

## Rejected alternative — Migrate via a Tailwind config theme extension

A more "idiomatic" Tailwind v4 path would be to extend the theme in
`global.css` so that token references become first-class utilities:

```css
@theme {
  --color-bg: …;
  --color-fg: …;
}
```

The Tailwind v4 `@theme` block at the top of `global.css` already does
exactly this — utilities like `bg-bg`, `text-fg`, `border-border`
would resolve to the corresponding `--color-*` token. We could then
write `class="bg-bg text-fg"` instead of
`class="bg-[var(--color-bg)] text-[var(--color-fg)]"` — fewer
characters per usage.

Rejected because:

1. **Naming collision risk.** Tailwind's built-in palette includes
   `bg-blue-500` etc.; a custom utility named `bg-bg` (token for
   "background") collides with the mental model — readers parse
   `bg-bg` as a typo. Arbitrary-value syntax is verbose but
   unambiguous; `bg-[var(--color-bg)]` declares its intent.
2. **Token coverage drift.** Not every token has an obvious utility
   shape (`--container-prose`, `--ease-out-soft`, `--shadow-sm`).
   Mixing "some tokens get named utilities, some need arbitrary
   values" creates inconsistency. Going all-in on arbitrary-value
   syntax keeps the rule consistent: "every token reference uses
   `[var(--...)]`."
3. **The `tokens-only.mjs` audit already verifies the safe case.**
   Tailwind utilities resolving against the `@theme` block flatten
   into the same compiled CSS as arbitrary-value classes; the audit
   regex catches raw `bg-zinc-*` regardless of which spelling is in
   the source. There is no audit hole left by the verbose spelling.
4. **Mental model match with the starter migration.** A future
   starter migration will use the same arbitrary-value spelling, so
   readers see one convention across both templates.

The implementer is free to define a small handful of named utility
shortcuts in `global.css` (`@utility bg-bg`, etc.) if a particular
file is dominated by token references and arbitrary-value verbosity
becomes a readability tax — but this is per-file judgment, not a
template-wide policy. Any such utility is documented in `notes.md`.

## Rejected alternative — Migrate registry atoms in the same change

The registry atoms (`src/components/ui/*`) carry scoped `<style>`
blocks too (`dialog.astro`, `dropdown-menu.astro`, `tabs.astro`, etc.).
Bundling their migration with the docs template would in principle
unify the codebase faster.

Rejected because:

1. **Capability boundary.** Atoms are owned by the `registry-atoms`
   capability; the docs template is owned by `templates-*`
   capabilities. Crossing the boundary in one PR makes the diff
   harder to review and bisect.
2. **Atom migration ripples into every template.** Touching
   `src/components/ui/dialog.astro` in the docs template diverges
   from the registry source at `packages/registry/base/dialog.astro`
   and the same file mirrored into the starter at
   `packages/templates/starter/src/components/ui/dialog.astro`. That
   would force the starter to migrate too — explicitly out of scope.
3. **The atoms already comply with `templates-css-tokens` I1, I2, I3,
   I4.** Their scoped `<style>` blocks reference `var(--color-*)`
   tokens, not raw zinc, and they sit "below the fold" in the file
   tree's mental model (they are leaves the chrome composes, not
   above-the-fold compositions themselves).

A separate change scoped to `registry-atoms` can sweep the atoms
later.

## Rejected alternative — Promote `.docs-prose` rules into `global.css`

Instead of keeping a `<style is:global>` block inside `DocsLayout.
astro` for the MDX prose, we could move every `.docs-prose h2 / h3 /
…` rule into `global.css` at the bottom (next to `.hairline`,
`.mono`, `.caret`). The docs layout would then have zero residual
`<style>` block.

Rejected because:

1. **Locality.** The prose rules are a property of the docs layout;
   moving them to `global.css` separates "the layout that uses these
   rules" from "the rules themselves." When a contributor wants to
   tweak MDX prose, they should find the rules in the file they are
   already editing (the layout), not by hunting through `global.css`.
2. **`global.css` is the token / primitive layer.** Mixing
   layout-specific selectors (`.docs-prose h2`) into a file whose
   role is "tokens + minimal resets + tiny utilities" muddies the
   boundary.
3. **Beasties extracts the prose rules either way.** Whether the
   prose styles live inside the layout's `<style is:global>` or in
   `global.css`, Beasties inlines whatever is needed above the fold
   and defers the rest. No perf difference.

The implementer may revisit this in a follow-up if a `LegalLayout` /
`DocsLayout` duplication appears that justifies promoting one of
several near-identical prose blocks. For now the rule lives in the
layout that consumes it.

## Out-of-scope mirroring rules

`apps/docs/` is a scaffolded mirror of the docs template (per
`apps/docs/AGENTS.md`: "manual mirror — when you change the docs
template, audit whether `apps/docs/` needs the same change"). The
issue explicitly asks for the same migration in this mirror, so this
change applies it in lockstep.

`packages/astro-ignite/templates/docs/` is a publish-time cache of the
docs template, refreshed via `scripts/copy-templates.mjs` at
`prepack`. The cache is checked into git so that
`pnpm pack` / `npm publish` produces a deterministic tarball without
an extra build step. The implementer refreshes the cache after the
source migration is complete (T15 in `tasks.md`); the diff for the
cache is mechanical and matches the source diff one-to-one. No hand-
editing of cache files.
