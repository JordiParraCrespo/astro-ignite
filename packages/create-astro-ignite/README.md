# create-astro-ignite

![astro-ignite banner](https://raw.githubusercontent.com/JordiParraCrespo/astro-ignite/main/assets/banners/banner.png)

> Astro sites, built for AI agents.

```bash
npm create astro-ignite@latest my-site
```

A shadcn-style CLI that scaffolds a production-grade Astro site. Pick a template, answer a few prompts, and get a real project — every line of code is yours, with no runtime dependency on this tool once you've scaffolded.

## What you get

- **Lighthouse 100s** on mobile and desktop, CI-enforced
- **Astro 5** with native i18n, content collections, and Astro Actions
- **Tailwind v4** with a layered CSS strategy — scoped above-the-fold, utilities below, critical CSS extracted at build time
- **Typed Schema.org JSON-LD** via `schema-dts`, composed per-page into one `@graph`
- **Image components** with AVIF + WebP, responsive `srcset`, and LQIP placeholders
- **Geist Sans + Geist Mono** through `astro:fonts` — self-hosted, zero CLS
- **Tri-state dark mode** (light / dark / system) with an anti-flash inline script
- **Working contact form** built on Astro Actions, Zod-validated, with Resend or SMTP
- **Cookie banner + legal pages** (privacy, terms, cookies) — i18n-aware templates you adapt
- **Plausible analytics**, env-gated and consent-gated
- **Sitemap, RSS, robots, manifest** — all i18n-aware
- **Blog and projects** as content collections with strict Zod schemas
- **A copy-paste component registry** — 18 atoms + 14 blocks

## Templates

| Template | Use case |
| --- | --- |
| `starter` (default) | Marketing site + blog + projects, contact form, full i18n, legal pages |
| `docs` | Documentation site built from primitives (no Starlight); search via Pagefind |

Pick one interactively or pass `--template=<kind>`.

## Usage

```bash
# Interactive — pick a template, answer prompts
npm create astro-ignite@latest my-site

# Non-interactive — sane defaults, no prompts
npm create astro-ignite@latest my-site -- --yes

# Try the beta channel
npm create astro-ignite@beta my-site
```

All package managers are supported:

```bash
pnpm create astro-ignite my-site
yarn create astro-ignite my-site
bun create astro-ignite my-site
```

## Flags

| Flag | What it does |
| --- | --- |
| `-y`, `--yes` | Skip prompts, use defaults |
| `--no-install` | Skip dependency install |
| `--no-git` | Skip `git init` |
| `--pm=<npm\|pnpm\|yarn\|bun>` | Force a specific package manager |
| `--template=<starter\|docs>` | Pick the template non-interactively |
| `-h`, `--help` | Print help |

## What happens

1. Prompts (or `--yes` flag) collect project name, site URL, locales, package manager, email provider.
2. The selected template is copied into your target directory.
3. `package.json` is rewritten — name set, unused deps stripped (e.g. the `docs` template doesn't pull in Resend / SMTP).
4. `pnpm install` (or your detected pm) runs.
5. `git init` runs.

You end up with a real Astro project that compiles, type-checks, and ships Lighthouse-100. No magic remains in `node_modules` — you can read and edit every file.

## Requirements

- Node.js `>=20.11.0`
- One of: npm, pnpm, yarn, bun

## Source & docs

- Repository: [`JordiParraCrespo/astro-ignite`](https://github.com/JordiParraCrespo/astro-ignite)
- Documentation: [`docs.astroignite.dev`](https://docs.astroignite.dev)

## License

MIT.
