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
  // Fully static: every page prerenders to HTML, deployed to Cloudflare Pages.
  // The contact form posts to a Pages Function (functions/api/contact.ts), which
  // is the only server-side piece — so the site itself needs no adapter.
  output: 'static',
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
});
