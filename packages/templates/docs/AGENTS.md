# AGENTS.md

Orientation for AI agents working in this codebase. Subject-specific deep dives are under [`docs/`](./docs/).

`CLAUDE.md` in this repo is a symlink to this file.

## What this project is

A documentation site scaffolded from [astro-ignite](https://github.com/JordiParraCrespo/astro-ignite). It is **not** built on Starlight — the docs primitives (TOC, sidebar, search, prev/next) are composed from the astro-ignite base components, owned by this repo and editable.

The site ships with: docs content collection, full-text search, sidebar + TOC, light/dark mode, sitemap, robots, i18n with parallel routes.

## Stack snapshot

- **Astro 6** — static output (no adapter; this template has no server-side Actions)
- **Tailwind v4** — layered with scoped `<style>` blocks above the fold
- **Geist Sans + Geist Mono** — self-hosted via `astro:fonts`, zero CLS
- **schema-dts** typed JSON-LD composed via `@graph`
- **No client framework** — interactive primitives are Astro + vanilla JS / native HTML

## Invariants — do not violate

1. **i18n with parallel routes.** Default locale at `/`, non-default at `/[lang]/`. Docs entries live at `src/content/docs/{locale}/{slug}.mdx`. The route files `src/pages/[...slug].astro` and `src/pages/[lang]/[...slug].astro` filter by id prefix to emit the correct set. Default `siteConfig.locales` ships as `['en']` — parallel routes stay dormant until a second locale is added.
2. **Internal links go through `getRelativeLocaleUrl(lang, path)`** — never hardcode `/getting-started`.
3. **LocaleSwitcher in chrome** — hide nav items that have no localized entry.
4. **Layered CSS.** Above-the-fold components use scoped `<style>` blocks. Below-the-fold uses Tailwind v4. Beasties extracts critical CSS at build time.
5. **Design tokens only.** Components reference `--color-bg`, `--color-fg`, `--color-primary`, `--color-border`, etc. — never raw zinc scale. Tri-state dark mode flips token values via a `.light` class.
6. **JSON-LD composes via `@graph`.** Each page contributes its node.
7. **No new runtime deps without justification.** The perf pitch is built on a small owned codebase.

## Routes

```
src/pages/
├── index.astro                   # / — docs landing
├── [...slug].astro               # /<slug> — default-locale docs
├── legal/[...slug].astro         # /legal/<privacy|terms|cookies>
├── robots.txt.ts                 # /robots.txt
└── [lang]/
    ├── index.astro
    ├── [...slug].astro           # /<lang>/<slug>
    └── legal/[...slug].astro
```

The `[lang]` directory is the canonical name — never use `[locale]` or `[language]`. Param accessor: `Astro.params.lang`.

## Adding docs pages

1. Drop an MDX file at `src/content/docs/{locale}/{slug}.mdx` with frontmatter:
   ```yaml
   ---
   title: Getting started
   description: Install astro-ignite and run the CLI.
   order: 1 # sidebar ordering within a section
   ---
   ```
2. To group pages in the sidebar, use folder structure: `src/content/docs/{locale}/guide/install.mdx` → appears under "Guide".
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
