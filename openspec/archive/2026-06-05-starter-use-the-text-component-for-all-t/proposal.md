# Proposal: starter-use-the-text-component-for-all-t

## Why

The `Text` atom already ships in two places:

- `packages/registry/base/text.astro` (the source of truth in the registry)
- `packages/templates/starter/src/components/ui/text.astro` (pre-installed in
  the starter so the template scaffolds with the atom in place)

It exposes a complete variant set — `display`, `h1`–`h4`, `lead`, `body`,
`small`, `muted`, `eyebrow`, `code` — with `tone` and `weight` modifiers,
class merging via `cn`, and an `as` escape hatch. But the starter's pages,
layouts, and below-the-fold components still emit raw `<h1>`–`<h6>` and
`<p>` tags with inline Tailwind typography classes (`text-[clamp(...)]`,
`font-semibold`, `leading-[...]`, `text-fg-muted`, `text-zinc-*` style
soup) or duplicate the typography in scoped `<style>` blocks at the
page level.

The result:

- Typography size/weight/leading is defined in many places: the atom, each
  page's scoped `<style>`, and inline class lists.
- A user customizing the scaffolded site cannot change "what muted body
  text looks like" in one spot. They have to chase every `<p
class="text-... text-fg-muted">` across pages.
- Token-driven color changes only propagate through utilities that map to
  tokens; sizes/weights/leadings encoded in clamp + arbitrary values stay
  pinned per call site.

The 404 page (rebuilt in PR #31) and the `Text` atom itself are the
precedent — every other piece of body copy and heading should follow the
same pattern.

## Scope

In scope (refactor to `<Text>`):

- `packages/templates/starter/src/pages/index.astro` and its `[lang]/`
  parallel — features section heading + the per-card title/body.
- `packages/templates/starter/src/pages/about.astro` and its `[lang]/`
  parallel — page header (h1 + lede) and the hand-rolled `.prose` body
  copy (the `<p>` and `<h2>` rendered directly in the page, not the MDX
  collection content).
- `packages/templates/starter/src/pages/contact.astro` and its `[lang]/`
  parallel — page header (h1 + lede); inline `.field-error` paragraphs.
- `packages/templates/starter/src/pages/blog/index.astro` and its
  `[lang]/` parallel — page header (h1 + lede), empty state, post-card
  title and meta/description copy.
- `packages/templates/starter/src/pages/projects/index.astro` and its
  `[lang]/` parallel — page header (h1 + lede), empty state, project-card
  title and summary.
- `packages/templates/starter/src/components/Footer.astro` — section
  headings (`<h3>`), brand block, copyright/built-with paragraphs.
- `packages/templates/starter/src/components/blocks/not-found-state.astro`
  — code eyebrow, headline, body description.
- `packages/templates/starter/src/layouts/ArticleLayout.astro` —
  article header h1 + meta byline. (The MDX `<slot />` body content
  stays under `.prose` global styles.)
- `packages/templates/starter/src/layouts/ProjectLayout.astro` — project
  header h1 + summary; the meta `<dl>` keeps its semantic markup but body
  text inside `<dd>` may move to `<Text>` where it's purely typographic.
- `packages/templates/starter/src/layouts/LegalLayout.astro` — legal
  header h1 + meta line.
- `packages/registry/base/text.astro` and the starter mirror
  `packages/templates/starter/src/components/ui/text.astro` — extended in
  lockstep only if a variant the refactor needs is missing (e.g. a meta
  byline variant). Keep extensions minimal.

Out of scope:

- `packages/templates/starter/src/components/Hero.astro` — above-the-fold
  hero, encapsulates typography in a scoped `<style>` block (precedent for
  the issue's exception). Stays as-is.
- `packages/templates/starter/src/components/Nav.astro` — above-the-fold
  chrome, scoped `<style>` block. Nav-link copy is chrome, not body.
- `packages/templates/starter/src/components/CookieBanner.astro` —
  self-contained component with scoped `<style>` block; aria-described
  title and description are paired with the local CSS for a specific
  banner layout. Stays as-is.
- `packages/templates/starter/src/components/Brand.astro`,
  `ThemeToggle.astro`, `LocaleSwitcher.astro`, `Analytics.astro` — chrome
  controls / no body typography.
- `packages/templates/starter/src/components/seo/*`,
  `src/components/image/*` — no body text.
- `packages/templates/starter/src/components/ui/*` other than `text.astro`
  itself — these are the atom set; their typography is the atom contract
  (e.g. `card-title.astro`, `card-description.astro`, `alert.astro`,
  `dialog-title.astro` already centralise their type). Atoms remain
  the building blocks; `<Text>` does not replace `<CardTitle>`.
- `packages/templates/starter/src/layouts/BaseLayout.astro` — head/chrome
  wiring, no body copy.
- `packages/templates/starter/src/pages/404.astro` — already uses
  `<Text>` (PR #31). Stays as the precedent.
- `packages/templates/starter/src/pages/blog/[...slug].astro`,
  `projects/[...slug].astro`, `legal/[...slug].astro` and their `[lang]/`
  parallels — render-only entry points that delegate to a layout. No
  typography of their own.
- MDX rendered through `<slot />` (the `.prose` global styles in
  `ArticleLayout` and `LegalLayout`). The remark/rehype pipeline is not
  in scope; users who write MDX still get `<h1>`/`<p>` from markdown.
- `apps/site`, `apps/docs`, `apps/playground`, `packages/templates/docs`
  — the issue explicitly limits scope to `packages/templates/starter/`.
  Mirrors stay frozen here; if the user later wants the marketing site to
  follow, it's a separate change.

## Scenarios

### S1 — Every page under `src/pages/` uses `<Text>` for body and headings

- **GIVEN** any file under
  `packages/templates/starter/src/pages/**/*.astro` that renders body
  copy or headings outside `[...slug].astro` collection entry points
- **WHEN** the file is inspected
- **THEN** the file imports `Text` from `@/components/ui/text.astro` and
  every `<h1>`–`<h6>` or `<p>` that previously carried inline typography
  classes (size/weight/leading/color) is replaced by `<Text variant="...">`;
  there are no remaining raw heading or `<p>` tags inside the page body
  that pair an inline typography utility soup (`text-[`, `text-lg`,
  `text-sm`, `text-xs`, `leading-`, `font-medium|semibold|bold|normal`,
  `tracking-`) with the element. (Layout-only classes like `mb-4`,
  `mt-0.5`, `text-center` may remain on wrappers; the rule is "no
  typography sizing/weighting on raw heading/p elements".)

### S2 — Every section/component under `src/components/` that renders body text uses `<Text>`

- **GIVEN** any file under
  `packages/templates/starter/src/components/**/*.astro` that renders
  body copy
- **WHEN** the file is inspected
- **THEN** body copy is wrapped in `<Text>`, **except** for the explicit
  allow-list of self-encapsulated components: `Hero.astro`, `Nav.astro`,
  `CookieBanner.astro`, `Brand.astro`, `ThemeToggle.astro`,
  `LocaleSwitcher.astro`, `Analytics.astro`, anything under
  `src/components/ui/` (atoms), `src/components/seo/`, and
  `src/components/image/`. The `blocks/not-found-state.astro` block uses
  `<Text>` for its eyebrow, headline, and description.

### S3 — Every layout that renders hand-rolled headings/body uses `<Text>`

- **GIVEN** the three specialized layouts
  (`ArticleLayout.astro`, `ProjectLayout.astro`, `LegalLayout.astro`)
- **WHEN** they are inspected
- **THEN** their hand-rolled header `<h1>` and meta/summary `<p>` are
  rendered via `<Text>`. The MDX `<slot />` rendered through `.prose`
  global styles is unchanged (out of scope, see Proposal).

### S4 — No typography utility soup on raw heading/`<p>` elements

- **GIVEN** the modified working tree
- **WHEN** the implementer runs
  `grep -REn '<(h[1-6]|p)\b[^>]*class="[^"]*\\b(text-\\[|text-(lg|sm|xs|base|2xl|3xl|4xl|5xl|6xl)|leading-|font-(medium|semibold|bold|normal)|tracking-)[^"]*"' packages/templates/starter/src/`
- **THEN** matches occur only inside the allow-listed scoped-style
  components (`Hero.astro`, `Nav.astro`, `CookieBanner.astro`, and
  `src/components/ui/*` atom sources). No page, no layout, and no
  non-allow-listed component matches.

### S5 — Text atom extensions land in registry and starter copy in lockstep

- **GIVEN** the refactor needs a typography variant that the current
  `Text` atom does not express
- **WHEN** the implementer adds it
- **THEN** the same variant (same name, same classes) is added to both
  `packages/registry/base/text.astro` and
  `packages/templates/starter/src/components/ui/text.astro`; a
  `diff -u` between the two files shows no divergence except the import
  path for `cn` (registry uses `@/lib/cn` after copy; in the source it
  may use a relative path). If no variant needs adding, both files stay
  byte-for-byte identical to their current state.

### S6 — `templates-css-tokens` I1 stays green

- **GIVEN** the modified tree
- **WHEN** `node scripts/audit/tokens-only.mjs` runs from the repo root
- **THEN** it exits 0 (no raw `bg-zinc-*`, `text-zinc-*`, or hex literals
  in component / page files).

### S7 — `templates-css-tokens` I4 (layered CSS) stays green

- **GIVEN** the modified tree
- **WHEN** `node scripts/audit/tokens-only.mjs --layered` runs
- **THEN** it exits 0 (`Hero.astro` and `Nav.astro` still contain
  `<style>` blocks; the refactor does not move above-the-fold styling
  into Tailwind utilities).

### S8 — `registry-atoms` I1–I4 stay green after any Text-atom extension

- **GIVEN** the modified tree (with or without Text-atom extensions)
- **WHEN** `node scripts/audit/no-react-in-atoms.mjs --named-only --registry --family-layout`
  runs
- **THEN** it exits 0. `text.astro` keeps its named export contract, the
  registry entry still lists `cn` as a dependency, no React/Vue/Svelte
  import is added.

### S9 — Whole audit suite is green for this change

- **GIVEN** the modified tree
- **WHEN** `pnpm audit:invariants --change starter-use-the-text-component-for-all-t`
  runs
- **THEN** it exits 0 across the dispatched audits.

### S10 — Scaffold smoke + perf budget pass

- **GIVEN** the modified tree
- **WHEN** `pnpm scaffold:test` runs (regenerates `apps/playground/`
  from the starter, runs Lighthouse)
- **THEN** it exits 0 and the Lighthouse budget recorded by the harness
  is not regressed.

### S11 — Boundary: only the starter (and the registry Text atom mirror) is touched

- **GIVEN** the modified tree against `main`
- **WHEN** `git diff --name-only main` runs
- **THEN** every changed file is under
  `packages/templates/starter/` or is
  `packages/registry/base/text.astro`. No file under `apps/`, no file
  under `packages/templates/docs/`, no other registry file is modified.
