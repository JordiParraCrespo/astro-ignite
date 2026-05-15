// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

import { siteConfig } from './src/config/site.ts';

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
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
    }),
  ],
  vite: {
    // JSDoc cast: @tailwindcss/vite resolves to Vite 7 types in some envs (e.g. the
    // monorepo), but to Vite 6 in others (fresh scaffolds). Either way the runtime
    // plugin works — silence the conditional type drift with a single any-cast.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
