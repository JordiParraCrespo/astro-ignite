# AGENTS.md

Orientation for AI agents working in this codebase. The human-facing tour is in [`README.md`](./README.md); subject-specific deep dives are under [`docs/`](./docs/).

## What this project is

An Astro 6 site scaffolded from [astro-ignite](https://github.com/JordiParraCrespo/astro-ignite). It is **not** a framework — every file is owned by this repo and editable. There is no runtime dependency on the scaffolder.

The site ships with: blog + projects content collections, contact form via Astro Actions, tri-state dark mode, cookie consent + Plausible, sitemap, RSS, robots, JSON-LD, i18n with parallel routes.

## Stack snapshot

- **Astro 6** — static-first, server output via `@astrojs/node@^10` (required for Actions)
- **Tailwind v4** — single styling layer; component colors resolve through `--color-*` tokens via arbitrary-value utilities (`bg-[var(--color-fg)]`). `inlineStylesheets: 'always'` inlines the full stylesheet on first paint.
- **Geist Sans + Geist Mono** — self-hosted via `astro:fonts`, zero CLS
- **schema-dts** typed JSON-LD composed via `@graph`
- **No client framework** — interactive primitives are Astro + vanilla JS / native HTML (`<details>`, `<dialog>`, popover API, custom elements)

## Invariants — do not violate

1. **i18n with parallel routes.** Default locale at `/`, non-default at `/[lang]/`. Every page that exists at `/foo` must also exist at `src/pages/[lang]/foo.astro` with `getStaticPaths` emitting one entry per `siteConfig.locales.filter(l => l !== siteConfig.defaultLocale)`. Content collections use `{locale}/{slug}.mdx` folder layout. Default `siteConfig.locales` ships as `['en']` — parallel routes stay dormant until a second locale is added.
2. **Internal links go through `getRelativeLocaleUrl(lang, path)`** — never hardcode `/about`.
3. **LocaleSwitcher in chrome** — hide nav items that have no localized entry.
4. **Tailwind-first styling, token-resolved.** Component colors / spacing / typography ship as Tailwind v4 utilities that resolve `--color-*` tokens (`bg-[var(--color-bg)]`, `text-[var(--color-fg-muted)]`). Scoped `<style>` blocks are reserved for what Tailwind cannot express — keyframe animations, view-transition selectors, runtime-dynamic CSS computed from component props, MDX prose targeting `<slot/>` content — and each such block carries a leading `<!-- tailwind-exception: <reason> -->` comment naming what Tailwind cannot express. `inlineStylesheets: 'always'` puts the full stylesheet in the HTML on first paint, so there is no separate critical-CSS extraction step.
5. **Design tokens only.** Components reference `--color-bg`, `--color-fg`, `--color-primary`, `--color-border`, etc. — never raw zinc scale. The zinc scale at the bottom of `global.css` is the source of token values; tri-state dark mode (`.light` class) flips them.
6. **JSON-LD composes via `@graph`.** Each page contributes its node — don't emit standalone `<script type="application/ld+json">` blocks.
7. **Astro Actions need an adapter.** The template pins `@astrojs/node@^10`. Swap adapters in `astro.config.mjs` for other targets — see README.
8. **Cookie banner + Plausible are consent-gated.** Cookie policy link is required. Plausible only fires after consent.
9. **No new runtime deps without justification.** The perf pitch is built on a small owned codebase.

## Routes

```
src/pages/
├── index.astro                       # /
├── about.astro                       # /about
├── contact.astro                     # /contact
├── 404.astro                         # /404 (single emit, no locale parallel)
├── blog/
│   ├── index.astro                   # /blog
│   └── [...slug].astro               # /blog/<slug>
├── projects/
│   ├── index.astro                   # /projects
│   └── [...slug].astro               # /projects/<slug>
├── legal/[...slug].astro             # /legal/<privacy|terms|cookies>
├── rss.xml.ts                        # /rss.xml (default locale)
├── robots.txt.ts                     # /robots.txt
└── [lang]/                           # mirror of above for non-default locales
    ├── index.astro
    ├── about.astro
    ├── contact.astro
    ├── blog/{index,[...slug]}.astro
    ├── projects/{index,[...slug]}.astro
    ├── legal/[...slug].astro
    └── rss.xml.ts                    # /<lang>/rss.xml
```

The `[lang]` directory is the canonical name — never use `[locale]` or `[language]`. Param accessor: `Astro.params.lang`.

## Components

Atoms live in `src/components/ui/` (shadcn-style — copied from the astro-ignite registry, owned by this repo).

- All atoms are Astro + vanilla JS — no React, no Radix, no framework runtime
- Interactive primitives use native HTML: `<details name>` for accordion, `<dialog>` for dialog, popover API for dropdown, CSS for tooltip, custom elements (`ai-tabs`, `ai-toaster`) for tabs/toasts
- Class-merge helper at `src/lib/cn.ts`; toast helper at `src/lib/toast.ts` dispatches a window event consumed by `<Toaster />`
- Card-style families (`card`, `tabs`, `accordion`, `dialog`, `dropdown-menu`) are grouped by family directory

## Banner & OG images

Blog and project detail pages render a **token-resolved CSS gradient cover** — there is no `heroImage` field in the content schema. To give a post a social/OG preview, set the optional `ogImage` in MDX frontmatter; otherwise OG falls back to the site-wide default banner via `SEO.astro`.

OG images must be **generated from HTML sources**, not hand-rolled SVG — see [`docs/IMAGES.md`](./docs/IMAGES.md).

Do not:

- Inline hand-drawn SVG banners in MDX
- Generate banners via satori / @vercel/og / resvg — type rendering drifts from the design tokens

If you need a new OG image, copy an existing HTML source and re-render with your renderer of choice (Puppeteer / Playwright + Chrome are the typical path).

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

The workspace ships a Playwright e2e suite at `tests/e2e/`. The
`starter` Playwright project boots this template via `astro dev` and
runs every spec under `tests/e2e/common/` plus `tests/e2e/starter/`.
See [`tests/e2e/AGENTS.md`](../../../tests/e2e/AGENTS.md). Scoped run
from the workspace root:

```bash
pnpm test:e2e --project=starter
```

## Style of work

- Default to including the feature unless it materially blocks shipping.
- Don't introduce abstractions before the third copy. The template is owned and editable.
- Components have no comments unless the _why_ is non-obvious.
- Audit `src/pages/[lang]/*` whenever you add a route under `src/pages/*`.
- See [`docs/`](./docs/) for FONTS, ANALYTICS, OG, IMAGES, LEGAL, BENCHMARKS deep dives.
