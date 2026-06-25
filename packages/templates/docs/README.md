# astro-ignite docs

> Bootstrapped with [astro-ignite](https://github.com/JordiParraCrespo/astro-ignite) — a shadcn-style scaffold for production-grade Astro sites.

## Quick start

```bash
pnpm install
pnpm dev
```

Open the URL printed in your terminal. The site has working docs navigation, full-text search, a sidebar, on-page TOC, light/dark mode, cookie banner, sitemap, and legal page templates.

> **Note on search:** Full-text search (Pagefind) runs as a post-build step. In `pnpm dev`, the search dialog opens but returns no results — run `pnpm build` once to index the content, then `pnpm preview` to see it working.

## What ships

- **Astro 6** with native i18n, content collections, and static output
- **Tailwind v4** with `inlineStylesheets: 'always'` — full stylesheet inlined in the HTML on first paint, no render-blocking CSS request
- **Geist Sans + Geist Mono** via `astro:fonts` (self-hosted, zero CLS)
- **Typed Schema.org JSON-LD** built from `schema-dts`
- **Full-text search** via Pagefind (post-build index, no server needed)
- **3-column docs layout** — sidebar nav, MDX content, on-this-page TOC
- **Prev / Next navigation** with ordering via frontmatter `order`
- **Breadcrumbs** derived from folder structure
- **MDX component kit** — Callout, Steps, Step, CodeBlock, CodeGroup, Frame, CardGroup, AiActions
- **Tri-state dark mode** (light / dark / system; defaults to light)
- **Cookie banner + legal templates** (privacy, terms, cookies)
- **Plausible analytics** (env-gated, consent-gated)
- **Sitemap, RSS, robots** all wired and i18n-aware

## Project structure

```
src/
├── components/
│   ├── docs/             # Docs-specific components (Sidebar, TOC, Search, PrevNext…)
│   ├── common/           # Shared chrome (Footer, LocaleSwitcher, ThemeToggle)
│   ├── ui/               # shadcn-style atoms (Button, Badge, Alert, Tabs…)
│   └── seo/              # SEO + JsonLd
├── config/site.ts        # Site-wide configuration — edit this first
├── content/
│   ├── docs/{locale}/    # Docs pages (MDX) — e.g. docs/en/getting-started.mdx
│   └── legal/{locale}/   # Legal page templates
├── i18n/                 # UI string dictionaries + t() helper
├── layouts/              # BaseLayout, LegalLayout
├── lib/
│   ├── image/            # LQIP (blur placeholder) generator
│   └── jsonld/           # Schema.org builders
├── pages/                # Routes
└── styles/global.css     # Tailwind + theme tokens (OKLCH)
public/                   # Static assets (favicon, OG default)
```

## First things to edit

1. **Brand colors + tokens** → `src/styles/global.css` (`@theme` block)
2. **Site identity + home path** → `src/config/site.ts` (`url`, `name`, `description`, `homePath`)
3. **OG image** → `public/og/og-default.png` (placeholder ships)
4. **Favicon + icons** → `public/favicon.svg`, `public/icon-{192,512,maskable}.png`, `public/apple-touch-icon.png`
5. **Legal pages** → `src/content/legal/{locale}/{privacy,terms,cookies}.mdx` — placeholders need to be filled in and **reviewed with legal counsel**
6. **Demo docs content** → replace `src/content/docs/{locale}/introduction.mdx` and add your own pages

## Environment variables

Copy `.env.example` to `.env` and fill in what you need:

```bash
cp .env.example .env
```

The docs template has no contact form, so no email provider is required.

Optional:

- `PUBLIC_PLAUSIBLE_DOMAIN` (enables analytics)

In dev, missing env vars are silently skipped — `pnpm dev` works without any account signup.

## Adding docs pages

1. Drop an MDX file at `src/content/docs/{locale}/{slug}.mdx`:
   ```yaml
   ---
   title: Getting started
   description: Install and run the CLI.
   order: 1
   ---
   ```
2. To group pages in the sidebar, use sub-folders: `src/content/docs/en/guide/install.mdx` → appears under the "Guide" section heading.
3. To translate a page, copy it into the target locale folder and translate the body and frontmatter.

The route file enumerates entries via `getCollection('docs', ...)` — no manual route registration needed.

## Adding a new locale

1. Add the locale code to `siteConfig.locales` in `src/config/site.ts`
2. Create `src/i18n/<locale>.json` (copy from `en.json` and translate)
3. Add locale-keyed entries to `siteConfig.name`, `description`, `organization`
4. Copy your docs pages into `src/content/docs/<locale>/` and translate
5. Same for `src/content/legal/<locale>/`
6. Optional: add a per-locale OG image (`public/og/og-<locale>.png`) and reference via `siteConfig.defaultOgImage = { en: '...', es: '...' }`

Astro auto-handles the routing — `/introduction` (default locale) and `/<locale>/introduction` (other locales).

## Build

```bash
pnpm build      # production build → dist/ (pagefind indexes content as postbuild)
pnpm preview    # preview the production build with search working
```

This template outputs **fully static HTML** — no server adapter is required. Deploy the `dist/` folder to any CDN or static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

To add a server-rendered route later (e.g., a form), pin an adapter in `astro.config.mjs`:

```bash
pnpm astro add vercel   # or netlify, cloudflare, node
```

## Performance

The scaffold is tuned for Lighthouse 100s on mobile. Key principles:

- `inlineStylesheets: 'always'` puts the full stylesheet in the HTML on first paint — no render-blocking CSS file
- Geist fonts are self-hosted and preloaded; zero external font fetches
- No client-side framework runtime
- Anti-flash inline theme script (prevents light flash on dark preference)
- AVIF + WebP with JPEG fallback, multiple `srcset` widths

See [`BENCHMARKS.md`](./docs/BENCHMARKS.md) for measurement methodology.

## Deeper docs

| Topic                                             | Read                                     |
| ------------------------------------------------- | ---------------------------------------- |
| Search (Pagefind, indexing, i18n, removing)       | [`SEARCH.md`](./docs/SEARCH.md)          |
| Sidebar, TOC, prev/next, breadcrumbs              | [`NAVIGATION.md`](./docs/NAVIGATION.md)  |
| Custom fonts (swap, add, system-only)             | [`FONTS.md`](./docs/FONTS.md)            |
| Analytics swap (Plausible ↔ Umami ↔ Fathom ↔ GA) | [`ANALYTICS.md`](./docs/ANALYTICS.md)    |
| OG images (per-locale, dynamic generation)        | [`OG.md`](./docs/OG.md)                  |
| Image component conventions                       | [`IMAGES.md`](./docs/IMAGES.md)          |
| Legal templates (review with counsel!)            | [`LEGAL.md`](./docs/LEGAL.md)            |
| Performance benchmarks + reproducing them         | [`BENCHMARKS.md`](./docs/BENCHMARKS.md)  |
| Sidebar navigation — groups, ordering, badges     | [`SIDEBAR.md`](./docs/SIDEBAR.md)        |
| Internationalisation — routing, locales, i18n     | [`I18N.md`](./docs/I18N.md)              |
| Design tokens, dark mode, reskinning              | [`THEMING.md`](./docs/THEMING.md)        |
| Deployment options (static hosts, GitHub Pages)   | [`DEPLOYING.md`](./docs/DEPLOYING.md)    |

## License

The scaffold ships under MIT. Replace this README with your own once you've made the project yours.
