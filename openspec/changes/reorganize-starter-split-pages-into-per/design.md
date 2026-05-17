# Design: reorganize-starter-split-pages-into-per

## Files touched

Pages refactored to composition-only (frontmatter + layout wrapper +
section imports; scoped `<style>` blocks removed and migrated into their
section component):

- MOD `packages/templates/starter/src/pages/index.astro`
- MOD `packages/templates/starter/src/pages/[lang]/index.astro`
- MOD `packages/templates/starter/src/pages/about.astro`
- MOD `packages/templates/starter/src/pages/[lang]/about.astro`
- MOD `packages/templates/starter/src/pages/contact.astro`
- MOD `packages/templates/starter/src/pages/[lang]/contact.astro`
- MOD `packages/templates/starter/src/pages/blog/index.astro`
- MOD `packages/templates/starter/src/pages/[lang]/blog/index.astro`
- MOD `packages/templates/starter/src/pages/projects/index.astro`
- MOD `packages/templates/starter/src/pages/[lang]/projects/index.astro`
- MOD `packages/templates/starter/src/pages/404.astro`

New section components (one section per file):

- NEW `packages/templates/starter/src/components/sections/landing/FeaturesGrid.astro`
  — the six-cell features grid currently inlined in `index.astro`
  (frontmatter holds the `features` array; component accepts it as a
  prop or builds it from `useTranslations`).
- NEW `packages/templates/starter/src/components/sections/about/AboutBody.astro`
  — page header (h1 + lede) + the prose `<article>` + scoped `<style>`
  block from `about.astro`.
- NEW `packages/templates/starter/src/components/sections/contact/ContactSection.astro`
  — page header + alert blocks + `<form method="POST" action={actions.contact}>`
  - honeypot + submit `<Button>` + scoped `<style>` block from
    `contact.astro`. Accepts the `result` / `inputError` derived from
    `Astro.getActionResult(actions.contact)` as a prop.
