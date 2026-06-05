# Proposal: docs-use-the-text-component-for-all-typo

## Why

The `Text` atom already ships in the registry and was rolled out across
the starter template in PR #33 (the `starter-use-the-text-component-for-all-t`
change). Every starter heading, lede, body, muted, and eyebrow now flows
through one Astro file with a typed `variant` prop. The docs template
(`packages/templates/docs/`) was deliberately scope-excluded from that
change. Its pages, components, and layouts still emit raw
`<h1>`/`<h2>`/`<p>` paired with inline Tailwind typography utilities
(`text-2xl font-semibold`, `text-base text-fg-muted`, `text-sm`) or with
hand-rolled scoped-style rules (`docs-header h1`, `docs-lede`,
`legal-header h1`, `legal-meta`, `showcase__title`, `showcase__desc`,
`sidebar-group-title`, `cookie-banner h2`, `cookie-banner p`).

The result is the same fragmentation the starter had:

- Typography size / weight / leading is duplicated across the atom (in
  the registry, not yet copied into the docs template), `DocsLayout`'s
  scoped block, `LegalLayout`'s scoped block, `ComponentShowcase`'s
  scoped block, `SidebarNav`'s scoped block, and `CookieBanner`'s scoped
  block.
- A user customizing the scaffolded docs site cannot change "what muted
  meta text looks like" in one spot — they must chase each per-component
  scoped rule.
- The registry atom is the canonical source of truth, but the docs
  template doesn't even own a copy yet (there is no
  `packages/templates/docs/src/components/ui/` folder), so scaffolds of
  the docs template never receive the atom.

This change mirrors the starter consolidation onto the docs template
and its scaffolded copy in `apps/docs/`, completing the alignment.

## Scope

In scope (refactor to `<Text>`):

- **Atom copy.** Create
  `packages/templates/docs/src/components/ui/text.astro` (and the
  enclosing `ui/` directory). Contents byte-for-byte mirror
  `packages/registry/base/text.astro`, except for any
  trivially-template-mechanical differences (the `cn` import path the
  source file uses; the starter mirror at
  `packages/templates/starter/src/components/ui/text.astro` is the
  reference for the expected divergence). The shadcn-style
  `registry.json` entry for `text` already targets
  `src/components/ui/text.astro`, so installing the atom into the docs
  template requires no manifest change.
- **Layouts.**
  - `packages/templates/docs/src/layouts/DocsLayout.astro` — the docs
    header `<h1>` and `<p class="docs-lede">` move to `<Text>`. The
    `.docs-prose` `<style is:global>` block stays (it covers the
    MDX-rendered body, which is out of scope per the issue).
  - `packages/templates/docs/src/layouts/LegalLayout.astro` — the legal
    header `<h1>` and `<p class="legal-meta">` move to `<Text>`. The
    `.legal-prose` global rules stay.
- **Components (visible typography).**
  - `packages/templates/docs/src/components/docs/ComponentShowcase.astro`
    — `<h1 class="showcase__title">` and `<p class="showcase__desc">`
    move to `<Text>`. The eyebrow-style "Install" label and the back
    link stay as chrome (they're not body typography).
  - `packages/templates/docs/src/components/docs/SidebarNav.astro` — the
    `<h2 class="sidebar-group-title mono">` for each sidebar group moves
    to `<Text variant="eyebrow" as="h2">` (the variant already
    matches the upper-case, letter-spaced look). The link list inside
    `<ul>` is nav chrome and stays.
  - `packages/templates/docs/src/components/legal/CookieBanner.astro` —
    the banner `<h2>` and `<p>` move to `<Text>`. The banner is a
    self-contained component, but its typography is body copy, not
    above-the-fold marketing chrome; aligning it with `<Text>` matches
    the starter precedent for the cookie banner exception (which kept
    its scoped styles because the starter banner has bespoke
    aria-described layout — but the docs banner is structurally
    identical to body copy, so it follows the rule, not the exception;
    see "Rejected alternative" in `design.md` for the careful version
    of this).
- **Pages.** Every page under
  `packages/templates/docs/src/pages/**/*.astro` is inspected. As of
  today, every docs page (`index.astro`, `[...slug].astro`,
  `legal/[...slug].astro`, plus the `[lang]/` parallels) delegates to
  `DocsLayout` or `LegalLayout` and renders no inline `<h*>`/`<p>`
  outside the layout, so the page-level sweep is a no-op assertion (T1
  inventory confirms zero raw heading / p elements). If a future page
  is added before this change merges, it gets the same treatment as the
  layout.
- **Apps mirror.** Mirror every change in `apps/docs/src/**/*.astro`
  per the workspace's apps-mirror-templates rule (apps don't
  auto-update). The apps copy adds its own
  `apps/docs/src/components/ui/text.astro` (the `ui/` folder already
  exists in `apps/docs/src/components/`, see `dialog-title.astro`,
  `card-description.astro`, etc.). The sweep covers the same surfaces
  in the apps tree, plus `apps/docs/src/components/blocks/not-found-state.astro`
  (its h1 + p) and `apps/docs/src/pages/components/index.astro`'s
  `cat__eyebrow`, `cat__title`, `cat__lede`, `grp__lede`, group `h2`/
  `h3` titles (which is page-level marketing copy, not MDX). The
  `apps/docs/src/components/ui/*` atoms (`dialog-title.astro`,
  `card-description.astro`, `dialog-description.astro`) keep their
  typography utilities — they are the atom set, not consumers.
