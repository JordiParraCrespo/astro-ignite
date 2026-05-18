# Tasks: migrate-docs-template-to-tailwind-css

Ordering rationale:

- **Migrate layouts first.** Every page renders through
  `BaseLayout` / `DocsLayout` / `LegalLayout`; getting the layouts
  right means every subsequent page render is exercising the
  Tailwind-primary output by the time the implementer inspects it.
- **Migrate chrome (`common/*`, `legal/*`) next.** The chrome is the
  set the layouts import directly; layouts and chrome together cover
  the entire "site shell" surface.
- **Migrate the docs-specific bucket (`docs/*`) third.** Sidebar /
  TOC / breadcrumbs / prev-next / search-box / code-block / callout /
  component-showcase are leaf surfaces — they render inside the
  already-migrated layouts.
- **Migrate `image/` and pages last.** These are the smallest surfaces
  and the ones least likely to carry meaningful styling — they round
  out the source tree.
- **Mirror to `apps/docs/` after the template is settled.** The mirror
  copies a known-good layout, file by file.
- **Refresh the CLI cache once both source trees are migrated.** The
  `copy-templates.mjs` script is the canonical refresh path; running
  it before the source is fully migrated would produce a stale cache.
- **Run audits / typecheck / scaffold / perf last.** These are the
  regression fences, not the authoring step.

"Covers" labels reference scenarios `S<n>` from `proposal.md` and
invariants `I<n>` from the cited capability specs.

---

## Phase 1 — Docs template: layouts

- [ ] **T1.** Migrate
      `packages/templates/docs/src/layouts/BaseLayout.astro`.
      Inspect for any scoped `<style>` block. Convert layout-shell
      styling (skip link, `<header>` if present, `<main>` wrapper,
      `<footer>` if present) to Tailwind utilities on the elements.
      Any keyframes / OS-level rules stay inline with a one-line
      "Why kept" comment, or are promoted into `global.css` if they
      are reusable. Covers **S1**, **S2**, `templates-css-tokens` I1.

- [ ] **T2.** Migrate
      `packages/templates/docs/src/layouts/DocsLayout.astro`. Convert
      the regular `<style>` block (the docs shell grid, the toolbar,
      the header, tags, meta, lede, prose container) to Tailwind
      utilities on the corresponding elements. Convert responsive
      breakpoints (`@media (max-width: 1024px)`, `@media (max-width:
720px)`) to Tailwind responsive variants (`lg:`, `md:`). Decide the
      MDX-prose treatment per design.md (Option a/b/c) and apply it.
      Record the choice in `runs/<ts>/notes.md`. Covers **S1**, **S2**,
      **S6**, **S7**, `templates-css-tokens` I1, I3.

- [ ] **T3.** Migrate
      `packages/templates/docs/src/layouts/LegalLayout.astro` with
      the same treatment as DocsLayout. Decide whether the MDX-prose
      block is shared with DocsLayout (single source) or duplicated
      and record in `notes.md`. Covers **S1**, **S2**, **S7**.

## Phase 2 — Docs template: chrome (`common/`, `legal/`)

- [ ] **T4.** Migrate
      `packages/templates/docs/src/components/common/Brand.astro`.
      Convert scoped block (logo svg sizing, brand label typography,
      caret affordance referencing `.caret` in `global.css`) to
      Tailwind utilities. Preserve the `.caret` class reference (it
      lives in `global.css`). Covers **S1**, **S2**, **S8**.

- [ ] **T5.** Migrate
      `packages/templates/docs/src/components/common/ThemeToggle.astro`.
      Convert scoped block (button sizing, icon visibility per theme,
      hover state) to Tailwind utilities. The `<script is:inline>`
      body is preserved byte-for-byte. Covers **S1**, **S2**, **S3**,
      **S8**, `templates-css-tokens` I3.

- [ ] **T6.** Migrate
      `packages/templates/docs/src/components/common/LocaleSwitcher.astro`.
      Convert scoped block (popover trigger, dropdown items, active
      marker) to Tailwind utilities. Preserve the popover API
      attributes (`popovertarget`, `popover="auto"`) and the
      `getRelativeLocaleUrl` call sites. Covers **S1**, **S2**,
      **S4**, **S8**, `templates-i18n` I5, I6.

