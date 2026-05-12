# astro-ignite

![astro-ignite banner](./assets/banners/banner.png)

> Astro sites, built for AI agents.

```bash
npm create astro-ignite@latest my-site
```

Answer five prompts. Get a finished site with SEO, i18n, performance, legal, and email pre-wired. Structured for agents to read, edit, and extend — every line is code you own. No runtime dependency on this tool once you've scaffolded.

## What you get

- **Lighthouse 100s** on mobile and desktop, CI-enforced (the build fails before a regression ships)
- **Astro 5** with native i18n, content collections, and Astro Actions
- **Tailwind v4** with a layered CSS strategy — scoped styles above the fold, utilities below, critical CSS extracted at build time
- **Typed Schema.org JSON-LD** via `schema-dts`, composed per-page into one `@graph`
- **Image components** with AVIF + WebP, responsive `srcset`, and LQIP placeholders
- **Geist Sans + Geist Mono** through `astro:fonts` — self-hosted, zero CLS
- **Tri-state dark mode** (light / dark / system) with an anti-flash inline script
- **Working contact form** built on Astro Actions, Zod-validated, with Resend or SMTP
- **Cookie banner + legal pages** (privacy, terms, cookies) — i18n-aware templates you adapt
- **Plausible analytics**, env-gated and consent-gated (easy swap to Umami / Fathom / GA)
- **Sitemap, RSS, robots, manifest** — all i18n-aware
- **Blog and projects** as content collections with strict Zod schemas
- **A copy-paste component registry** — 18 atoms + 14 blocks, installed with `npx astro-ignite add <name>`

## Why "built for AI agents"

The codebase is shaped so an LLM can navigate it without ceremony:

- **Small surface area.** No framework magic, no hidden abstractions. The five things you'd want to edit live where you'd expect them.
- **You own the output.** Templates are copied in, not imported. Agents can rewrite freely without breaking an upstream contract.
- **Native HTML primitives.** `<details>`, `<dialog>`, popover API, custom elements. No React tree to reason about, no client hydration to schedule.
- **Strict types end to end.** Astro's TypeScript checker runs on every route; agents that introduce a bug see it before commit.

## Status

Pre-1.0, in active development. See [`plan.md`](./plan.md) for the full design spec and the reasoning behind each locked decision.

## Components

Two layers, both owned by you, both rendered against the same design tokens:

- **Atoms** — `packages/registry/base/`. 18 primitives (button, input, dialog, tooltip, accordion, …) built with Astro + vanilla JS. Native HTML where possible: `<details name>` for accordion, `<dialog>` for modal, popover API for menus, CSS-only tooltip, custom elements for tabs and toasts.
- **Blocks** — `packages/registry/blocks/`. 14 compositions (page-hero, feature-grid, command-block, terminal-preview, breadcrumb, prev-next-nav, …). Drop them in and edit.

Browse the live catalog at [`/components`](https://docs.astroignite.dev/components) — every primitive and block on one scrollable page, rendered against the actual design system, not screenshots.

## Repo layout

```
packages/
  create-astro-ignite/     # the CLI
  registry/                # shadcn-style component source (base + blocks)
  templates/
    starter/               # marketing / blog / projects template
    docs/                  # docs-site template
apps/
  site/                    # public marketing site
  docs/                    # the project's docs site
  playground/              # CI smoke target
```

## Development

```bash
pnpm install
pnpm dev                   # alias for dev:site
pnpm dev:site              # apps/site
pnpm dev:docs              # apps/docs
pnpm dev:starter           # iterate on the starter template directly
pnpm dev:docs-template     # iterate on the docs template directly
pnpm dev:cli               # iterate on the CLI

pnpm build                 # build every package
pnpm test                  # run all tests
pnpm typecheck             # recursive astro check / tsc --noEmit
pnpm format                # prettier --write across the monorepo
pnpm scaffold:test         # full scaffold → install → build → Lighthouse loop
```

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for more.

## License

MIT.
