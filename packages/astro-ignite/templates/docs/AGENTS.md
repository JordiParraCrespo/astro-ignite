# AGENTS.md

Orientation for AI agents working in this codebase. Subject-specific deep dives are under [`docs/`](./docs/).

`CLAUDE.md` in this repo is a symlink to this file.

## What this project is

A documentation site scaffolded from [astro-ignite](https://github.com/JordiParraCrespo/astro-ignite). It is **not** built on Starlight — the docs primitives (TOC, sidebar, search, prev/next) are composed from the astro-ignite base components, owned by this repo and editable.

The site ships with: docs content collection, full-text search, sidebar + TOC, light/dark mode, sitemap, robots, i18n with parallel routes.

## Stack snapshot

- **Astro 7** — static output (no adapter; this template has no server-side Actions)
- **Tailwind v4** — single styling layer; component colors resolve through `--color-*` tokens via arbitrary-value utilities (`bg-[var(--color-fg)]`). `inlineStylesheets: 'always'` inlines the full stylesheet on first paint.
- **System font stack** (`ui-sans-serif` / `ui-monospace`) — zero font fetches, zero CLS. Geist Sans + Mono isn't wired: `global.css` points `--font-display`/`--font-mono` at the plain family names, not the hashed ones Astro's font integration emits, so no `@font-face` matches — see the comment in `BaseLayout.astro` for how to re-enable it.
- **schema-dts** typed JSON-LD composed via `@graph`
- **No client framework** — interactive primitives are Astro + vanilla JS / native HTML

## Invariants — do not violate

1. **i18n with parallel routes.** Default locale at `/`, non-default at `/[lang]/`. Docs entries live at `src/content/docs/{locale}/{slug}.mdx`. The route files `src/pages/[...slug].astro` and `src/pages/[lang]/[...slug].astro` filter by id prefix to emit the correct set. Default `siteConfig.locales` ships as `['en']` — parallel routes stay dormant until a second locale is added.
2. **Internal links go through `getRelativeLocaleUrl(lang, path)`** — never hardcode `/getting-started`.
3. **LocaleSwitcher in chrome** — hide nav items that have no localized entry.
4. **Tailwind-first styling, token-resolved.** Component colors / spacing / typography ship as Tailwind v4 utilities that resolve `--color-*` tokens (`bg-[var(--color-bg)]`, `text-[var(--color-fg-muted)]`). Scoped `<style>` blocks are reserved for what Tailwind cannot express — keyframe animations, view-transition selectors, runtime-dynamic CSS computed from component props, MDX prose targeting `<slot/>` content — and each such block carries a leading `<!-- tailwind-exception: <reason> -->` comment naming what Tailwind cannot express. `inlineStylesheets: 'always'` puts the full stylesheet in the HTML on first paint, so there is no separate critical-CSS extraction step.
5. **Design tokens only.** Components reference `--color-bg`, `--color-fg`, `--color-primary`, `--color-border`, etc. — never raw zinc scale. Tri-state dark mode flips token values via a `.light` class.
6. **JSON-LD composes via `@graph`.** Each page contributes its node.
7. **No new runtime deps without justification.** The perf pitch is built on a small owned codebase.

## Routes

```
src/pages/
├── index.astro                   # / — docs landing
├── [...slug].astro               # /<slug> — default-locale docs
├── [...slug].md.ts               # /<slug>.md — raw Markdown for the same entry
├── 404.astro                     # /404 (single emit, no locale parallel)
├── 500.astro                     # /500 (single emit, no locale parallel)
├── legal/[...slug].astro         # /legal/<privacy|terms|cookies>
├── rss.xml.ts                    # /rss.xml (default locale)
├── robots.txt.ts                 # /robots.txt
├── llms.txt.ts                   # /llms.txt (AI-discoverability index)
├── llms-full.txt.ts              # /llms-full.txt (full docs corpus)
└── [lang]/
    ├── index.astro
    ├── [...slug].astro           # /<lang>/<slug>
    ├── 404.astro                 # /<lang>/404
    ├── legal/[...slug].astro
    └── rss.xml.ts                # /<lang>/rss.xml
```

The `[lang]` directory is the canonical name — never use `[locale]` or `[language]`. Param accessor: `Astro.params.lang`.

## Adding docs pages

1. Drop an MDX file at `src/content/docs/{locale}/{slug}.mdx` with frontmatter:
   ```yaml
   ---
   title: Getting started
   description: Install astro-ignite and run the CLI.
   ---
   ```
2. Add it to a group in `src/config/sidebar.ts` — sidebar placement, ordering, and breadcrumbs are all driven by that array, not by frontmatter or folder structure.
3. To translate, copy the file into the target locale folder and translate the body + frontmatter.

The route file enumerates entries via `getCollection('docs', ...)` and filters by id prefix — no manual route registration needed.

## Components

Atoms live in `src/components/ui/` (shadcn-style — copied from the astro-ignite registry, owned by this repo).

- All atoms are Astro + vanilla JS — no React, no Radix, no framework runtime
- Interactive primitives use native HTML: `<details name>` for accordion, `<dialog>` for dialog, popover API for dropdown, CSS for tooltip, custom elements for tabs/toasts
- Class-merge helper at `src/lib/cn.ts`

## Common commands

```bash
pnpm dev          # local dev server
pnpm build        # production build → dist/
pnpm preview      # preview production build
pnpm typecheck    # astro check
pnpm test         # vitest
pnpm format       # prettier --write
```

## End-to-end tests

The workspace ships a Playwright e2e suite at `tests/e2e/`. Two
Playwright projects cover this template:

- `docs-template` boots `astro dev` and runs every spec under
  `tests/e2e/common/` plus `tests/e2e/docs-template/` (sidebar, MDX,
  search-dialog-dev half).
- `docs-template-built` first runs `astro build && astro preview`
  (so the `postbuild: pagefind --site dist` step has run) and
  exercises the search-with-results spec.

See [`tests/e2e/AGENTS.md`](../../../tests/e2e/AGENTS.md). Scoped run:

```bash
pnpm test:e2e --project=docs-template
pnpm test:e2e --project=docs-template-built
```

## Style of work

- Don't introduce abstractions before the third copy. The template is owned and editable.
- Components have no comments unless the _why_ is non-obvious.
- Audit `src/pages/[lang]/*` whenever you add a route under `src/pages/*`.
- See [`docs/`](./docs/) for FONTS, ANALYTICS, OG, IMAGES, LEGAL, BENCHMARKS deep dives.