- [ ] **T7.** Migrate
      `packages/templates/docs/src/components/common/Analytics.astro`.
      Inspect for any scoped block (typically minimal — the file
      mainly emits a `<script>` behind a consent guard). Convert any
      block found. Covers **S1**, **S2**.

- [ ] **T8.** Migrate
      `packages/templates/docs/src/components/legal/CookieBanner.astro`.
      Convert scoped block (fixed-bottom banner positioning, button
      row, link styling) to Tailwind utilities. If a slide-in
      keyframe exists, keep it inline with a one-line comment OR
      promote it into `global.css` next to `@keyframes ig-blink`
      (implementer choice; record in `notes.md`). Covers **S1**,
      **S2**, `templates-consent` I2, I3.

## Phase 3 — Docs template: docs-specific bucket

- [ ] **T9.** Migrate
      `packages/templates/docs/src/components/docs/SidebarNav.astro`.
      Convert both scoped blocks (regular + `is:global`). The active-
      state highlight, group-heading typography, external-link icon
      spacing, and sticky positioning become Tailwind utilities on
      the corresponding `<a>` / `<li>` / `<aside>`. The `is:global`
      block, if reaching into `<details name>` internals, is kept-
      and-justified or rewritten via `:global() { @apply … }`.
      Preserve every `getRelativeLocaleUrl` call site. Covers **S1**,
      **S2**, **S4**, **S9**, `templates-i18n` I5.

- [ ] **T10.** Migrate
      `packages/templates/docs/src/components/docs/OnThisPage.astro`.
      Convert scoped block (sticky right rail, heading typography,
      active-link highlight) to Tailwind utilities. The
      IntersectionObserver JS is unchanged. Covers **S1**, **S2**.

- [ ] **T11.** Migrate
      `packages/templates/docs/src/components/docs/Breadcrumbs.astro`.
      Convert scoped block (separator chevron, link typography, hover
      state) to Tailwind utilities. Preserve every
      `getRelativeLocaleUrl` call site. Covers **S1**, **S2**, **S4**,
      `templates-i18n` I5.

- [ ] **T12.** Migrate
      `packages/templates/docs/src/components/docs/PrevNext.astro`.
      Convert scoped block (two-column flex card layout, hover lift,
      arrow positioning) to Tailwind utilities. Preserve every
      `getRelativeLocaleUrl` call site. Covers **S1**, **S2**, **S4**,
      `templates-i18n` I5.

- [ ] **T13.** Migrate
      `packages/templates/docs/src/components/docs/SearchBox.astro`,
      `packages/templates/docs/src/components/docs/CodeBlock.astro`,
      `packages/templates/docs/src/components/docs/Callout.astro`,
      and `packages/templates/docs/src/components/docs/ComponentShowcase.astro`.
      For each, convert scoped block(s) to Tailwind utilities. Shiki
      / `astro-shiki` inline `style` attributes on `<pre>` / `<span>`
      tokens are preserved (highlighter contract). The Callout
      variant prop maps to a small Tailwind class lookup in the
      frontmatter. Covers **S1**, **S2**.

## Phase 4 — Docs template: image bucket and pages

- [ ] **T14.** Migrate the docs-template image components
      (`packages/templates/docs/src/components/image/Image.astro`,
      and `HeroImage.astro` if it carries a scoped block) and the
      page files (`src/pages/index.astro`,
      `src/pages/[lang]/index.astro`,
      `src/pages/[...slug].astro`,
      `src/pages/[lang]/[...slug].astro`,
      `src/pages/legal/[...slug].astro`,
      `src/pages/[lang]/legal/[...slug].astro`). Inspect each for a
      scoped block; convert if found. Pages typically have no body
      styling of their own (they pass through to layouts). Covers
      **S1**, **S2**, **S5**.

## Phase 5 — apps/docs/ mirror

- [ ] **T15.** Migrate `apps/docs/src/layouts/BaseLayout.astro`,
      `apps/docs/src/layouts/DocsLayout.astro`,
      `apps/docs/src/layouts/LegalLayout.astro`, and
      `apps/docs/src/layouts/ComponentsLayout.astro`. Apply the same
      Tailwind rewrite as the template counterparts. The
      `ComponentsLayout.astro` is app-only; treat it with the same
      Tailwind-primary rule. Covers **S10**.

