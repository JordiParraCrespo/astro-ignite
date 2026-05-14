// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

import { siteConfig } from './src/config/site.ts';

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url,
  trailingSlash: 'ignore',
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: 'compile',
  }),
  build: {
    format: 'directory',
    // Inline ALL stylesheets so the first paint never waits on a CSS round-trip.
    // The largest bundle is ~25 KB (blog post route, Tailwind + tokens) — that
    // adds ~25 KB to the HTML per page, but eliminates one render-blocking
    // request and is a clear Speed-Index / FCP win for a content-light site.
    inlineStylesheets: 'always',
  },
  i18n: {
    defaultLocale: siteConfig.defaultLocale,
    locales: siteConfig.locales,
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: siteConfig.defaultLocale,
        locales: Object.fromEntries(
          siteConfig.locales.map((l) => [l, siteConfig.hreflang[l] ?? l])
        ),
      },
      filter: (page) => !page.includes('/og/') && !page.includes('/api/'),
      changefreq: 'weekly',
      priority: 0.7,
      serialize(item) {
        if (new URL(item.url).pathname === '/') item.priority = 1.0;
        if (item.url.includes('/legal/')) item.priority = 0.3;
        return item;
      },
    }),
  ],
  vite: {
    // JSDoc cast: @tailwindcss/vite resolves to Vite 7 types in some envs (e.g. the
    // monorepo), but to Vite 6 in others (fresh scaffolds). Either way the runtime
    // plugin works — silence the conditional type drift with a single any-cast.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
  experimental: {
    fonts: [
      {
        provider: fontProviders.bunny(),
        name: 'Geist',
        cssVariable: '--font-display',
        // Only the weights the design actually renders: 400 (body), 500 (h1/h2),
        // 600 (release-pill tag). Dropping 700 + the "400-700" range halves the
        // preloaded file count without changing any rendered glyph.
        weights: [400, 500, 600],
        styles: ['normal'],
        // Spanish accents (á é í ó ú ñ ¿ ¡) are all in latin-1, which is covered
        // by the `latin` subset. latin-ext is for Polish / Czech / Vietnamese
        // diacritics — drop until a locale that needs it is added.
        subsets: ['latin'],
        fallbacks: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: 'swap',
      },
      {
        provider: fontProviders.bunny(),
        name: 'Geist Mono',
        cssVariable: '--font-mono',
        weights: [400, 600],
        styles: ['normal'],
        subsets: ['latin'],
        fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: 'swap',
      },
    ],
  },
});
