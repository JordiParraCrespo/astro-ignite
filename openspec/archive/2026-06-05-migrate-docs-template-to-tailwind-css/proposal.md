# Proposal: migrate-docs-template-to-tailwind-css

## Why

The docs template (`packages/templates/docs/`) carries scoped `<style>`
blocks in 13 of its component / layout files (sidebar, TOC, code block,
search box, callout, prev/next, breadcrumbs, component showcase, cookie
banner, theme toggle, locale switcher, brand, image, plus the two
layouts `DocsLayout.astro` and `LegalLayout.astro`). Each block restates
a small grid / spacing / typography ruleset that Tailwind v4 already
expresses concisely.

Concretely this hurts the template in three places:

1. **Editability for end users.** A user who scaffolds the docs
   template and wants to tweak the sidebar opens `SidebarNav.astro` to
   find two scoped `<style>` blocks (one regular, one `is:global`) plus
   markup. They have to read three layers — markup, scoped CSS, global
   selectors — before they can change a single hover colour. Tailwind
   utility classes live next to the markup they style.
2. **Drift between docs and starter.** The starter is the
   "marketing-style" template (Hero / Header / FeaturesGrid above the
   fold) where scoped `<style>` genuinely earns its keep — it keeps
   above-the-fold CSS extractable and bounded. The docs template has no
   marketing hero; its above-the-fold is a sidebar plus a docs
   toolbar — both of which are class-soup-friendly in the same way the
   below-the-fold rest of the template already is. Forcing the docs
   template into the starter's "scoped above the fold" pattern is a
   policy mismatch, not a perf gain.
3. **The migration unblocks a follow-up.** Migrating docs first keeps
   each PR small and reviewable. A parallel starter migration is
   discussed in the issue body but explicitly out of scope here — the
   starter's marketing chrome has its own trade-offs (LCP candidate
   inside `Hero.astro`, Beasties extraction shape) and deserves a
   separate decision.

This change converts the docs template, mirror by mirror, to a
**Tailwind-primary** pattern:

> Every component / layout / page in `packages/templates/docs/src/`
> expresses styling through Tailwind v4 utilities, including
> arbitrary-value classes that resolve through the CSS variable token
> layer (`bg-[var(--color-bg)]`, `text-[var(--color-fg-muted)]`,
> `border-[var(--color-border)]`). Scoped `<style>` blocks are kept
> only where Tailwind cannot express the rule (MDX prose via
> `:global`, keyframes, container queries) — and each kept block is
> documented inline with a one-line comment explaining why.

The token layer at `packages/templates/docs/src/styles/global.css`
keeps zinc isolated to a single file and the `.light` selector keeps
tri-state dark mode wired exactly as today. Tailwind utilities resolve
through `var(--color-*)`, so the theme toggle keeps working without
per-component `dark:` variants.

Beasties continues to inline above-the-fold CSS at build time —
whether the source is scoped `<style>` or compiled Tailwind utility
classes is invisible to the post-build inline-critical step.

The change does NOT loosen any audit:

- `tokens-only.mjs` still rejects raw zinc / hex in components.
- `tokens-only.mjs --layered` still walks the template tree for
  `Hero.astro`, `Header.astro`, `Nav.astro` — none of which exist in
  the docs template, so the heuristic continues to vacuously pass for
  this template (it was already vacuously passing before this change).
- `internal-links-localized.mjs` continues to require
  `getRelativeLocaleUrl(lang, path)` on every internal link in the
  docs chrome (`SidebarNav`, `Breadcrumbs`, `PrevNext`, `common/
LocaleSwitcher`, `common/Brand`).
- `i18n-parallels.mjs` continues to require parallel `[lang]/` routes
  for every page; the migration changes styling, not routing.
- `templates-perf` budget (`pnpm perf:budget`) continues to enforce
  Lighthouse ≥ 95 / Beasties / total compressed transfer ≤ 150 KB.

