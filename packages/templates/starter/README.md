# astro-ignite

> Bootstrapped with [astro-ignite](https://github.com/JordiParraCrespo/astro-ignite) — a shadcn-style scaffold for production-grade Astro sites.

## Quick start

```bash
pnpm install
pnpm dev
```

Open the URL printed in your terminal. The site has a working blog, projects showcase, contact form, dark mode, cookie banner, sitemap, RSS, and legal page templates.

## What ships

- **Astro 7** with native i18n, content collections, and Astro Actions
- **Tailwind v4** with `inlineStylesheets: 'always'` — full stylesheet inlined in the HTML, no render-blocking CSS request
- **Geist Sans + Geist Mono** via `astro:fonts` (self-hosted, zero CLS)
- **Typed Schema.org JSON-LD** built from `schema-dts`
- **Image components** with AVIF + WebP, responsive `srcset`, blur placeholder
- **Tri-state dark mode** (light / dark / system)
- **Working contact form** with Astro Actions, Zod validation, honeypot
- **Cookie banner + legal templates** (privacy, terms, cookies)
- **Plausible analytics** (env-gated, consent-gated)
- **Sitemap, RSS, robots, manifest** all wired and i18n-aware

## Project structure

```
src/
├── actions/              # Astro Actions (server-side form handlers)
├── components/
│   ├── about/            # About page sections
│   ├── blog/             # Post cards, pagination, TOC, related posts
│   ├── common/           # Site chrome (Header, Footer, LocaleSwitcher, ThemeToggle, Hero)
│   ├── contact/          # Contact form section
│   ├── error/            # Server error page hero
│   ├── image/            # Image + PriorityImage wrappers
│   ├── legal/            # Cookie banner
│   ├── not-found/        # 404 page hero
│   ├── projects/         # Projects index list
│   ├── seo/              # SEO + JsonLd
│   └── ui/               # shadcn-style atoms (Button, Badge, Card, Tabs, Dialog…)
├── config/site.ts        # Site-wide configuration — edit this first
├── content/              # Content collections
│   ├── blog/{locale}/    # Blog posts (MDX)
│   ├── projects/{locale}/{slug}/  # Project case studies
│   ├── authors/          # Author profiles (JSON)
│   └── legal/{locale}/   # Legal page templates
├── i18n/                 # UI string dictionaries + t() helper
├── layouts/              # Base, Article, Project, Legal layouts
├── lib/
│   ├── email/            # Email transport (Resend or SMTP)
│   ├── image/            # LQIP (blur placeholder) generator
│   └── jsonld/           # Schema.org builders
├── pages/                # Routes
└── styles/global.css     # Tailwind + theme tokens (OKLCH)
public/                   # Static assets (favicon, manifest, OG default)
```

## First things to edit

1. **Brand colors + tokens** → `src/styles/global.css` (`@theme` block)
2. **Site identity** → `src/config/site.ts`
3. **OG image** → `public/og/og-default.png` (placeholder ships)
4. **Favicon + icons** → `public/favicon.svg`, `public/icon-{192,512,maskable}.png`, `public/apple-touch-icon.png`
5. **Legal pages** → `src/content/legal/{locale}/{privacy,terms,cookies}.mdx` — placeholders need to be filled in and **reviewed with legal counsel**
6. **Author bio** → `src/content/authors/jordi.json`
7. **Sample blog posts** → delete the welcome posts in `src/content/blog/{locale}/` once you don't need the tour

## Environment variables

Copy `.env.example` to `.env` and fill in what you need:

```bash
cp .env.example .env
```

Required for production:

- `RESEND_API_KEY` (or SMTP\_\* if you chose SMTP)
- `CONTACT_TO_EMAIL`

Optional:

- `PUBLIC_PLAUSIBLE_DOMAIN` (enables analytics)

In dev, missing env vars fall back to console-logging — `pnpm dev` produces a working flow without any account signup.

## Adding content

### Blog posts

Drop an MDX file at `src/content/blog/{locale}/{slug}.mdx`:

```yaml
---
title: My first post
description: A short summary shown in the blog index, RSS feed, and page meta description tags.
datePublished: 2025-01-01
ogImage: ./_assets/og-my-post.png   # optional social/OG preview; generate with scripts/banners/
author: jordi                         # matches a key in src/content/authors/
tags: [astro, tailwind]
---
```

There is no `heroImage` field — post cards and detail pages render a token-resolved CSS gradient cover instead. `ogImage` only controls the social preview.

The blog index at `/blog` and the RSS feed pick it up automatically.

### Projects

Drop a folder at `src/content/projects/{locale}/{slug}/` and add an `index.mdx`:

```yaml
---
title: My project
description: One-line summary shown in the projects grid, projects index page, and page meta tags.
summary: A slightly longer summary shown on the project detail page (up to 280 characters).
datePublished: 2025-01-01
ogImage: ./og.png   # optional social/OG preview, relative to the folder
techStack: [astro, tailwind]
---
```

### Authors

Add a JSON file at `src/content/authors/{handle}.json`:

```json
{
  "name": "Your Name",
  "image": "./_assets/your-avatar.jpg",
  "bio": {
    "en": "Short bio shown below each post."
  }
}
```

`image` is resolved as a real Astro asset (not a public-path string), and `bio` is locale-keyed — add one entry per locale you ship.

Reference the handle in blog post frontmatter via `author: your-handle`.

## Adding a new locale

1. Add the locale code to `siteConfig.locales` in `src/config/site.ts`
2. Create `src/i18n/<locale>.json` (copy from `en.json` and translate)
3. Add locale-keyed entries to `siteConfig.name`, `description`, `organization`
4. Translate content collection entries: copy `src/content/blog/en/*.mdx` to `src/content/blog/<locale>/` and translate
5. Same for `src/content/legal/<locale>/`
6. Optional: add per-locale OG image (`public/og/og-<locale>.png`) and reference via `siteConfig.defaultOgImage = { en: '...', es: '...' }`

Astro auto-handles the routing — `/blog/welcome` (default) and `/<locale>/blog/welcome` (other locales).

## Build

```bash
pnpm build       # production build → dist/
pnpm preview     # preview the production build
```

The default deployment target is **Node** (via `@astrojs/node` standalone). Swap adapters:

```bash
# For Vercel
pnpm astro add vercel
# For Netlify
pnpm astro add netlify
# For Cloudflare Pages
pnpm astro add cloudflare
```

Then update `adapter:` in `astro.config.mjs`. Static-only deployments (no contact form): remove the adapter and set `output: 'static'`.

## Performance

The scaffold is tuned to hit Lighthouse 100s on mobile wherever possible; the enforced CI floor is ≥95, mobile only (no desktop gate). Key principles encoded in the code:

- `inlineStylesheets: 'always'` puts the full stylesheet in the HTML on first paint — no render-blocking CSS file
- Geist fonts are self-hosted and preloaded; zero external font fetches
- Hero images preloaded via `<link rel="preload">`
- AVIF + WebP with JPEG fallback, multiple `srcset` widths
- Anti-flash inline theme script
- No client-side framework runtime

See [`BENCHMARKS.md`](./docs/BENCHMARKS.md) for measurement methodology.

## Deeper docs

| Topic                                            | Read                               |
| ------------------------------------------------ | ---------------------------------- |
| Contact form (providers, env vars, removing)     | [`CONTACT-FORM.md`](./docs/CONTACT-FORM.md) |
| Custom fonts (swap, add, system-only)            | [`FONTS.md`](./docs/FONTS.md)           |
| Analytics swap (Plausible ↔ Umami ↔ Fathom ↔ GA) | [`ANALYTICS.md`](./docs/ANALYTICS.md)   |
| OG images (per-locale, dynamic generation)       | [`OG.md`](./docs/OG.md)                 |
| Image component conventions                      | [`IMAGES.md`](./docs/IMAGES.md)         |
| Legal templates (review with counsel!)           | [`LEGAL.md`](./docs/LEGAL.md)           |
| Performance benchmarks + reproducing them        | [`BENCHMARKS.md`](./docs/BENCHMARKS.md) |
| JSON-LD / Schema.org authoring                   | [`JSONLD.md`](./docs/JSONLD.md)         |
| Astro Actions — extending the contact form       | [`ACTIONS.md`](./docs/ACTIONS.md)       |
| Internationalisation — routing, locales, i18n    | [`I18N.md`](./docs/I18N.md)             |
| Design tokens, dark mode, reskinning             | [`THEMING.md`](./docs/THEMING.md)       |
| Deployment options (Node, Netlify, Cloudflare)   | [`DEPLOYING.md`](./docs/DEPLOYING.md)   |

## License

The scaffold ships under MIT. Replace this README with your own once you've made the project yours.