- **Atom extension (only if a refactor surface needs a variant the
  atom can't express).** If the implementer hits a typography pattern
  none of `display | h1 | h2 | h3 | h4 | lead | body | small | muted |
eyebrow | code` covers, extend the variant set in all three places
  in lockstep:
  `packages/registry/base/text.astro`,
  `packages/templates/starter/src/components/ui/text.astro`, and the
  new `packages/templates/docs/src/components/ui/text.astro`. The
  starter mirror must move with the registry change so the existing
  starter pages remain on the same atom contract; this is consistent
  with the `S5` lockstep scenario inherited from the starter spec.

Out of scope:

- **MDX content** authored as markdown (`# Heading`, prose paragraphs)
  in `src/content/docs/{locale}/**/*.mdx` and
  `src/content/legal/**/*.mdx`. Those render through Astro's MDX
  pipeline against the `.docs-prose` / `.legal-prose` global stylesheets
  in the layouts. Routing MDX through `<Text>` requires a
  remark/rehype plugin or `mdx: { components }` mapping — that's a
  separate change with a separate spec.
- **Adding new variants beyond what the refactor needs.** The atom's
  variant set is the same eleven variants used by the starter; we
  expect the docs sweep to need zero additions (the eyebrow-style
  sidebar group title maps to `eyebrow`; the meta line in legal maps
  to `muted` or `small`; the showcase title maps to `h1` with `as`
  override if the mono-cased look needs preserving — but layout-only
  classes can keep that without growing the variant API). The atom
  extension path stays open as an escape hatch (see S5).
- **Restructuring component organization.** Whether `components/docs/`,
  `components/common/`, and `components/legal/` should be reorganized
  is the subject of the open `restructure-starter-template-component-o`
  issue (id 8 in `feature_list.json`). This change does not move
  files; it only edits in place.
- `apps/site`, `apps/playground`, `packages/templates/starter/` (except
  the starter mirror of the atom if an extension is needed) —
  out-of-scope mirrors. `apps/playground/` regenerates via CI.

## Scenarios

### S1 — `<Text>` atom is installed in the docs template

- **GIVEN** the docs template at
  `packages/templates/docs/src/`
- **WHEN** the file
  `packages/templates/docs/src/components/ui/text.astro` is opened and
  diffed against `packages/registry/base/text.astro`
- **THEN** the only differences are the `cn` import path mechanics that
  also differ between the registry source and the starter mirror at
  `packages/templates/starter/src/components/ui/text.astro` (i.e. no
  divergence in the variant union, `defaultTag`, `variantClasses`,
  `toneClasses`, `weightClasses`, or the `Props` shape).

### S2 — Every docs page renders body copy and headings through `<Text>` or a layout that does

- **GIVEN** any file under
  `packages/templates/docs/src/pages/**/*.astro`
- **WHEN** the file is inspected
- **THEN** it either (a) delegates rendering to a layout that itself
  uses `<Text>` for its headings/lede, or (b) it imports `Text` from
  `@/components/ui/text.astro` and every `<h1>`–`<h6>` / `<p>` that
  previously carried inline typography classes (size/weight/leading/
  color) is replaced by `<Text variant="...">`. No page-body raw
  heading or `<p>` carrying a typography utility soup remains.

### S3 — Every visible-typography component under `src/components/` uses `<Text>`

- **GIVEN** the components affected by the issue's scope —
  `components/docs/ComponentShowcase.astro`,
  `components/docs/SidebarNav.astro`,
  `components/legal/CookieBanner.astro`
- **WHEN** each is inspected
- **THEN** its hand-rolled heading and body-copy `<p>` are rendered via
  `<Text>` (showcase title → `<Text variant="h1">` with the mono-cased
  layout class preserved as a wrapper class; showcase description →
  `<Text variant="lead">`; sidebar group title → `<Text variant="eyebrow"
as="h2">`; cookie banner title → `<Text variant="h4" as="h2">` or the
  closest banner-appropriate variant; cookie banner description →
  `<Text variant="muted">`). Components in the allow-list — `src/
components/ui/*` (atoms), `src/components/seo/*`, `src/components/
image/*`, and chrome controls without body typography (`Brand`,
  `ThemeToggle`, `LocaleSwitcher`, `Analytics`) — are not touched.

### S4 — Layouts route their hand-rolled headings/body through `<Text>`

- **GIVEN** `DocsLayout.astro` and `LegalLayout.astro`
- **WHEN** each is inspected
- **THEN** the header `<h1>` and the meta/lede `<p>` (`.docs-lede`,
  `.legal-meta`) are rendered via `<Text>`. The
  `<style is:global>.docs-prose` and `<style is:global>.legal-prose`
  blocks stay untouched — they cover MDX rendering, which is out of
  scope.

### S5 — Atom extensions land in registry, starter mirror, and docs mirror in lockstep

- **GIVEN** the refactor needs a typography variant that the current
  `Text` atom does not express
- **WHEN** the implementer adds it
- **THEN** the same variant (same name, same classes) is added to
  `packages/registry/base/text.astro`,
  `packages/templates/starter/src/components/ui/text.astro`, AND
  `packages/templates/docs/src/components/ui/text.astro`. A pair-wise
  `diff -u` between any two of them shows no divergence except the
  `cn` import path. If no variant needs adding, all three files stay
  byte-for-byte at their post-S1 state.

### S6 — No typography utility soup on raw heading/`<p>` elements outside the allow-list

- **GIVEN** the modified working tree
- **WHEN** the implementer runs
  `grep -REn '<(h[1-6]|p)\b[^>]*class="[^"]*\b(text-\[|text-(lg|sm|xs|base|2xl|3xl|4xl|5xl|6xl)|leading-|font-(medium|semibold|bold|normal)|tracking-)[^"]*"' packages/templates/docs/src/`
- **THEN** matches occur only inside `src/components/ui/*` (atom
  sources). No page, no layout, no `components/docs/*`, no
  `components/common/*`, no `components/legal/*` and no
  `components/seo/*` matches.

### S7 — `templates-css-tokens` I1 stays green

- **GIVEN** the modified tree
- **WHEN** `node scripts/audit/tokens-only.mjs` runs from the repo root
- **THEN** it exits 0 (no raw `bg-zinc-*`, `text-zinc-*`, or hex
  literals in component / page files of the docs template).

### S8 — `templates-css-tokens` I4 (layered CSS) stays green

- **GIVEN** the modified tree
- **WHEN** `node scripts/audit/tokens-only.mjs --layered` runs
- **THEN** it exits 0. The audit's hard-coded above-the-fold allow-list
  (`Hero.astro`, `Header.astro`, `Nav.astro`) is unchanged; none of
  those three files in the docs template gain or lose a `<style>`
  block (the docs template has no `Hero.astro` or `Nav.astro`; its
  above-the-fold chrome is `SidebarNav.astro` whose scoped block
  stays).

### S9 — `registry-atoms` I1–I4 stay green after any Text-atom extension

- **GIVEN** the modified tree (with or without Text-atom extensions)
- **WHEN** `node scripts/audit/no-react-in-atoms.mjs --named-only --registry --family-layout`
  runs
- **THEN** it exits 0. `text.astro` (and its mirrors) keep their named
  export contract; the registry entry still lists `cn` as a
  dependency; no React/Vue/Svelte import is added.

### S10 — Whole audit suite is green for this change

- **GIVEN** the modified tree
- **WHEN** `pnpm audit:invariants --change docs-use-the-text-component-for-all-typo`
  runs
- **THEN** it exits 0 across the dispatched audits (modulo any
  pre-existing baseline failures already documented for prior
  changes, captured in the run log).

### S11 — Scaffold smoke + perf budget pass

- **GIVEN** the modified tree
- **WHEN** `pnpm scaffold:test` and
  `pnpm perf:budget --change docs-use-the-text-component-for-all-typo`
  run
- **THEN** both exit 0 (within the environmental caveat captured in
  the prior change's `perf.md` for sandboxes lacking a Lighthouse /
  Chrome binary). Lighthouse mobile Performance / Accessibility /
  Best Practices / SEO are ≥ 95 on `/`, on a representative docs slug
  (e.g. `/getting-started`), and on a legal page (`/legal/privacy`).

### S12 — `apps/docs/` mirrors the docs template typography sweep

- **GIVEN** the modified tree against `main`
- **WHEN** the files touched in
  `packages/templates/docs/src/**/*.astro` are compared to their
  counterparts in `apps/docs/src/**/*.astro`
- **THEN** every file that received a `<Text>` replacement in the
  template has the equivalent replacement in `apps/docs/`. The atom
  file at `apps/docs/src/components/ui/text.astro` exists and mirrors
  the same content as the template copy. The apps-specific pages
  (`apps/docs/src/pages/components/index.astro`, the per-component
  `apps/docs/src/pages/components/*.astro` showcases, the per-block
  `apps/docs/src/pages/blocks/*.astro` pages, and
  `apps/docs/src/components/blocks/not-found-state.astro`) — surfaces
  that don't exist in the template — also flow through `<Text>` where
  they emit body copy or headings, except inside `ui/` atoms.

### S13 — Boundary: only docs template + docs app (+ optional lockstep atom mirror) are touched

- **GIVEN** the modified tree against `main`
- **WHEN** `git diff --name-only main -- ':!openspec' ':!.changeset'`
  runs
- **THEN** every changed file is under
  `packages/templates/docs/`,
  `apps/docs/`,
  `packages/registry/base/text.astro` (only if S5 fired), or
  `packages/templates/starter/src/components/ui/text.astro` (only if
  S5 fired). No `apps/site/**`, no `apps/playground/**`, no other
  template's `src/**` is modified. The `apps/playground/` mirror is
  regenerated by CI separately (`pnpm scaffold:test`) and is not
  hand-edited here.
