# Deploying

Where you deploy depends on one question: **does the site need server compute?**

The starter ships a contact form built on **Astro Actions**, which run server-side. It pins the `@astrojs/node` adapter so that endpoint has somewhere to run. To deploy elsewhere, swap the adapter to match the host.

> **Static pages either way.** Even with an adapter, `output: 'static'` means every page is pre-rendered HTML. Only the action endpoint is server-rendered — so you keep the same Lighthouse profile (≥95 mobile, CI-enforced) and just need a place to run that one function.

## Node (default)

Build, then run the standalone server entry:

```bash
pnpm build
node ./dist/server/entry.mjs
```

Put it behind a reverse proxy (Caddy, nginx) or in a container. Set the email env vars (see [`CONTACT-FORM.md`](./CONTACT-FORM.md)) in the runtime environment.

## Netlify / Vercel

Swap the adapter — the change is two lines plus the dependency:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify'; // or @astrojs/vercel

export default defineConfig({
  output: 'static',
  adapter: netlify(),
  // …the rest is unchanged
});
```

```bash
pnpm add @astrojs/netlify   # or @astrojs/vercel
```

The adapter turns the action endpoint into a serverless / edge function at build time. The static pages still deploy to the CDN; the function handles the form POST.

> **One adapter at a time.** Keep exactly one adapter in `astro.config.mjs`. Removing it entirely breaks the contact form (the action has nowhere to run); see the static-only option below if you want to drop the form.

## Cloudflare Pages

Don't reach for `@astrojs/cloudflare` here — the current adapter emits a Worker build that Pages can't run. The pattern that works is a **fully static build plus a hand-written Pages Function**:

1. Keep `output: 'static'` and **no adapter**. `pnpm build` emits plain `dist/`; Pages serves it from the CDN.
2. Write the form handler as a Pages Function at `functions/api/contact.ts` — an `onRequestPost` that validates the fields, checks the honeypot, and talks to your email provider's HTTP API, reading secrets from the function's `env` binding (set them as encrypted variables on the Pages project).
3. Repoint the contact `<form>` at `/api/contact` and remove the Astro Action. Cloudflare deploys the `functions/` directory alongside `dist/` automatically.

## Static-only (no contact form)

If you don't need the contact form, the build is fully portable:

```bash
pnpm build   # → dist/
```

Remove the `@astrojs/node` adapter from `astro.config.mjs` and set `output: 'static'`. Then drop the `dist/` folder on Cloudflare Pages, Netlify, GitHub Pages, or any CDN. Build command `pnpm build`, output directory `dist`.

To completely remove the form: delete `src/pages/contact.astro`, `src/pages/[lang]/contact.astro`, `src/actions/index.ts`, and `src/lib/email/`.

## Before you ship

- Set `siteConfig.url` in `src/config/site.ts` to your production origin — it drives canonical URLs, the sitemap, OG tags, and `robots.txt`.
- Set email and analytics env vars in the host's dashboard, not in the repo.
- Re-run `pnpm build` locally first; it surfaces schema and type errors the host would otherwise fail on.
- Verify the build output with `pnpm preview` before deploying.
