# astro-ignite

> shadcn-style CLI for bootstrapping production-grade Astro sites with top-tier SEO and performance defaults.

```bash
npm create astro-ignite@latest my-site
```

You answer five prompts. You get a finished site with SEO, i18n, perf, legal, and email pre-wired. You own every line of code — no runtime dependency on this tool.

## What you get

- **Lighthouse 100s on mobile** out of the box (CI-enforced)
- **Astro 5** with native i18n, content collections, and Astro Actions
- **Tailwind v4** with a layered CSS strategy (scoped above-the-fold + Tailwind below + critical-CSS extraction)
- **TypeScript-typed Schema.org JSON-LD** built from `schema-dts`
- **Image components** with AVIF + WebP, responsive `srcset`, LQIP placeholders
- **Geist Sans + Geist Mono** via `astro:fonts` (self-hosted, zero CLS)
- **Tri-state dark mode** (light / dark / system) with anti-flash inline script
- **Working contact form** with Astro Actions, Zod validation, and your choice of Resend or SMTP
- **Cookie banner + legal page templates** (privacy, terms, cookies) with i18n
- **Plausible analytics** (env-gated, consent-gated, easy swap to Umami/Fathom/GA)
- **Sitemap, RSS, robots, manifest** all wired and i18n-aware
- **Blog and projects** as Astro 5 i18n content collections with strict Zod schemas

## Status

Pre-1.0, in active development. See [`plan.md`](./plan.md) for the full design spec and rationale behind every decision.

## Repo layout

```
packages/
  create-astro-ignite/     # the CLI
  template/                # the Astro template (lives + builds as a real site)
apps/
  playground/              # CI smoke target
  docs/                    # Starlight docs site
```

## Development

```bash
pnpm install
pnpm dev                   # iterate on the template directly
pnpm dev:cli               # iterate on the CLI
pnpm dev:docs              # iterate on the docs
pnpm test                  # run all tests
pnpm scaffold:test         # full scaffold → install → build → Lighthouse loop
```

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for more.

## License

MIT.