- [ ] **T16.** Migrate the `apps/docs/` chrome
      (`src/components/common/Brand.astro`, `ThemeToggle.astro`,
      `LocaleSwitcher.astro`, `Analytics.astro`,
      `src/components/legal/CookieBanner.astro`). Apply the same
      Tailwind rewrite as the template counterparts. Covers **S10**.

- [ ] **T17.** Migrate the `apps/docs/` docs-specific bucket
      (`src/components/docs/SidebarNav.astro`, `OnThisPage.astro`,
      `Breadcrumbs.astro`, `PrevNext.astro`, `SearchBox.astro`,
      `CodeBlock.astro`, `Callout.astro`, `ComponentShowcase.astro`)
      and the app-only `src/components/blocks/not-found-state.astro`.
      Apply the same Tailwind rewrite. Covers **S10**.

- [ ] **T18.** Migrate `apps/docs/src/components/image/*.astro` and
      the `apps/docs/src/pages/**/*.astro` set (the docs route files
      `index.astro`, `[...slug].astro`, `[lang]/...`, the legal
      pages, `design.astro`, `blocks/index.astro`,
      `blocks/not-found-state.astro`, and the `[lang]/` parallels).
      The 24 demo pages under `pages/components/*.astro` and
      `pages/[lang]/components/*.astro` are inspected and migrated
      file-by-file. The `apps/docs/src/components/ui/*` atoms are
      NOT touched (registry-owned, out of scope). Covers **S10**.

## Phase 6 — CLI template cache

- [ ] **T19.** Run
      `node packages/astro-ignite/scripts/copy-templates.mjs` from
      the repo root. Inspect the resulting diff under
      `packages/astro-ignite/templates/docs/`. Confirm every diff
      matches the source change one-to-one. Commit the cache refresh
      as a single commit with the message
      `"chore(cache): refresh CLI templates/docs after Tailwind migration"`.
      Covers **S11**.

## Phase 7 — Documentation and changeset

- [ ] **T20.** Update `packages/templates/docs/AGENTS.md` (symlinked
      to `CLAUDE.md`): - "Stack snapshot" line: rewrite "Tailwind v4 — layered with
      scoped `<style>` blocks above the fold" to "Tailwind v4 —
      primary styling mechanism; scoped `<style>` only where
      Tailwind cannot express the rule (MDX prose, keyframes,
      reduced-motion media queries in `global.css`)". - Invariant #4 ("Layered CSS"): rewrite to "Tailwind-primary
      CSS" with the new constraint set (tokens only, no raw zinc,
      Beasties inlines critical CSS at build).
      Covers **S13**.

- [ ] **T21.** Audit `apps/docs/AGENTS.md` for stale references to
      the layered-CSS strategy. Rewrite any references to match the
      docs template's new invariant wording. Covers **S13**.

- [ ] **T22.** Add a changeset under
      `.changeset/migrate-docs-template-to-tailwind-css.md`. Body:
      summarize the Tailwind-primary migration of the docs template
      and `apps/docs/`; note that no runtime behaviour changes for
      end users; list the migrated-file count; note that the CLI
      template cache has been refreshed; bump `astro-ignite` minor
      (and `create-astro-ignite` minor if the CLI shape changes,
      otherwise patch / none) per the workspace's changeset
      convention. Covers **S16**.

## Phase 8 — Verification

- [ ] **T23.** Tree audit: for every `.astro` file under
      `packages/templates/docs/src/` and `apps/docs/src/` (excluding
      `apps/docs/src/components/ui/*` and
      `packages/templates/docs/src/components/ui/*` — registry-owned
      out of scope), confirm Tailwind utility classes are the
      primary styling mechanism. For every residual `<style>` block,
      confirm a one-line "Why kept:" comment precedes it explaining
      the reason (MDX prose, keyframes, container query, OS feature).
      Covers **S1**.

- [ ] **T24.** Token audit: grep
      `packages/templates/docs/src/components/` and
      `packages/templates/docs/src/layouts/` (and the equivalent
      `apps/docs/src/` paths) for `bg-zinc-`, `text-zinc-`,
      `border-zinc-`, `ring-zinc-`, `from-zinc-`, `to-zinc-`,
      `via-zinc-`. Confirm zero matches. Grep for 6-digit hex
      literals; confirm only `#000` / `#fff` shorthand survives in
      SVG icon fills. Covers **S2**, `templates-css-tokens` I1.

