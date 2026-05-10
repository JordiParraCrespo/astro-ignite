# astro-ignite — Plan

> A shadcn-style CLI for bootstrapping production-grade Astro sites with top-tier SEO and performance defaults baked in.

This document captures every design decision made for v1, with the rationale behind each. It's intended as the canonical reference for contributors and as a tour of the project's opinions for users who want to understand why things are the way they are.

---

## Table of Contents

1. [Vision and positioning](#1-vision-and-positioning)
2. [Distribution model](#2-distribution-model)
3. [Init UX](#3-init-ux)
4. [Repo structure](#4-repo-structure)
5. [Stack](#5-stack)
6. [Performance strategy](#6-performance-strategy)
7. [i18n architecture](#7-i18n-architecture)
8. [Content collections](#8-content-collections)
9. [SEO components](#9-seo-components)
10. [JSON-LD strategy](#10-json-ld-strategy)
11. [Image components](#11-image-components)
12. [OG images](#12-og-images)
13. [Theme and dark mode](#13-theme-and-dark-mode)
14. [Fonts](#14-fonts)
15. [Analytics and cookie banner](#15-analytics-and-cookie-banner)
16. [Legal pages](#16-legal-pages)
17. [Layouts](#17-layouts)
18. [Routes](#18-routes)
19. [Sitemap, robots, RSS, manifest](#19-sitemap-robots-rss-manifest)
20. [Contact form and email](#20-contact-form-and-email)
21. [CLI implementation](#21-cli-implementation)
22. [Testing and CI](#22-testing-and-ci)
23. [Release flow](#23-release-flow)
24. [Docs site](#24-docs-site)
25. [Build roadmap](#25-build-roadmap)

---

## 1. Vision and positioning

astro-ignite is a CLI that scaffolds a complete, production-grade Astro site. It mirrors shadcn's philosophy — **copy-paste ownership, zero runtime lock-in, opinionated defaults** — applied to the entire bootstrapping problem, not just UI components.

The user runs `npm create astro-ignite@latest` once, answers five prompts, and gets a finished site with SEO/i18n/perf/legal/email all pre-wired. They own every line of the generated code; there is no `astro-ignite` runtime package to depend on.

**Three constraints we evaluate every decision against, in order:**

1. **Mirror shadcn as closely as possible.** Copy-paste, user-owned, no runtime lock-in.
2. **Defend the SEO/perf pitch.** Anything that compromises Lighthouse 100s on mobile needs an explicit defense.
3. **Be opinionated.** One way to do things, strong defaults, no permutation matrix.

**The scaffold should feel feature-rich on day one.** Default to including features rather than deferring them. The exceptions: don't ship things that force vendor signups (default), don't ship runtime framework dependencies that compromise perf (no preinstalled React), don't ship features that fragment into N flavors (no template-per-niche).

**Audience:** developers building Astro sites for marketing, blog, portfolio, or content use cases who want SEO and performance correct from line zero. Not a fit for dashboards, admin UIs, or apps with heavy client interactivity (though Astro itself supports those — they're just outside this tool's scope).

---

## 2. Distribution model

**CLI copy-paste, pure shadcn-style. No runtime npm package.**

Other options considered and rejected:
- npm library (`import { SEO, JsonLd } from 'astro-ignite'`): users can't tweak internals, heavier mental model.
- Hybrid (some primitives as npm, some as copy-paste): two distribution mechanisms = more surface area for marginal benefit.
- Starter template only (no `add` ever): too rigid; we want a path to grow into existing projects in v2.

**v1 is greenfield-only.** `npm create astro-ignite@latest` scaffolds a fresh project. No `add` command, no existing-project init in v1 — those are deferred to v2. This collapses several hard problems (registry hosting, version-skew, file-conflict resolution) into "just generate a great template."

---

## 3. Init UX

Five prompts, each with a sensible default. `--yes` flag skips them all.

1. **Site name** — used in `<title>` template, manifest, OG defaults.
2. **Site URL** — used in canonical, sitemap, robots, OG image absolute URLs.
3. **Locales** — default + additional (e.g. `en` + `es,fr`). Empty = monolingual (`['en']`).
4. **Package manager** — npm/pnpm/yarn/bun, auto-detected from `npm_config_user_agent`.
5. **Email provider** — Resend (default), SMTP, or None.

**Always-on:** TypeScript, Tailwind v4, MDX, git init.

**Things deliberately not prompted for:**
- TypeScript: non-negotiable for an SEO/typed-JSON-LD pitch.
- Tailwind: too foundational to make optional.
- MDX: content sites need it.
- Analytics provider: configured post-init via env var; switching providers is a one-file edit.
- Theme/dark mode: ships by default with tri-state toggle.

CLI flags: `--yes` (defaults), `--no-install`, `--no-git`.

---

## 4. Repo structure

pnpm workspace monorepo:

```
astrocn/
├── package.json                          # workspace root
├── pnpm-workspace.yaml
├── plan.md                               # this file
├── README.md
├── LICENSE                               # MIT
├── CONTRIBUTING.md
├── .github/
│   └── workflows/
│       ├── ci.yml                        # lint + typecheck + tests + e2e
│       ├── release.yml                   # changesets
│       └── lighthouse.yml                # perf gate
├── packages/
│   ├── create-astro-ignite/              # the CLI (published as create-astro-ignite)
│   │   ├── src/
│   │   │   ├── index.ts                  # entry + shebang
│   │   │   ├── prompts.ts                # @clack/prompts flow
│   │   │   ├── scaffold.ts               # template copy + substitution
│   │   │   ├── pm.ts                     # detect/select package manager
│   │   │   └── git.ts                    # git init wrapper
│   │   ├── package.json                  # bin entry
│   │   └── tsup.config.ts
│   └── template/                         # the actual Astro template (lives + builds)
│       ├── src/...
│       ├── public/...
│       ├── package.json
│       ├── astro.config.mjs              # uses {{site_url}} placeholder
│       ├── _template.config.ts           # conditional manifest (CLI-internal)
│       └── _gitignore                    # renamed at scaffold time
├── apps/
│   ├── playground/                       # CI smoke target
│   └── docs/                             # Starlight docs site
└── ...
```

Template lives as a working Astro project so we develop and test it directly via `pnpm dev`. The CLI bakes the template into its `dist/` at build time and copies from there at scaffold time.

---

## 5. Stack

**Core:**
- Astro 5+ (native i18n, content collections, Astro Actions, `astro:fonts`)
- TypeScript (strict)
- Tailwind v4 with `@tailwindcss/vite` (CSS-first config via `@theme`)
- MDX

**Integrations:**
- `@astrojs/sitemap` (i18n-aware)
- `@astrojs/rss`
- `astro-beasties` (or hand-rolled `astro:build:done` integration) for critical CSS inlining
- `astro:fonts` (built-in Astro 5.7+) with Bunny Fonts provider

**Conditional dependencies (set by init prompt):**
- `resend` (only if email = resend)
- `nodemailer` (only if email = smtp)

**Notable absences:**
- No `@astrojs/react` / `@astrojs/vue` / `@astrojs/svelte` — pure Astro components, vanilla `<script>` for interactivity. `npx astro add react` is one user command if islands are needed.
- No `class-variance-authority` / `clsx` — overkill for the surface we ship. Conditional classes are simple template literals.
- No icon library — small set of inline SVGs included; users add `astro-icon` if they want a richer set.

---

## 6. Performance strategy

The single biggest decision: **layered CSS** to deliver Lighthouse 100s on mobile.

**The problem:** Tailwind emits one CSS file with every utility used across the site. Browsers must parse it before painting the hero. Even with Astro's per-route splitting, cross-page utility overlap means the homepage CSS still carries weight from `/blog`, `/about`, etc. This shows up in Lighthouse as "render-blocking resources" and "unused CSS."

**The solution — layered CSS:**

| Layer | Tool | Why |
|---|---|---|
| Above-the-fold (Hero, Nav, BaseLayout chrome) | Astro scoped `<style>` blocks with `@theme` tokens | Astro inlines scoped styles per-route. Zero render-blocking weight from these components. |
| Below-the-fold (Footer, blog cards, prose) | Tailwind utility classes | Tailwind's velocity; loads with rest of page. |
| Critical CSS extraction | Beasties (Critters fork) at build time | Inlines just the Tailwind rules each page actually uses above the fold; rest loads async. |

**Convention encoded in scaffold:**
- `Hero.astro`, `Nav.astro`, `BaseLayout.astro` ship with `<style>` blocks.
- `Footer.astro`, `BlogPostCard.astro`, etc. use Tailwind classes.
- `@theme` tokens (CSS custom properties) are shared between both — change a brand color and both layers respect it.

**Other perf measures baked in:**
- Hero image preload via `<link rel="preload">` injected by BaseLayout when `preloadImages` prop set.
- Display font preloaded; mono font deferred (it's in code blocks below the fold).
- Variable fonts (one HTTP request, all weights).
- AVIF + WebP for images, JPEG/PNG fallback (3-format `<picture>`).
- `astro:fonts` automatic fallback metric overrides for zero CLS on font swap.
- Anti-flash inline theme script in `<head>` (no FOUC on dark mode).
- No client-side framework runtime (no React, Vue, Svelte preinstalled).
- View Transitions: deferred to v1.1.

**Defensible: Lighthouse CI in the repo enforces ≥95 mobile score on home + blog post + project page.** Not just marketing.

---

## 7. i18n architecture

**One code path** using Astro's native `i18n` config. Monolingual is just `locales: ['en']` with `prefixDefaultLocale: false`. Multilingual same config with more locales. No two-template branching.

**Hybrid by data kind** — different translatable data uses the right tool:

| Data kind | Storage | Access |
|---|---|---|
| UI strings (nav, buttons, footer, errors) | `src/i18n/{locale}.json` | Typed `t()` helper via `useTranslations(locale)` |
| Site-wide SEO defaults | `src/config/site.ts` with locale-keyed records | Direct import, locale lookup |
| Static page SEO (home/about/contact title+desc) | Same dictionaries via `t('seo.home.title')` | Page calls `t()` and passes to `<SEO>` |
| Per-content SEO + body (blog, projects, legal) | Astro 5 i18n collections at `src/content/{collection}/{locale}/...` | `getEntry({ collection, id, locale })` |
| OG images | `siteConfig.defaultOgImage[locale]` for site default; per-content colocated with MDX | `<SEO image={...}>` resolves automatically |
| JSON-LD | Builders take `locale`, auto-set `inLanguage` | `blogPostingSchema({ entry, locale, site, url })` |

**`t()` helper:** `useTranslations(locale)('seo.home.title')` with TS-derived key autocomplete from the JSON dictionary shape.

**Hreflang auto-computation:** when `<SEO>` is given no `alternates` prop, it walks `Astro.currentLocale` + the project's locale list + `Astro.url.pathname` to generate alternate URLs. Per-entry collections override (e.g., when slug differs per locale).

**Translations aren't faked:** if a blog post exists only in `en`, `<SEO>` only emits hreflang for `en`. No fallback rendering — `/es/blog/post-without-spanish` 404s rather than silently serving English content (which dilutes SEO and confuses users).

---

## 8. Content collections

Four collections, all Astro 5 i18n where applicable, all with strict Zod schemas:

### Blog (`src/content/blog/{locale}/{slug}.mdx`)

```ts
schema: ({ image }) => z.object({
  title: z.string().max(70),                          // SEO-friendly
  description: z.string().min(70).max(160),           // meta description
  datePublished: z.coerce.date(),
  dateModified: z.coerce.date().optional(),
  author: reference('authors'),
  heroImage: image(),                                  // required
  heroImageAlt: z.string(),
  ogImage: image().optional(),                         // overrides hero for OG
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  canonical: z.string().url().optional(),
  noindex: z.boolean().default(false),
})
```

### Projects (`src/content/projects/{locale}/{slug}/index.mdx`)

Folder-per-slug for colocated assets (screenshots, og.png).

```ts
schema: ({ image }) => z.object({
  title: z.string().max(70),
  description: z.string().min(70).max(160),
  summary: z.string().max(280),                        // longer pitch for cards
  datePublished: z.coerce.date(),
  dateUpdated: z.coerce.date().optional(),
  heroImage: image(),
  heroImageAlt: z.string(),
  ogImage: image().optional(),
  techStack: z.array(z.string()).default([]),
  links: z.object({
    live: z.string().url().optional(),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    caseStudy: z.string().url().optional(),
  }).default({}),
  role: z.string().optional(),
  client: z.string().optional(),
  status: z.enum(['shipped', 'in-progress', 'archived']).default('shipped'),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
})
```

### Authors (`src/content/authors/{slug}.json`)

Language-neutral except `bio`.

```ts
schema: ({ image }) => z.object({
  name: z.string(),
  bio: z.record(z.string(), z.string()),              // locale → bio
  image: image(),
  url: z.string().url().optional(),
  email: z.string().email().optional(),
  social: z.object({
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    mastodon: z.string().url().optional(),
    bluesky: z.string().url().optional(),
  }).default({}),
})
```

### Legal (`src/content/legal/{locale}/{slug}.mdx`)

```ts
schema: z.object({
  title: z.string(),
  description: z.string(),
  lastUpdated: z.coerce.date(),
  version: z.string().default('1.0'),
})
```

**Rationale for length-capping at the schema level:** an SEO-bootstrap tool *should* fail the build when a post would render badly in SERPs. Users who hate it remove `.max()`.

**`heroImage` required, not optional:** posts without images are boring and hurt social sharing. Type-system enforces discipline.

**Author as `reference('authors')`:** consistent identity across posts, supports author bios, opens path to author pages in v2.

---

## 9. SEO components

**Composed, not monolithic.** Two components:

### `<SEO>` — universal head tags

```ts
interface Props {
  title: string;
  description: string;
  canonical?: string | URL;
  image?: ImageMetadata | string;
  imageAlt?: string;
  noindex?: boolean;
  type?: 'website' | 'article' | 'profile';
  locale?: string;
  alternates?: Array<{ lang: string; href: string }>;
}
```

Emits: `<title>`, meta description, canonical, OG (title/description/image/url/type/locale), Twitter card (summary_large_image with same image), robots, hreflang `<link>` per locale.

### `<JsonLd schemas={[...]} />` — structured data

Receives an array of `schema-dts`-typed schema objects. Emits one `<script type="application/ld+json">` containing `@graph` with all schemas. References between schemas via `@id` (e.g. `BlogPosting.publisher` → `{ '@id': '...#organization' }`) eliminate duplication.

### Site-wide defaults

`src/config/site.ts` is a single typed object:

```ts
export interface SiteConfig {
  url: string;
  name: Record<string, string>;            // locale-keyed
  description: Record<string, string>;
  organization: Record<string, { name: string; legalName?: string; }>;
  social: { twitter?: string; github?: string; linkedin?: string; ... };
  defaultOgImage: string | Record<string, string>;
  logo: string;
  locales: string[];
  defaultLocale: string;
}
```

Per-page props override; site config provides fallbacks.

### Canonical normalization

Handled by a helper that aligns trailing slashes with `astro.config.mjs` `trailingSlash` setting. Canonicals never disagree with what Astro actually serves.

---

## 10. JSON-LD strategy

**Pure functions returning typed objects, rendered as `@graph`.**

### v1 schema set

| Schema | Where | Why |
|---|---|---|
| `Organization` | site-wide | Logo, knowledge panel, brand recognition |
| `WebSite` | site-wide | Sitelinks search box, name disambiguation |
| `BreadcrumbList` | every nested page | Breadcrumb trail in SERPs |
| `WebPage` / `AboutPage` / `ContactPage` / `CollectionPage` | per-page | Page-type signal |
| `BlogPosting` | blog post detail | Article-rich result eligibility |
| `CreativeWork` | projects detail | Generic creative work |
| `Person` | About + as `author` of posts | E-E-A-T, personal branding |

**Excluded from v1** (situational): FAQPage, HowTo, Review, Product, Recipe, Event, VideoObject. Documented as "follow the same pattern" for users who need them.

### Builder API

```ts
// src/lib/jsonld/organization.ts
import type { Organization } from 'schema-dts';

export function organizationSchema(site: SiteConfig, locale: string): Organization {
  return {
    '@type': 'Organization',
    '@id': `${site.url}#organization`,
    name: site.organization[locale].name,
    url: site.url,
    logo: { '@type': 'ImageObject', url: new URL(site.logo, site.url).href },
    sameAs: Object.values(site.social).filter(Boolean),
    inLanguage: locale,
  };
}
```

`schema-dts` (Google's official Schema.org TS types) enforces correctness at compile time.

### Site-wide schemas

Explicit per page via a `siteSchemas(locale)` helper that returns `[organizationSchema(...), websiteSchema(...)]`. Pages compose:

```ts
<JsonLd schemas={[
  ...siteSchemas(locale),
  blogPostingSchema({ entry, locale, site, url: Astro.url }),
  breadcrumbListSchema(crumbs),
]} />
```

BaseLayout merges site schemas automatically (`siteSchemas(locale)` are spread into `JsonLd` inside BaseLayout). Pages only add page-specific schemas.

---

## 11. Image components

Two components — different optimization profiles for different use cases:

### `<Image>` (content imagery)

Lazy-loaded, blur LQIP placeholder, AVIF + WebP, quality 80.

```ts
interface Props {
  src: ImageMetadata;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;       // default: '(min-width: 768px) 50vw, 100vw'
  class?: string;
}
```

Wraps `astro:assets` `<Image>`, adds:
- 4×4 base64 LQIP placeholder generated at build via `sharp` (already a transitive dep)
- Aspect-ratio-locked container to prevent CLS
- Blur fades to image on load (CSS transition)

### `<HeroImage>` (above-the-fold)

Eager, `fetchpriority="high"`, sync decode, AVIF + WebP, quality 85.

```ts
interface Props {
  src: ImageMetadata;
  alt: string;
  width: number;        // required
  height: number;       // required
  sizes?: string;       // default: '100vw'
  class?: string;
}
```

No blur placeholder (it would compete with the image). Hero images render as fast as possible.

### Hero image preload

Handled at page level via BaseLayout's `preloadImages` prop. The component can't reach into `<head>` — the page passes `preloadImages={[heroImage]}` and BaseLayout renders `<link rel="preload" as="image" ...>` tags.

### What's automatic

- **3-format `<picture>`:** AVIF + WebP + original-format fallback. Modern browsers get AVIF (~50-70% smaller than JPEG); older browsers get WebP; ancient browsers get JPEG/PNG.
- **Responsive `srcset`:** Astro auto-generates across `[640, 750, 828, 1080, 1200, 1920, 2048, 3840]` widths when `sizes` is provided.
- **Width/height attributes:** prevent layout shift even before CSS loads.

### Documented for users (`IMAGES.md`)

- Author at 2× display size max.
- SVG is not optimized through this pipeline — ship from `public/`.
- Build time scales with `images × formats × breakpoints`; cached after first build.

---

## 12. OG images

**Pre-baked single OG per locale, easily overridden.** No build-time generation in v1.

- `public/og/og-default.png` ships in scaffold (1200×630, branded with site name placeholder).
- `siteConfig.defaultOgImage` typed as `string | Record<string, string>` — single image for monolingual, locale-keyed for multilingual.
- Collection entry `ogImage` field overrides per entry.
- `<SEO>` resolution order: `entry.data.ogImage` → `siteConfig.defaultOgImage[locale]` → `siteConfig.defaultOgImage` (string fallback).

`OG.md` documents:
1. How to brand the default OG.
2. How to add per-locale variants.
3. **Opt-in recipe** for users who later want Satori-based auto-generation — literal copy-paste code block with file paths and ~30 lines of generator code. They can adopt it in 10 minutes if their content scales past hand-curated OG.

---

## 13. Theme and dark mode

**Tri-state dark mode** (light / dark / system, default = system on first visit) with full toggle.

### Token structure (`src/styles/global.css`)

```css
@import "tailwindcss";

@theme {
  /* Brand tokens (theme-invariant) */
  --color-brand: oklch(60% 0.18 250);
  --font-display: 'Geist', system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace;

  /* Light tokens (defaults) */
  --color-bg: oklch(99% 0 0);
  --color-fg: oklch(15% 0 0);
  --color-muted: oklch(95% 0.005 250);
  --color-muted-fg: oklch(40% 0.01 250);
  --color-border: oklch(90% 0.01 250);
  --color-accent: var(--color-brand);
}

.dark {
  --color-bg: oklch(13% 0.005 250);
  --color-fg: oklch(95% 0 0);
  --color-muted: oklch(20% 0.01 250);
  --color-muted-fg: oklch(65% 0.015 250);
  --color-border: oklch(25% 0.01 250);
  --color-accent: oklch(70% 0.16 250);  /* brighter for dark contrast */
}

@variant dark (&:where(.dark, .dark *));
```

**OKLCH** — perceptually uniform color space, predictable contrast ratios, supported in every browser since 2023.

**Accent brightens in dark mode.** Saturated blues that look great on white wash out on black; production dark themes brighten + slightly desaturate accents.

### Anti-flash inline script (`<head>`, before any CSS)

```html
<script is:inline>
  (() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored === 'dark'
      || (!stored && matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
    document.documentElement.dataset.theme = stored ?? 'system';
  })();
</script>
```

`is:inline` keeps Astro from bundling/deferring it. Runs synchronously before paint. Zero flash.

### `<ThemeToggle>` component

A `<details>` dropdown with three buttons (Sun / Moon / Monitor icons + labels). On click, writes `'light' | 'dark' | null` to localStorage; null means "follow system." Listens to `prefers-color-scheme` `change` event so the site responds live when the OS theme flips (only when user is in "system" mode).

~600 bytes total client JS for theme handling.

---

## 14. Fonts

**Geist Sans + Geist Mono via `astro:fonts` Bunny provider.** Self-hosted, subsetted, with automatic fallback metric overrides for zero CLS.

### Config

```js
// astro.config.mjs
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  experimental: {
    fonts: [
      {
        provider: fontProviders.bunny(),
        name: 'Geist',
        cssVariable: '--font-display',
        weights: ['400 700'],         // variable axis range
        subsets: ['latin', 'latin-ext'],
        fallbacks: ['system-ui', 'sans-serif'],
        display: 'swap',
      },
      {
        provider: fontProviders.bunny(),
        name: 'Geist Mono',
        cssVariable: '--font-mono',
        weights: [400, 600],
        subsets: ['latin'],
        fallbacks: ['ui-monospace', 'monospace'],
        display: 'swap',
      },
    ],
  },
});
```

In BaseLayout `<head>`:

```astro
<Font cssVariable="--font-display" preload />
<Font cssVariable="--font-mono" />
```

**Display font preloaded** (LCP-critical). Mono font deferred (in below-the-fold code blocks).

### Why Geist

- Vercel/shadcn aesthetic (matches the look users want)
- Smaller variable file (~25KB) than Inter (~80KB)
- MIT/OFL-licensed
- Linguistic coverage: Latin + Latin-Extended (English, Spanish, French, German, Polish, Vietnamese, Turkish, etc.)

### Linguistic limits + swap path

Geist doesn't ship Cyrillic, Greek, CJK, Arabic, or Hebrew. Users with those locales swap `name: 'Geist'` → `name: 'Inter'` (broader coverage) in one config line. Documented in `FONTS.md`.

### Easy font-swap story

The CSS-variable abstraction is the key — components reference `var(--font-display)`, never the font name. Swapping fonts:
1. Swap a font: change `name` in `astro.config.mjs`. CSS variable stays the same.
2. Add a third font: append to `fonts` array with `cssVariable: '--font-serif'`, use in components.
3. Switch provider (Google ⇄ Bunny ⇄ local): change `provider`. One line.
4. Go system-stack-only: delete the fonts config, edit `@theme` variables.

---

## 15. Analytics and cookie banner

### Analytics (`src/components/Analytics.astro`)

**Plausible-default, env-gated, consent-gated.**

```astro
---
const domain = import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN;
const host = import.meta.env.PUBLIC_PLAUSIBLE_HOST ?? 'https://plausible.io';
---
{domain && (
  <script is:inline define:vars={{ domain, host }}>
    const inject = () => {
      if (document.querySelector('script[data-domain]')) return;
      const s = document.createElement('script');
      s.defer = true;
      s.dataset.domain = domain;
      s.src = `${host}/js/script.js`;
      document.head.appendChild(s);
    };
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted') inject();
    window.addEventListener('consent-change', (e) => {
      if (e.detail === 'accepted') inject();
    });
  </script>
)}
```

- Renders nothing if `PUBLIC_PLAUSIBLE_DOMAIN` unset (zero perf cost).
- Waits for cookie consent before injecting Plausible's script.
- Listens for `consent-change` window event so accepting on the banner kicks in immediately.

**Swap recipes in `ANALYTICS.md`:** Umami, Fathom, Vercel Analytics, GA-with-banner. Each is a copy-paste replacement for the component body, ~10-20 lines.

### Cookie banner (`src/components/CookieBanner.astro`)

Bottom-right floating card, two buttons (Accept / Decline), link to `/legal/cookies`.

- `localStorage['cookie-consent']` = `'accepted' | 'declined'`.
- Banner renders only when key is unset (first visit).
- Dispatches `consent-change` window event on choice.
- Strings via `t()` helper (translatable per locale).
- `role="dialog"` with `aria-labelledby` and `aria-describedby`. Not modal.
- Client-only render (avoids SSR-flicker on hydration).
- Scoped CSS in `<style>` block (above-the-fold per our layered CSS rule).

**Why two buttons (no "Accept all"):** dark-pattern-style banners with prominent "Accept" and buried "Reject" are increasingly being scrutinized by EU regulators. Honest two-button design.

---

## 16. Legal pages

**Three legal templates ship in the `legal` content collection:** privacy, terms, cookies.

### Structure

```
src/content/legal/
  en/
    privacy.mdx
    terms.mdx
    cookies.mdx
  es/
    privacy.mdx
    terms.mdx
    cookies.mdx
```

### Page renderer at `/legal/[slug]`

Reads the entry from `legal` collection by locale + slug. Renders inside `LegalLayout` (narrow reading column, "Last updated" header, in-page TOC sidebar, disclaimer banner at top).

### Template framing — important

Each MDX file ships with placeholder content marked clearly:

```markdown
> ⚠️ TEMPLATE — review with legal counsel before publishing.

# Privacy Policy

**Last updated:** {lastUpdated}

[YOUR COMPANY NAME] ("we", "our", "us") operates this site...
```

Placeholders the user fills in:
- `[YOUR COMPANY NAME]`
- `[YOUR JURISDICTION]`
- `[YOUR EMAIL]`
- `[YOUR ADDRESS]`

Sensible default sections cover common ground: data collected, retention, user rights, cookies in use, contact info. Cookie policy lists the actual storage the scaffold uses (`cookie-consent` localStorage key) — minimal, honest.

**This is template language, not legal advice.** `LEGAL.md` documents loudly:
- Templates are based on common GDPR/CCPA structure but every business is different.
- User MUST review with counsel for their jurisdiction.
- Adding tools (Stripe, Mailchimp, etc.) requires updating disclosures.
- No warranty on the templates.

### Footer wiring

Footer has a "Legal" section linking to all three pages, locale-aware.

---

## 17. Layouts

**`BaseLayout` + specialized wrappers.** Each layout is a complete styled template, not a structural skeleton.

### `BaseLayout.astro`

Universal chrome and head. Props:

```ts
interface Props {
  title: string;
  description: string;
  image?: ImageMetadata | string;
  imageAlt?: string;
  noindex?: boolean;
  type?: 'website' | 'article' | 'profile';
  alternates?: Array<{ lang: string; href: string }>;
  schemas?: Thing[];           // additional JSON-LD beyond siteSchemas
  preloadImages?: ImageMetadata[];
}
```

Renders:
- `<html lang={locale}>` (auto from `Astro.currentLocale`)
- Anti-flash theme script
- Fonts (display preloaded, mono not)
- Hero image preload links
- `<SEO>` + `<JsonLd>` (with siteSchemas auto-merged)
- Skip-link (visually hidden until focused, jumps to `<main>`)
- `<Nav>`, `<main id="main">`, `<Footer>`, `<CookieBanner>`, `<Analytics>`

A11y landmarks: `<main id="main">` (skip-link target), `<nav>` (in Nav), `<header>` (in Nav), `<footer>` (in Footer), `<article>` (in ArticleLayout/ProjectLayout where applicable).

### `ArticleLayout.astro`

Wraps `BaseLayout`. Adds article-specific structure:
- `<header>` with title (large display weight), date, author byline, hero image
- `max-w-prose` reading container
- Code-block, image-in-prose, blockquote styling
- TOC slot (sticky on desktop)
- Related posts slot

Auto-supplies `BlogPosting` + `BreadcrumbList` schemas from the entry.

### `ProjectLayout.astro`

Wraps `BaseLayout`. Case-study structure:
- Cover image
- Two-column intro: description + sidebar (role/client/tech stack/links/status)
- Prose body
- Screenshot gallery slot

Auto-supplies `CreativeWork` + `BreadcrumbList` schemas.

### `LegalLayout.astro`

Wraps `BaseLayout`. Documentation structure:
- Disclaimer banner at top ("This is a template — review with counsel")
- Title + "Last updated: {date}" prominently
- Narrow reading column (`max-w-2xl`)
- In-page TOC sidebar (sticky on desktop)
- Auto-supplies `WebPage` schema.

### Customization

Users edit layout files directly. No theming layer, no subclassing — just edit the `.astro` file. Shadcn ownership.

---

## 18. Routes

```
src/pages/
  [...lang]/
    index.astro                         # home: hero + features
    about.astro                         # AboutPage + Person/Organization JSON-LD
    contact.astro                       # form
    blog/
      index.astro                       # post list, Blog/CollectionPage JSON-LD, paginated
      [slug].astro                      # MDX post, BlogPosting JSON-LD, breadcrumbs
    projects/
      index.astro                       # grid, CollectionPage JSON-LD
      [slug].astro                      # case study, CreativeWork JSON-LD
    legal/
      [slug].astro                      # template-driven legal pages
    404.astro
  api/
    contact.ts                          # form action endpoint (Astro Action)
  rss.xml.ts                            # default-locale RSS (proxy to per-locale)
  [locale]/
    rss.xml.ts                          # per-locale RSS feeds
public/
  manifest.webmanifest
  robots.txt
  favicon.svg
  apple-touch-icon.png
  og/og-default.png
  icon-192.png
  icon-512.png
  icon-maskable.png
```

**Why monolingual users still see `[...lang]/`:** single i18n code path. With `prefixDefaultLocale: false`, monolingual sites render `/`, `/about`, etc. as expected — the `[...lang]/` segment is a routing internal that doesn't appear in URLs.

---

## 19. Sitemap, robots, RSS, manifest

### Sitemap (`@astrojs/sitemap`)

```js
sitemap({
  i18n: { defaultLocale: 'en', locales: { en: 'en-US', es: 'es-ES' } },
  filter: (page) => !page.includes('/og/') && !page.includes('/api/'),
  changefreq: 'weekly',
  priority: 0.7,
  serialize: (item) => {
    if (item.url.endsWith('/')) item.priority = 1.0;
    if (item.url.includes('/legal/')) item.priority = 0.3;
    return item;
  },
})
```

Outputs `/sitemap-index.xml` + `/sitemap-0.xml` with hreflang alternates per URL.

### `robots.txt`

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /og/

Sitemap: {{site_url}}/sitemap-index.xml
```

Site URL templated at scaffold time.

### RSS (`@astrojs/rss`)

Per-locale feeds: `/rss.xml` (default-locale) and `/{locale}/rss.xml` (others). Latest 20 blog posts, MDX rendered to HTML for full-text feeds, hero image as `<enclosure>`.

Projects RSS shipped commented-out (opt-in). Most blogs publish a blog feed, not a portfolio feed.

Auto-discovery `<link>` in BaseLayout `<head>`.

### `manifest.webmanifest`

```json
{
  "name": "{{site_name}}",
  "short_name": "{{site_name}}",
  "description": "{{site_description}}",
  "start_url": "/",
  "scope": "/",
  "display": "browser",
  "theme_color": "#0a0a0a",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

`display: 'browser'` deliberate — most marketing/blog/portfolio sites don't want PWA install prompts. Users building a PWA change to `'standalone'`.

---

## 20. Contact form and email

### Astro Action (`src/actions/index.ts`)

```ts
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { sendContactEmail } from '@/lib/email';

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1).max(100),
      email: z.string().email(),
      message: z.string().min(10).max(5000),
      _website: z.string().max(0).optional(),  // honeypot
    }),
    handler: async (input) => {
      if (input._website) return { ok: true };  // silent succeed for bots
      await sendContactEmail(input);
      return { ok: true };
    },
  }),
};
```

- Type-safe form handling, progressive enhancement (works without JS).
- Zod schema validates server-side.
- Honeypot field (`_website`) for spam — bots fill it, humans don't.

### Email transports

`src/lib/email/index.ts` re-exports the chosen provider's `sendContactEmail`. CLI scaffolds only the chosen file:

**Resend (`src/lib/email/resend.ts`):**
```ts
import { Resend } from 'resend';

export async function sendContactEmail(input: ContactInput) {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('📧 [astro-ignite] RESEND_API_KEY not set — would have sent:', input);
    if (import.meta.env.PROD) throw new Error('RESEND_API_KEY required in production');
    return;
  }
  const resend = new Resend(apiKey);
  await resend.emails.send({ ... });
}
```

**SMTP (`src/lib/email/smtp.ts`):** Same shape with Nodemailer. Same dev fallback.

**None:** `index.ts` just logs the payload, with TODO comments showing how to wire Resend/SMTP.

### Dev-mode fallback

When env vars missing in dev, log payload to terminal — `npm run dev` produces a complete working flow with zero account signups. Production refuses with a clear error.

### `.env.example`

```
# Resend (https://resend.com) — required for contact form in production
RESEND_API_KEY=

# Plausible Analytics — optional
PUBLIC_PLAUSIBLE_DOMAIN=
# PUBLIC_PLAUSIBLE_HOST=https://your-self-hosted-instance
```

(SMTP variant has different env vars.)

---

## 21. CLI implementation

### Stack

- **TypeScript** compiled via `tsup` to ESM, single file with shebang.
- **`@clack/prompts`** for the prompt UX (Vercel-style, used by every modern create-* tool).
- **Inline templates** baked at build time. No network at scaffold time.
- **Distributed via npm** as `create-astro-ignite`.
- **Triggers:** `npm create astro-ignite@latest`, `pnpm create astro-ignite@latest`, `yarn create astro-ignite`, `bun create astro-ignite`.

### Conditional template logic

`packages/template/_template.config.ts`:

```ts
export const templateConfig = {
  conditional: {
    'src/lib/email/resend.ts': (ctx) => ctx.email === 'resend',
    'src/lib/email/smtp.ts': (ctx) => ctx.email === 'smtp',
    'src/lib/email/index.ts': (ctx) => ctx.email !== 'none',
  },
  packageJson: (ctx) => ({
    name: ctx.projectName,
    dependencies: {
      ...(ctx.email === 'resend' ? { resend: '^4.0.0' } : {}),
      ...(ctx.email === 'smtp' ? { nodemailer: '^7.0.0' } : {}),
    },
  }),
  substitutions: ['{{site_name}}', '{{site_url}}', '{{default_locale}}', '{{additional_locales}}'],
};
```

CLI walks the template tree, evaluates conditionals, copies non-skipped files, applies regex substitution on text files only.

### Flow

1. Parse CLI args (`--yes`, `--no-install`, `--no-git`, project-name positional).
2. Print welcome banner.
3. Prompt for site name, URL, locales, package manager (auto-detected default), email provider.
4. Confirm summary.
5. Copy template files to target dir (skip conditionals, substitute placeholders).
6. Rename `_gitignore` → `.gitignore`, `_npmrc` → `.npmrc` if present.
7. Generate `package.json` from template + chosen deps.
8. Run install with chosen package manager (skipped with `--no-install`).
9. Run `git init` + initial commit (skipped with `--no-git`).
10. Print success message with next steps.

### `.gitignore` gotcha

npm strips `.gitignore` from packages. We commit `_gitignore` in the template and rename at scaffold time.

### Package manager detection

`process.env.npm_config_user_agent` is set by every package manager when invoking `create-*`. Parse the leading token (`npm/...`, `pnpm/...`, etc.) to pre-select the prompt default.

---

## 22. Testing and CI

### Test layers

- **Vitest unit tests for the CLI** — prompt logic, conditional file selection, package.json transformation, placeholder substitution.
- **Template build test** — `cd packages/template && pnpm install && astro check && astro build`.
- **End-to-end scaffold test** — CI scaffolds `apps/playground` from CLI with `--yes`, runs install + build, asserts expected output files exist (sitemap, manifest, OG image, RSS feeds per locale, prerendered HTML for every route).
- **Lighthouse CI on built playground** — `@lhci/cli` runs against the static site, asserts thresholds on home + blog index + blog post + project page.

### Lighthouse thresholds

- **Hard fail on median <95** (Performance, Accessibility, Best Practices, SEO).
- **Soft warning on median <100** to preserve the 100-or-bust ambition.
- **3 runs per audit, take the median** to absorb single-run variance.

Documented in `BENCHMARKS.md`.

### CI matrix

- Node 20 LTS + 22 LTS.
- Package managers: pnpm primary; e2e scaffold test runs on npm + pnpm + yarn + bun to catch package-manager-specific bugs.
- OS: Ubuntu only for CI. Mac/Windows tested manually before release.

### Linting + formatting

- ESLint with `eslint-plugin-astro` for the template.
- Prettier with `prettier-plugin-astro` for both packages.
- Single shared config at repo root.
- `lint-staged` + `simple-git-hooks` for pre-commit format on staged files.
- `tsc --noEmit` in CI for both CLI and template (`astro check` covers `.astro` typecheck).

---

## 23. Release flow

- **Changesets** for versioning. Every PR with a user-visible change includes a `.changeset/*.md` declaring impact (patch/minor/major).
- **GitHub Action `changesets/action`** auto-creates a "Version Packages" PR aggregating pending changesets; merging that PR publishes to npm and tags the release.
- **Pre-1.0 (`0.x`)** for the early experimental phase; semver tightens at 1.0 once API and template shape stabilize.
- **MIT license.**
- **Release notes** auto-generated from changeset markdown; manual editorial pass before notable releases.

The CLI bundles the template at build time, so the template's "version" is implicit — it's whatever shipped with this CLI version. Single version line, no separate template publishing.

---

## 24. Docs site

**Starlight in `apps/docs/`,** English-only at v1 launch.

### Why Starlight (not dogfood)

- Purpose-built for docs: sidebar nav, search (Pagefind), MDX components, dark mode, i18n, all production-ready.
- Adopted by Cloudflare Workers, Bun, Tauri — no stigma.
- Building docs-specific components (sidebar, search, callouts, code-copy buttons) alongside the v1 scaffold is scope inflation.
- Clean v1.1 narrative for switching: once `astro-ignite add` (v2 feature) ships and a `docs` registry component exists, dogfooding becomes free.

### v1 launch content (minimal/dummy)

- Landing page (what it is, install command)
- Quick start (init walkthrough)
- Benchmarks (Lighthouse scores, methodology)
- "More docs coming soon" notice

Full content scope deferred to post-v1 work. Tracked as backlog, expanded incrementally.

### Hosting

- `apps/docs/` deployed to Vercel or Cloudflare Pages (free tiers for OSS).
- Custom domain deferred — Vercel `*.vercel.app` URL is fine for v1 launch.

---

## 25. Build roadmap

Implementation phases. Each phase produces a checkable deliverable.

### Phase 1: Monorepo skeleton

- pnpm workspace at root
- `packages/create-astro-ignite/` skeleton (package.json, tsup config, src/index.ts placeholder)
- `packages/template/` skeleton (package.json, astro.config.mjs, tsconfig)
- `apps/playground/` placeholder
- `apps/docs/` Starlight skeleton
- Root: README, LICENSE (MIT), CONTRIBUTING, .gitignore, .editorconfig, .nvmrc, .prettierrc, .github/workflows/ci.yml stub

### Phase 2: Template foundations

- `astro.config.mjs` with i18n + sitemap + Tailwind v4 + fonts integration
- `src/styles/global.css` with `@theme` tokens (light + dark, OKLCH)
- `src/config/site.ts` with `SiteConfig` type and example config
- `src/i18n/{en.json, es.json, index.ts}` with typed `t()` helper
- `tsconfig.json` with `@/*` alias
- `.env.example`

### Phase 3: SEO + JSON-LD

- `src/components/seo/SEO.astro`
- `src/components/seo/JsonLd.astro`
- `src/lib/jsonld/` builders (organization, website, person, breadcrumbList, blogPosting, creativeWork, webPage variants)
- `siteSchemas` helper

### Phase 4: Content collections

- `src/content.config.ts` with blog/projects/authors/legal collections
- Seed entries: 2-3 posts in each locale, 1 project per locale, 1 author, 3 legal pages per locale

### Phase 5: Image components

- `src/components/image/Image.astro`
- `src/components/image/HeroImage.astro`
- `src/lib/image/blur.ts` (LQIP generation)

### Phase 6: Layouts

- `src/layouts/BaseLayout.astro`
- `src/layouts/ArticleLayout.astro`
- `src/layouts/ProjectLayout.astro`
- `src/layouts/LegalLayout.astro`

### Phase 7: Chrome components

- `src/components/Nav.astro` (with mobile menu, locale switcher)
- `src/components/Footer.astro`
- `src/components/ThemeToggle.astro`
- `src/components/CookieBanner.astro`
- `src/components/Analytics.astro`

### Phase 8: Pages

- All routes in `src/pages/[...lang]/`
- `src/pages/[locale]/rss.xml.ts`

### Phase 9: Contact form + email

- `src/actions/index.ts`
- `src/lib/email/{index,resend,smtp}.ts`

### Phase 10: Static assets + remaining wiring

- `public/robots.txt`
- `public/manifest.webmanifest`
- `public/og/og-default.png` (placeholder)
- `public/favicon.svg`, `apple-touch-icon.png`, icon-192/512/maskable

### Phase 11: Template documentation

- `README.md` (the generated project's README)
- `FONTS.md`, `ANALYTICS.md`, `OG.md`, `IMAGES.md`, `LEGAL.md`, `BENCHMARKS.md`

### Phase 12: CLI

- `_template.config.ts` in template root
- CLI src: prompts, scaffold, pm detection, git wrapper
- `tsup` build to `dist/`
- Bin entry in `package.json`

### Phase 13: Docs site

- Starlight install in `apps/docs/`
- Landing + Quick start + Benchmarks pages
- Branding to match repo

### Phase 14: CI

- `.github/workflows/ci.yml` — lint + typecheck + tests + e2e
- `.github/workflows/release.yml` — changesets
- `.github/workflows/lighthouse.yml` — perf gate
- Vitest config + initial CLI tests
- Lighthouse CI config

### Phase 15: Polish + release

- Changeset for v0.1.0
- README polish + screenshots
- Release notes
- npm publish

---

## Appendix A: Decisions deliberately deferred to v2+

- `astro-ignite add <component>` (registry/CLI for incremental adoption)
- `astro-ignite init` for existing projects
- `astro-ignite update` for upgrading owned components
- Search (Pagefind integration as a registry component)
- Tag/category pages
- Author pages
- View Transitions API integration
- OG image generation (Satori) as an opt-in component
- Multi-template support (blog-focused / portfolio-focused / SaaS-focused starters)
- Localized docs (translate the docs site itself)
- Versioned docs

## Appendix B: Decisions deliberately rejected

- React/Vue/Svelte preinstalled — kills perf pitch.
- `class-variance-authority` / `clsx` — overkill for v1 surface.
- Google Fonts as default — privacy, no need vs Bunny.
- Inline OG generation as default — adds Satori + font shipping complexity for marginal v1 benefit.
- Two codegen paths for monolingual vs multilingual — single i18n code path is cleaner.
- Heavy prompt flow (template selection, integration picker) — opinionation > optionality.
- Cookie banner with "Accept all" / buried "Reject" — dark pattern, regulator-flagged.
- Versioned docs at v1 — the project is too young.