- NEW `packages/templates/starter/src/components/sections/blog/BlogIndexList.astro`
  — page header + the post `<ul>` (or empty state) + scoped `<style>`
  block from `blog/index.astro`. Accepts the prepared
  `postCards: PostCard[]` array as a prop. The `PostCard` type lives
  next to the component or in `src/lib/blog.ts` (implementer's call).
- NEW `packages/templates/starter/src/components/sections/projects/ProjectsIndexList.astro`
  — same pattern as `BlogIndexList.astro`, sourced from
  `projects/index.astro`.
- NEW `packages/templates/starter/src/components/sections/not-found/NotFoundHero.astro`
  — the `<section class="not-found">` from `404.astro`, plus its scoped
  `<style>` block.

Unchanged (in this change):

- `packages/templates/starter/src/components/Hero.astro` — the existing
  landing hero atom; reused by `index.astro` / `[lang]/index.astro`
  as-is.
- `packages/templates/starter/src/components/blocks/not-found-state.astro`
  — orthogonal block already in the tree; the new `NotFoundHero.astro`
  may either consume it or sit beside it. If `not-found-state.astro` is
  already the 404 section in some form, `404.astro` simply imports it
  and no new `NotFoundHero.astro` file is added. Implementer picks one
  shape and updates tasks.md accordingly; the spec only requires that
  the 404 page is composition-only and the section markup lives in
  exactly one component file.
- `src/pages/blog/[...slug].astro`, `src/pages/projects/[...slug].astro`,
  `src/pages/legal/[...slug].astro`, `src/pages/[lang]/blog/[...slug].astro`,
  `src/pages/[lang]/projects/[...slug].astro`,
  `src/pages/[lang]/legal/[...slug].astro` — already composition-only.
- All chrome (`Nav.astro`, `Footer.astro`, `BaseLayout.astro`,
  `ArticleLayout.astro`, `LegalLayout.astro`, `LocaleSwitcher.astro`,
  `Brand.astro`, `ThemeToggle.astro`, `CookieBanner.astro`,
  `Analytics.astro`).
- `package.json` — no dep changes (see "Performance budget").

No `DEL`. Files are refactored in place; the section content moves, but
the original file paths persist.

## New signatures

Each section component takes the data its page used to build inline. The
contract is small and lives in the page-level frontmatter — there is no
new `lib/` API. Indicative shapes (final names are the implementer's):

```ts
// FeaturesGrid.astro
interface Props {
  heading: string;
  features: { index: string; tag: string; title: string; body: string }[];
}

// AboutBody.astro
interface Props {
  title: string;
  lede: string;
  body: {
    p1: string;
    p2: string;
    heading: string;
    items: [string, string, string];
  };
}

// ContactSection.astro
import type { SafeResult } from 'astro:actions';
interface Props {
  title: string;
  lede: string;
  result: SafeResult<typeof actions.contact> | undefined;
  inputError: ReturnType<typeof isInputError> extends infer T ? T : never;
  t: (key: TranslationKey) => string;
}
// (the `t` shape mirrors what `useTranslations(locale)` returns; the
// implementer may instead call `useTranslations(Astro.currentLocale)`
// inside the component — see "Localization wiring inside sections".)

// BlogIndexList.astro
interface Props {
  title: string;
  lede: string;
  emptyMessage: string;
  postCards: PostCard[];
}

// ProjectsIndexList.astro
interface Props {
  title: string;
  lede: string;
  emptyMessage: string;
  projectCards: ProjectCard[];
}
```

### Localization wiring inside sections

Two acceptable patterns; the implementer picks one and applies it
consistently:

1. **Pass strings down.** Page frontmatter calls
   `const t = useTranslations(locale)` and passes resolved strings
   (`title`, `lede`, `emptyMessage`) as props. Section component does
   no i18n itself. Easier to test, makes string usage greppable.
2. **Section calls `useTranslations` itself.** Page passes only the
   prepared collection data (`postCards`, `features`); section
   re-derives `locale = Astro.currentLocale ?? siteConfig.defaultLocale`
   and calls `useTranslations(locale)` for its own copy keys. Avoids
   prop drilling at the cost of repeating two lines per section.

Either is invariant-safe (the `templates-i18n` audit checks parallel
routes and `getRelativeLocaleUrl` for _links_, not where translation
strings are read). Implementer notes the chosen pattern in
`runs/<ts>/notes.md`.

## Composition shape (illustrative)

After the refactor, `src/pages/about.astro` shrinks to roughly:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import AboutBody from '@/components/sections/about/AboutBody.astro';
import { useTranslations } from '@/i18n';
import { siteConfig } from '@/config/site';
import { aboutPageSchema, breadcrumbListSchema } from '@/lib/jsonld';

const locale = Astro.currentLocale ?? siteConfig.defaultLocale;
const t = useTranslations(locale);

const schemas = [
  breadcrumbListSchema([
    { name: t('nav.home'), url: '/' },
    { name: t('nav.about'), url: '/about' },
  ]),
  aboutPageSchema({
    url: '/about',
    title: t('seo.about.title'),
    description: t('seo.about.description'),
    inLanguage: locale,
  }),
];
---

<BaseLayout title={t('seo.about.title')} description={t('seo.about.description')} schemas={schemas}>
  <AboutBody />
</BaseLayout>
```

`src/pages/[lang]/about.astro` is identical except for the
`getStaticPaths` block at the top — the same `<AboutBody />` import is
used.

## Invariants this change touches

This change is structural, not behavioural. It must hold every relevant
invariant from the four cited capabilities — those become the regression
fences.

### `templates-i18n`

- **I1 (default locale at `/`, non-default at `/[lang]/`)** — preserved.
  No routes move; only the inside of each page changes.
- **I2 (every page has a `[lang]` parallel; `getStaticPaths` parity)**
  — preserved. Each `[lang]/<foo>.astro` keeps its existing
  `getStaticPaths` returning `siteConfig.locales.filter(l => l !==
siteConfig.defaultLocale).map(lang => ({ params: { lang } }))`. The
  new requirement layered on top: both files import the same section
  components (see ADDED Requirement in the delta).
- **I5 (`getRelativeLocaleUrl` for internal links)** — preserved.
  `getRelativeLocaleUrl` calls live in
  `blog/index.astro`/`projects/index.astro` page frontmatter today; they
  stay there (they build the `postCards`/`projectCards` props). Section
  components consume already-built URLs; no hardcoded `/about` is
  introduced.

Audit: `pnpm audit:invariants --change reorganize-starter-split-pages-into-per`
runs `scripts/audit/i18n-parallels.mjs` (with `--strict` for
`getStaticPaths` parity) and `scripts/audit/internal-links-localized.mjs`.

### `templates-css-tokens`

- **I1 (no raw zinc / hex in component files)** — preserved. The scoped
  `<style>` blocks moving into the new section components already use
  token variables (`--color-fg`, `--color-fg-muted`, `--color-border`,
  `--color-primary`, `--color-danger`, `--color-success`,
  `--color-surface-2`, `--ease-out-soft`); no rewrite is required, only
  a relocation. The implementer must not introduce zinc or hex while
  doing the move.
- **I4 (above-the-fold uses scoped `<style>`)** — preserved. The
  layered strategy was page-internal before and stays per-component
  after. `Hero.astro` (above the fold on `/`) keeps its scoped block.
  `FeaturesGrid.astro` is below the fold and uses Tailwind utilities
  (it does today, inline in `index.astro`). The new section components
  for about/contact/blog/projects each absorb their page's scoped
  block, so the rule "scoped block lives with the component, not in a
  random page" is more strictly satisfied after the change.

Audit: `scripts/audit/tokens-only.mjs` and
`scripts/audit/tokens-only.mjs --layered` cover I1 and I4 — both must
stay green.

### `templates-seo-jsonld`

- **I1 (layout emits one `@graph` script)** — preserved. JSON-LD
  assembly stays in the page frontmatter (`schemas` array passed to
  `BaseLayout`). The layout still emits a single script.
- **I2 (no page emits standalone JSON-LD outside the layout)** —
  preserved and re-asserted at the section level: no section component
  is allowed to emit its own JSON-LD. This is the ADDED Requirement in
  the spec delta.
- **I3 (all nodes typed via `schema-dts`)** — preserved. The schema
  helpers in `@/lib/jsonld` are untouched.

Audit: `scripts/audit/jsonld-graph.mjs --strict` and
`scripts/audit/jsonld-graph.mjs --typed`.

### `templates-perf`

- **I1 / I2 (Lighthouse mobile budget on home + one inner page)** —
  must stay ≥ 95 across Performance/Accessibility/Best Practices/SEO.
  Compositional refactor adds no JS and no new CSS — moving a scoped
  block from a page file to a component file is byte-equivalent after
  Astro compilation.
- **I3 (total transfer ≤ 150KB compressed home)** — preserved by
  construction. No new imports.
- **I4 (Beasties critical CSS)** — preserved; Astro build pipeline
  unchanged.
- **I5 (no undeclared runtime dep added)** — explicitly forbidden by
  S6.

Audit: `pnpm perf:budget` runs `scripts/perf/run.mjs` against `/`,
`/blog`, and `--transfer`/`--critical-css`/`--deps`. The implementer
captures the report under `runs/<ts>/perf.txt`.

## Performance budget applicability

The change's capabilities match `/^templates-/`, so the harness rule
`require_perf_budget_to_close_when` applies. Expected impact:

- **JS bundle:** Astro components compile per-page; moving inline JSX
  into a component does not increase bundle size. The starter ships
  zero client framework runtime today; that stays true.
- **CSS:** scoped `<style>` blocks move from page files into the
  components they style. Net byte count is the same; the locality is
  better. Tailwind utility scanning continues to pick up the same class
  set (the markup is the same, the file boundary moved).
- **HTML output:** identical. The rendered DOM tree under
  `<BaseLayout>` is byte-for-byte equivalent up to whitespace
  reformatting from Prettier passes.
- **Critical-CSS extraction:** Beasties inspects the rendered HTML +
  emitted `<style>` blocks; both sets are unchanged. No drift expected.

Risk areas the implementer must verify in the perf run:

- **LCP on `/`** — the H1 inside `Hero.astro` is the LCP candidate;
  refactor must not delay it. Confirm in `runs/<ts>/perf.txt`.
- **CLS** — no images move; the `Image.astro` calls in the post / project
  cards keep their explicit `width`/`height`/`sizes`. Confirm `0.0`
  CLS in the report.
- **Total transfer** — re-check ≤ 150 KB compressed on `/`. The
  implementer may run `node scripts/perf/run.mjs --transfer` to surface
  this number explicitly.

## Rejected alternative — extract a shared `PageHeader.astro`

The about/contact/blog/projects pages all render the same
"`<header class="page-header">` with an `<h1>` and a `<p class="lede">`"
pattern, with slightly different `.page` padding/widths around it. A
fourth-copy threshold would justify a `PageHeader.astro` extraction.

Rejected from the **required** scope because:

1. The CLAUDE.md style guide says "No abstraction before the third copy
   — three similar files beat a premature helper." The third copy
   exists, so it is borderline; but in this case the four pages each
   have _page-specific_ surrounding markup (the about page wraps the
   header inside an `<article>`, the contact page sits alongside an
   alert/form, the blog/projects pages sit above a grid). A
   `PageHeader` extraction would either (a) only carry the inner h1 +
   lede pair and force every page to repeat the wrapper anyway, or (b)
   absorb the wrapper and grow several variant props for the wrapping
   element type and padding sizes. Both shapes are unsatisfying.
2. The acceptance from the issue is _"one section = one component."_ A
   header-only sub-component within a section is an internal optimization
   the implementer may choose, but it is not what the issue asks for.
3. Forcing this extraction now would expand the diff and the surface
   area of the change, complicating the perf-regression bisect if
   something regresses.

The implementer is **allowed** to add `PageHeader.astro` as a private
helper under `src/components/sections/_shared/PageHeader.astro` if it
makes their refactor cleaner — design.md does not prohibit it. The spec
does not require it.

## Rejected alternative — co-locate sections under `src/pages/<page>/sections/`

We considered placing section components next to the page that owns them
(`src/pages/about/sections/AboutBody.astro`, with `index.astro`
sitting in the same folder). Astro would route the `.astro` files
inside `src/pages/about/sections/` unless we suppress them with
underscores, which adds noise. The single-tree approach under
`src/components/sections/<page>/` keeps routing rules untouched.

## Rejected alternative — move sections into the registry

`packages/registry/` is the parts bin for atoms (and eventually blocks).
The sections being extracted here are template-specific:
`AboutBody.astro` reads from `useTranslations` keys that exist only in
the starter (`about.body.p1`, etc.); `BlogIndexList.astro` consumes the
starter's `blog` content collection. Promoting them to the registry
would couple the registry to template-specific i18n keys and content
schemas, which violates the registry boundary in `AGENTS.md`. The
sections stay in the template.

## Out-of-scope mirroring to `apps/site`

The issue explicitly excludes `apps/site/`. `apps/site/` is a
scaffolded-then-curated mirror of the starter; it does **not**
auto-update when the starter changes. After this change merges, a
follow-up issue may mirror the refactor into `apps/site/`. That follow-up
is out of scope here.