- [ ] **T25.** Theme-toggle smoke: boot
      `pnpm dev:docs-template`, open a docs page, click the theme
      toggle three times (light → dark → system). Confirm every
      visible token flips at every step. Confirm no Tailwind `dark:`
      variant is required in the source (audit with
      `grep -r "dark:" packages/templates/docs/src/`; the expectation
      is zero matches outside `global.css`'s `@variant dark` line).
      Capture in `runs/<ts>/notes.md`. Covers **S3**,
      `templates-css-tokens` I3.

- [ ] **T26.** Locale-switcher smoke: with
      `siteConfig.locales = ['en', 'es']` (set temporarily in a
      throwaway commit and reverted before the final commit, OR
      tested in a checkout-local config override that the
      implementer does not commit), confirm the migrated
      `LocaleSwitcher.astro` swaps between `/` and `/es/...` via
      `getRelativeLocaleUrl`. Revert the config and capture the
      result in `runs/<ts>/notes.md`. Covers **S4**, **S8**,
      `templates-i18n` I5, I6.

- [ ] **T27.** Run `pnpm format:check`. Confirm exit 0. (If failing
      because the Astro plugin tripped on a migrated file, add the
      file to `.prettierignore` next to the existing entries for
      Astro chrome with `<script is:inline>` — see the
      `restructure-starter-template-component-o` change's pattern.
      Do not bypass the check.) Covers **S14** (format half).

- [ ] **T28.** Run `pnpm typecheck`. Confirm exit 0. Covers **S14**
      (typecheck half).

- [ ] **T29.** Run `pnpm test`. Confirm exit 0. Covers **S14**.

- [ ] **T30.** Run `pnpm audit:invariants --change
migrate-docs-template-to-tailwind-css`. Confirm exit 0. The
      dispatched audits include `tokens-only.mjs`,
      `tokens-only.mjs --layered` (vacuously passes — no Hero /
      Header / Nav in the docs template), `tokens-only.mjs --config`,
      `tokens-only.mjs --darkmode`, `i18n-parallels.mjs` (and
      `--strict`, `--content`, `--config`),
      `internal-links-localized.mjs`,
      `consent-gated-analytics.mjs` (and `--banner`, `--policy`,
      `--boundary`), `jsonld-graph.mjs --strict --typed`. Covers
      **S5**, **S6**, **S14**.

- [ ] **T31.** Run `pnpm scaffold:test` (docs path). The CLI
      scaffolds the docs template into a fresh playground location
      via `pnpm scaffold:test --template docs --full` (or the
      equivalent invocation the harness exposes), installs, builds,
      and runs Lighthouse. Confirm exit 0. Capture the full report
      under `runs/<ts>/scaffold.log`. Covers **S14**.

- [ ] **T32.** Run `pnpm perf:budget` against the docs template
      (and `apps/docs/` as the canonical scaffolded mirror).
      Capture the report under
      `openspec/changes/migrate-docs-template-to-tailwind-css/runs/<ts>/perf.txt`
      with per-page Lighthouse scores for the docs landing (`/`)
      and one inner docs page (`/getting-started` or equivalent),
      plus the `--transfer`, `--critical-css`, `--deps` checks.
      Confirm Performance, Accessibility, Best Practices, and SEO
      each ≥ 95; LCP ≤ 2.0 s, INP ≤ 200 ms, CLS ≤ 0.05, TBT ≤ 200
      ms, total compressed transfer ≤ 150 KB on `/`. Covers **S15**,
      `templates-perf` I1–I5.

- [ ] **T33.** Final boundary check. Run `git diff --name-only main`
      and confirm the touched paths are limited to:
      `packages/templates/docs/`,
      `apps/docs/`,
      `packages/astro-ignite/templates/docs/` (cache refresh from
      T19),
      `.changeset/`,
      `openspec/changes/migrate-docs-template-to-tailwind-css/`,
      and the boundary AGENTS.md files touched in T20–T21. No edits
      outside this set — in particular no edits to
      `packages/templates/starter/`, `packages/registry/`,
      `apps/site/`, `apps/playground/`, or
      `openspec/specs/templates-css-tokens/spec.md` (only the
      change's spec delta should appear under `openspec/changes/.../
specs/`). Covers **S14** (boundary check), **S12** (no new
      runtime deps half — confirmed via `package.json` diffs).
