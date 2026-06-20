# astro-ignite

> Bootstrapped with [astro-ignite](https://github.com/JordiParraCrespo/astro-ignite) — a shadcn-style scaffold for production-grade Astro sites.

## Quick start

```bash
pnpm install
pnpm dev
```

Open the URL printed in your terminal. The site has a working blog, projects showcase, contact form, dark mode, cookie banner, sitemap, RSS, and legal page templates.

## What ships

- **Astro 6** with native i18n, content collections, and Astro Actions
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
├── components/           # UI components
│   ├── image/            # Image + PriorityImage wrappers
│   └── seo/              # SEO + JsonLd
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

## Deeper docs

| Topic                                            | Read                               |
| ------------------------------------------------ | ---------------------------------- |
| Custom fonts (swap, add, system-only)            | [`FONTS.md`](./docs/FONTS.md)           |
| Analytics swap (Plausible ↔ Umami ↔ Fathom ↔ GA) | [`ANALYTICS.md`](./docs/ANALYTICS.md)   |
| OG images (per-locale, dynamic generation)       | [`OG.md`](./docs/OG.md)                 |
| Image component conventions                      | [`IMAGES.md`](./docs/IMAGES.md)         |
| Legal templates (review with counsel!)           | [`LEGAL.md`](./docs/LEGAL.md)           |
| Performance benchmarks + reproducing them        | [`BENCHMARKS.md`](./docs/BENCHMARKS.md) |
| JSON-LD / Schema.org authoring                   | [`JSONLD.md`](./docs/JSONLD.md)         |
| Astro Actions — extending the contact form       | [`ACTIONS.md`](./docs/ACTIONS.md)       |
| Internationalisation — routing, locales, i18n    | [`I18N.md`](./docs/I18N.md)             |

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

The scaffold is tuned for Lighthouse 100s on mobile. Key principles encoded in the code:

- `inlineStylesheets: 'always'` puts the full stylesheet in the HTML on first paint — no render-blocking CSS file
- Geist fonts are self-hosted and preloaded; zero external font fetches
- Hero images preloaded via `<link rel="preload">`
- AVIF + WebP with JPEG fallback, multiple `srcset` widths
- Anti-flash inline theme script
- No client-side framework runtime

See [`BENCHMARKS.md`](./docs/BENCHMARKS.md) for measurement methodology.

## License

The scaffold ships under MIT. Replace this README with your own once you've made the project yours.
