# OG images

Open Graph images are the social-share moment of truth — they show up in every link unfurl on Twitter/X, LinkedIn, Slack, iMessage, Discord. The template ships with a pre-baked default + per-content override, plus a documented upgrade path to dynamic generation.

## Default behavior

`src/components/seo/SEO.astro` resolves the OG image in this order:

1. The `image` prop passed to `<SEO>` (per-page override)
2. `entry.data.ogImage` from the collection entry (per-post override)
3. `siteConfig.defaultOgImage[locale]` if locale-keyed
4. `siteConfig.defaultOgImage` if a string

The default file is `public/og/og-default.png` (1200×630) — a placeholder gradient with the site name baked in.

## Brand the default OG

Replace `public/og/og-default.png` with your own 1200×630 PNG. That's it.

If you want to regenerate the placeholder programmatically, the script that produced it lives at the **monorepo root**:

```bash
node ./scripts/generate-placeholder-assets.mjs
```

Edit the SVG template in that script to change colors, text, layout. Re-run.

## Per-locale OG images

Edit `src/config/site.ts`:

```ts
defaultOgImage: {
  en: '/og/og-en.png',
  es: '/og/og-es.png',
  fr: '/og/og-fr.png',
},
```

Drop the corresponding files into `public/og/`. The `<SEO>` component picks the right one based on `Astro.currentLocale`.

## Per-page OG images

The docs template schema has no per-entry `ogImage` field. Individual pages override the OG image by passing the `image` prop directly to `<BaseLayout>`:

```astro
---
// src/pages/some-special-page.astro
import BaseLayout from '@/layouts/BaseLayout.astro';
import myOg from './my-og.png'; // colocate in src/pages/
---

<BaseLayout title="…" description="…" image={myOg}>
  …
</BaseLayout>
```

`DocsLayout` delegates to `BaseLayout` but doesn't accept an `image` prop — if you need per-doc OG images, add an `ogImage` field to the `docs` schema in `src/content.config.ts` and pass it through `DocsLayout`.

## Add dynamic OG generation (Satori recipe)

If you want auto-generated OG images per doc page, add Satori. ~30 lines of code, no extra runtime cost (build-time generation).

### 1. Install deps

```bash
pnpm add satori @resvg/resvg-js satori-html
```

### 2. Add a font for Satori

Place a TTF/WOFF in `src/assets/fonts/og/Inter.ttf`. Or use the variable Geist file from `node_modules` (subsetting required).

### 3. Generator

Create `src/lib/og/generate.ts`:

```ts
import { html } from 'satori-html';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fontBuffer = readFileSync(resolve('src/assets/fonts/og/Inter.ttf'));

export async function generateOgPng(opts: {
  title: string;
  subtitle: string;
  siteName: string;
}): Promise<Buffer> {
  const markup = html` <div
    style="
      width: 100%; height: 100%; display: flex; flex-direction: column;
      justify-content: space-between; padding: 80px;
      background: linear-gradient(135deg, #1e3a8a, #06b6d4);
      color: white; font-family: 'Inter';"
  >
    <div style="font-size: 24px; opacity: 0.7;">${opts.siteName}</div>
    <div>
      <div style="font-size: 64px; font-weight: 700; line-height: 1.1;">${opts.title}</div>
      <div style="font-size: 28px; opacity: 0.85; margin-top: 24px;">${opts.subtitle}</div>
    </div>
  </div>`;

  const svg = await satori(markup as any, {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Inter', data: fontBuffer, weight: 400, style: 'normal' }],
  });
  return new Resvg(svg).render().asPng();
}
```

### 4. Static endpoint

Create `src/pages/og/[...slug].png.ts`:

```ts
import { getCollection } from 'astro:content';
import { generateOgPng } from '@/lib/og/generate';
import { siteConfig } from '@/config/site';

export async function getStaticPaths() {
  const entries = await getCollection('docs');
  return entries.map((entry) => {
    const slug = entry.id.split('/').slice(1).join('/');
    return {
      params: { slug: `docs/${entry.id.split('/')[0]}/${slug}` },
      props: {
        title: entry.data.title,
        subtitle: entry.data.description,
      },
    };
  });
}

export const GET = async ({ props }: { props: { title: string; subtitle: string } }) => {
  const png = await generateOgPng({
    title: props.title,
    subtitle: props.subtitle,
    siteName: siteConfig.name[siteConfig.defaultLocale]!,
  });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
```

### 5. Wire up

Add an `ogImage` field to the `docs` schema and pass a virtual URL from the page's data, or wire it up in DocsLayout.

Build cost: ~20-50ms per OG image. 100 pages × 2 locales = ~10s extra build time. Cached after first build.

## OG image dimensions

- **Recommended:** 1200×630 (1.91:1 ratio)
- **Twitter `summary_large_image`:** same — works for both
- **LinkedIn:** same — works
- **Discord/Slack:** any size, but 1200×630 renders consistently

The `<SEO>` component hardcodes `og:image:width=1200` and `og:image:height=630`. If you ship a different size, update those meta tags in `src/components/seo/SEO.astro`.

## Twitter Card type

The component picks `summary_large_image` if any image is set, `summary` otherwise. The large card type is what you want for visual content sites.