The one spec-level change is a MODIFIED `templates-css-tokens` "Layered
CSS strategy" requirement that explicitly names the Tailwind-primary
pattern as a permitted alternative for templates whose above-the-fold
chrome is non-hero (sidebar-based docs surface, dashboards, etc.). The
scoped-style rule remains the recommended pattern for templates with a
marketing-style above-the-fold (e.g., the starter).

## Scope

In scope:

- **Migrate every `.astro` file under
  `packages/templates/docs/src/`** that today carries a scoped `<style>`
  block to express its styling primarily via Tailwind v4 utilities.
  The 15 files in this set are enumerated in `design.md`.
- **Keep design tokens as tokens.** Tailwind arbitrary-value classes
  (`bg-[var(--color-bg)]`, `text-[var(--color-fg-muted)]`,
  `border-[var(--color-border)]`) replace `background: var(--color-bg)`
  CSS declarations. No raw `bg-zinc-*` / `text-zinc-*` /
  `border-zinc-*` utility appears in any component.
- **Preserve `.docs-prose` MDX styling.** The current `<style
is:global>` block in `DocsLayout.astro` styles MDX-emitted elements
  (`h2`, `h3`, `code`, `pre`, `blockquote`, `table`, `hr`, `a`). MDX
  output is not in Tailwind's scan path, so this set is expressed
  either via Tailwind `@apply` inside a residual `<style is:global>`
  block (the cheapest move), via `:global(.docs-prose h2)` selectors
  re-written with Tailwind utility composition, or kept as raw CSS
  with an inline comment. The implementer picks one of these per the
  cheapest-byte rule and records the choice in `runs/<ts>/notes.md`.
- **Keep keyframes / container queries / OS-level features in scoped
  blocks.** `@keyframes ig-blink` (caret), `@media (prefers-reduced-
motion: reduce)`, `::-webkit-scrollbar-*` already live in
  `global.css` — they are not touched. Component-local keyframes (if
  any) are kept inline with a one-line comment.
- **Mirror the migration into `apps/docs/`.** Per the workspace's
  scaffolded-mirror practice (`apps/site/AGENTS.md` and
  `apps/docs/AGENTS.md`: "When you change one template, audit whether
  `apps/site` and `apps/docs` need the same change — they don't
  auto-update"), every component / layout migrated in the docs template
  has a one-to-one mirror under `apps/docs/src/`. The implementer
  applies the same Tailwind rewrite to each mirror file.
- **Refresh the CLI template cache.** The script
  `packages/astro-ignite/scripts/copy-templates.mjs` is the prepack
  step that mirrors `packages/templates/docs/` → `packages/astro-
ignite/templates/docs/`. Because the cache is checked into git (78
  files at HEAD), the implementer runs the copy step manually after
  the docs-template migration is complete and commits the resulting
  diff so the cache is byte-canonical for the migrated source.
- **Update `packages/templates/docs/AGENTS.md`** (symlinked to
  `CLAUDE.md`). The "Stack snapshot" line that today reads "Tailwind v4
  — layered with scoped `<style>` blocks above the fold" is rewritten
  to "Tailwind v4 — primary styling mechanism; scoped `<style>` only
  where Tailwind cannot express the rule (MDX prose, keyframes)". The
  matching invariant #4 in the same file is rewritten in lockstep.
- **Add a changeset.** Per the workspace rule
  `require_changeset_to_close` (which applies to changes whose
  capabilities match `/^templates-/`). The changeset documents the
  Tailwind-primary migration as a **minor / breaking-for-end-users-
  who-track-source** change: any end user who scaffolded the docs
  template and is rebasing their fork onto the new shape will see
  every styled component diff. No runtime behavior changes.

Out of scope (explicitly so the implementer does not drift):

- **The starter template migration.** The companion issue mentioned in
  the issue body is a separate change. The starter's above-the-fold
  chrome (`Hero.astro`, `Header.astro`, `FeaturesGrid.astro`) is the
  classic case where scoped `<style>` still earns its keep — that
  decision belongs to its own spec.
- **`apps/site/`.** The site mirror serves the starter, not the docs
  template; it is not touched by this change.
- **`apps/playground/`.** Regenerated by `pnpm scaffold:test` from the
  **starter** template; the docs migration does not touch it.
- **The registry atoms (`packages/registry/base/*`,
  `packages/templates/docs/src/components/ui/*`).** Atoms are owned by
  the registry capability; their Tailwind / `<style>` mix is decided
  there. The docs template re-uses these atoms unchanged.
- **`global.css`.** Tokens, `.light` selector, `@keyframes`,
  scrollbar, reduced-motion media query all stay byte-for-byte. The
  token definitions are the contract; this change is about how
  consumers spell the token reference, not about the tokens
  themselves.
- **Removing `<style>` blocks from registry atoms.** Atoms like
  `dialog.astro`, `dropdown-menu.astro`, `tabs.astro`, etc. live in
  the registry and are mirrored into the template; touching them would
  expand scope into `registry-atoms`. They are explicitly excluded.
- **Loosening any invariant other than `templates-css-tokens` I4
  (layered CSS).** Tokens-only stays. Tri-state dark mode stays. i18n
  stays. Consent stays. Perf stays.

## Scenarios

### S1 — Every migrated file expresses styling primarily through Tailwind utilities

- **GIVEN** the post-change tree
- **WHEN** every `.astro` file under
  `packages/templates/docs/src/components/` and
  `packages/templates/docs/src/layouts/` that previously carried a
  scoped `<style>` block is read
- **THEN** the file's primary styling mechanism is Tailwind v4
  utilities applied to elements via the `class` attribute, and any
  remaining scoped `<style>` block is either (a) a `<style is:global>`
  block covering MDX-emitted elements that Tailwind cannot scan, or
  (b) a component-local block carrying keyframes, container queries,
  `::-webkit-*` selectors, or `:where()` rules that Tailwind cannot
  express; in case (b) the block is preceded by a one-line comment
  explaining why it cannot be Tailwind.

### S2 — Design tokens still flow through CSS variables

- **GIVEN** the post-change tree
- **WHEN** every Tailwind utility used in `packages/templates/docs/
src/components/**/*.astro` and `packages/templates/docs/src/layouts/
**/*.astro` is checked
- **THEN** every color-bearing utility resolves to a CSS variable
  reference. Concretely:
  - Backgrounds use `bg-[var(--color-bg)]`,
    `bg-[var(--color-surface)]`, `bg-[var(--color-surface-2)]`.
  - Foregrounds use `text-[var(--color-fg)]`,
    `text-[var(--color-fg-muted)]`, `text-[var(--color-fg-subtle)]`.
  - Borders use `border-[var(--color-border)]`,
    `border-[var(--color-border-strong)]`.
  - Rings use `ring-[var(--color-ring)]`.
  - No raw `bg-zinc-*` / `text-zinc-*` / `border-zinc-*` / `ring-
zinc-*` / `from-zinc-*` / `to-zinc-*` / `via-zinc-*` utility appears.
  - No 6- or 8-digit hex literal appears in any component file
    (`#000` / `#fff` shorthand inside `<svg>` icons remains allowed
    per `tokens-only.mjs`'s allowlist).

### S3 — Tri-state dark mode keeps working without per-component variants

- **GIVEN** the post-change tree
- **WHEN** the user toggles `<html class="light">` on a docs page
- **THEN** every visible token flips because the migrated
  `bg-[var(--color-bg)]` / `text-[var(--color-fg)]` utilities resolve
  the variable at render time; no component carries a `dark:` Tailwind
  variant or duplicate `light:` rule, because the variable layer
  already handles theme switching.

### S4 — Internal links stay localized

- **GIVEN** the post-change tree
- **WHEN** `scripts/audit/internal-links-localized.mjs` runs
- **THEN** every `<a href="…">` in the docs chrome
  (`docs/SidebarNav.astro`, `docs/Breadcrumbs.astro`,
  `docs/PrevNext.astro`, `docs/OnThisPage.astro`,
  `common/LocaleSwitcher.astro`, `common/Brand.astro`) is produced via
  `getRelativeLocaleUrl(locale, path)` — the migration is a styling
  rewrite, not a link rewrite.

### S5 — i18n parallels untouched

- **GIVEN** the post-change tree
- **WHEN** `scripts/audit/i18n-parallels.mjs` with `--strict`,
  `--content`, `--config` runs
- **THEN** every page that exists at `/foo` still has a
  `src/pages/[lang]/foo.astro` parallel; `getStaticPaths` emits one
  entry per `siteConfig.locales` minus the default;
  `siteConfig.locales` still ships as `['en']`; content collections
  still live at `src/content/docs/<locale>/<slug>.mdx`.

### S6 — `tokens-only` and `tokens-only --layered` audits stay green

- **GIVEN** the post-change tree
- **WHEN** `scripts/audit/tokens-only.mjs` and
  `scripts/audit/tokens-only.mjs --layered` run
- **THEN** zero violations are reported. `tokens-only` finds no raw
  zinc / hex in any component file; `tokens-only --layered` finds no
  `Hero.astro` / `Header.astro` / `Nav.astro` in the docs template
  (none ever existed) and therefore vacuously passes for this
  template. The starter template is not touched, so its
  above-the-fold `<style>` blocks continue to satisfy the heuristic.

### S7 — MDX prose renders unchanged

- **GIVEN** the post-change tree
- **WHEN** an MDX docs page is rendered (`/getting-started`, or any
  page under `src/content/docs/en/`)
- **THEN** the visible output is byte-equivalent to the pre-change
  output for `h2`, `h3`, `p`, `a`, `ul`, `ol`, `li`, `code`, `pre`,
  `blockquote`, `table`, `th`, `td`, `hr` — same font sizes, line
  heights, spacing, colors, hover treatment. The implementer's chosen
  vehicle (Tailwind `@apply` inside `<style is:global>`, or kept-and-
  justified raw CSS) is invisible to the reader.

### S8 — Theme toggle and locale switcher still render and function

- **GIVEN** the post-change tree
- **WHEN** the user clicks the theme toggle in
  `common/ThemeToggle.astro` or opens the locale switcher dropdown in
  `common/LocaleSwitcher.astro`
- **THEN** both interactive surfaces behave identically: the toggle
  cycles `<html class="light">` / `<html>` / `<html class="dark">`
  and persists to `localStorage`; the switcher renders one option per
  `siteConfig.locales`, hides options whose page has no localized
  entry, and navigates via `getRelativeLocaleUrl(target, currentPath)`.

### S9 — Sidebar active state still highlights the current page

- **GIVEN** the post-change tree
- **WHEN** a docs page is rendered at `/getting-started`
- **THEN** the `SidebarNav.astro` component renders the
  "Getting started" item with the migrated active-state utility
  classes (foreground = `text-[var(--color-fg)]`, weight = `font-
medium`, background = `bg-[var(--color-surface-2)]`, or the
  byte-equivalent visual outcome). The active-state detection logic
  (matching `Astro.url.pathname`) is unchanged — the migration touches
  styling, not the matching predicate.

### S10 — `apps/docs/` mirrors are migrated component-for-component

- **GIVEN** the post-change tree
- **WHEN** the docs-template tree
  (`packages/templates/docs/src/components/**`, `src/layouts/**`) and
  the docs-app tree (`apps/docs/src/components/**`,
  `apps/docs/src/layouts/**`) are diff-compared for every file pair
  that exists in both trees
- **THEN** each pair carries the same Tailwind utility set on each
  element, modulo app-specific differences (the docs app adds the
  `components/blocks/`, `components/ui/`, `layouts/ComponentsLayout.
astro`, and demo pages that are not in the template). The migration
  preserves the mirror invariant: an end user re-scaffolding from the
  template gets the same Tailwind output as `apps/docs/` ships.

### S11 — The CLI template cache reflects the migrated source

- **GIVEN** the post-change tree
- **WHEN** `node packages/astro-ignite/scripts/copy-templates.mjs`
  runs after the migration and the diff is inspected
- **THEN** the cache at `packages/astro-ignite/templates/docs/` is
  byte-canonical for the migrated source: every `.astro` file under
  `packages/astro-ignite/templates/docs/src/` matches the
  corresponding file under `packages/templates/docs/src/`. The
  implementer commits this refresh so the cache and the source do not
  diverge on the next `pnpm pack` / `npm publish`.

### S12 — No new runtime dependency

- **GIVEN** the post-change tree
- **WHEN** `packages/templates/docs/package.json` and
  `apps/docs/package.json` are diffed against `main`
- **THEN** no entry is added to any `dependencies` block. Tailwind v4
  is already present in both via `@tailwindcss/vite`. The migration is
  a usage shift, not a dependency add.

### S13 — Boundary docs updated

- **GIVEN** the post-change tree
- **WHEN** `packages/templates/docs/AGENTS.md` (symlinked to
  `CLAUDE.md`) and `apps/docs/AGENTS.md` are read
- **THEN** the "Stack snapshot" line that previously read "Tailwind v4
  — layered with scoped `<style>` blocks above the fold" reads
  "Tailwind v4 — primary styling mechanism; scoped `<style>` only
  where Tailwind cannot express the rule (MDX prose, keyframes,
  reduced-motion media queries in `global.css`)." The invariant list
  in the same file is rewritten in lockstep: "Layered CSS" becomes
  "Tailwind-primary CSS" with the same constraint set (tokens only,
  no raw zinc, Beasties inlines critical CSS at build). The
  `templates-css-tokens` capability spec at
  `openspec/specs/templates-css-tokens/spec.md` is updated by this
  change's delta to permit the Tailwind-primary pattern for the docs
  template explicitly.

### S14 — Typecheck, format, audits, scaffold smoke stay green

- **GIVEN** the post-change tree
- **WHEN** the following commands run from the repo root:
  `pnpm format:check`, `pnpm typecheck`, `pnpm test`,
  `pnpm audit:invariants --change migrate-docs-template-to-tailwind-css`,
  `pnpm scaffold:test`
- **THEN** each exits 0. The audits exercised include
  `tokens-only.mjs` and `tokens-only.mjs --layered`,
  `i18n-parallels.mjs` with `--strict`, `--content`, `--config`,
  `internal-links-localized.mjs`,
  `consent-gated-analytics.mjs` (and `--banner`, `--policy`,
  `--boundary` since the CookieBanner is in scope),
  `jsonld-graph.mjs --strict --typed` (since the layouts emit the
  JSON-LD graph).

### S15 — Lighthouse budget not regressed

- **GIVEN** the post-change tree
- **WHEN** `pnpm perf:budget` runs against the docs template (and
  `apps/docs/` as the canonical scaffolded mirror)
- **THEN** Performance, Accessibility, Best Practices, and SEO are
  each ≥ 95 on the docs landing (`/`) and one inner docs page
  (`/getting-started` or equivalent); LCP / INP / CLS / TBT / total
  compressed transfer on `/` stay inside the `templates-perf` budget;
  Beasties continues to inline above-the-fold CSS into the HTML head.
  The implementer captures the report under
  `openspec/changes/migrate-docs-template-to-tailwind-css/runs/<ts>/
perf.txt`.

### S16 — Changeset documents the migration

- **GIVEN** the post-change tree
- **WHEN** `.changeset/` is listed
- **THEN** a new changeset documents the docs-template Tailwind-
  primary migration: it summarizes the source-tree rewrite, notes that
  no runtime behaviour changes for end users, and bumps `astro-ignite`
  minor (and `create-astro-ignite` minor if applicable) per the
  workspace's changeset convention.
