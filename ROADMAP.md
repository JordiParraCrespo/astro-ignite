# astro-ignite — Roadmap

This document plans how the project evolves from its current state (v0.1.0, scaffold-only) to a mature shadcn-equivalent for Astro. It's intentionally ambitious in scope but conservative on commitments — every release ships when it's actually ready, not on a date.

If you're considering using astro-ignite for a real project, this page tells you what to expect, what's coming, and what's deliberately out of scope so you can plan accordingly.

---

## North star

A developer can run **`npm create astro-ignite@latest`**, answer a handful of prompts, and have a production-ready Astro site running in under five minutes — with SEO, performance, i18n, legal, accessibility, and the chrome of a real site already wired. They own every line of code and can grow the site over years without ever depending on this tool at runtime.

Three principles that aren't going to change:

1. **Mirror shadcn.** Copy-paste ownership. Zero runtime dependency on `astro-ignite`. If we ship a CLI command, it writes files into your project — it doesn't install a library.
2. **Defend the perf pitch.** Lighthouse 100s on mobile, CI-gated, every release. New features that compromise this need an explicit defense or they don't ship.
3. **Be opinionated.** One way to do things, strong defaults, no permutation matrix. New options enter only when removing one would make things worse for a real audience.

---

## Versioning

| Version range       | What it means                                                                                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **0.x.y** (current) | API and template shape may change between minor versions. Breaking changes called out in changelogs. Suitable for new projects you're willing to update; not yet recommended for shipped sites you want to forget about. |
| **1.0**             | API and template stable. Breaking changes only at major versions, with migration guides. The default mode for production use.                                                                                            |
| **2.0+**            | Bigger reshapes (e.g. registry-driven add command becomes the primary distribution model). Migration guide ships with every major.                                                                                       |

Releases use [changesets](https://github.com/changesets/changesets). Every PR with a user-visible change adds one. The `Release` GitHub Action aggregates pending changesets into a "Version Packages" PR; merging that publishes to npm.

---

## Where we are: **v0.1.0** (current)

**Status: scaffolds a complete, production-grade Astro site end-to-end.**

What ships today:

- **CLI** (`create-astro-ignite`): five-prompt scaffold (site name, URL, locales, package manager, email provider). `--yes` flag. Detects package manager from `npm_config_user_agent`. Conditional file copy (Resend / SMTP / none). Targeted line-replacement on `site.ts`. `package.json` dep injection per email choice.
- **Template** (~85 files): Astro 5 + Tailwind v4 + native i18n. Geist Sans/Mono via `astro:fonts` (Bunny). Tri-state dark mode with anti-flash inline script. AVIF+WebP+JPEG image pipeline with `<Image>` + `<HeroImage>`. Pure-Astro components, vanilla JS for interactivity, zero framework runtime.
- **Pages**: home, about, contact (Astro Action + Zod + honeypot), blog index/detail, projects index/detail, legal index, 404. Sitemap, RSS, robots, manifest, OG default image. All routes prerender.
- **SEO**: typed `<SEO>` + `<JsonLd>` with `schema-dts`. `@graph` composition. Auto-computed hreflang. Canonical normalization.
- **Content collections**: blog, projects, authors, legal — Zod-typed with i18n folder structure.
- **Layouts**: BaseLayout + ArticleLayout + ProjectLayout + LegalLayout, each a complete styled template.
- **Privacy story**: cookie banner + privacy/terms/cookies legal templates with "review with counsel" disclaimers. Plausible analytics env-gated and consent-gated.
- **Docs site**: minimal Starlight in `apps/docs/` (landing, quick start, benchmarks, coming-soon).
- **CI**: ci.yml (lint + typecheck + e2e scaffold matrix on npm/pnpm/yarn/bun + Lighthouse), release.yml (changesets), lighthouse.yml (perf gate ≥95).

What's intentionally not yet shipped at 0.1.0:

- Real Lighthouse numbers from a CI run (the gate is wired; numbers land at 0.2.0).
- UI primitive components (Button, Card, etc.).
- The `astro-ignite add` command (deferred to 1.1).
- Branded OG images / favicons — placeholders ship.

---

## Near-term: 0.2.x

The next milestones polish and complete the v1 surface without changing the architecture.

### 0.2.0 — UI primitives

The single biggest gap right now. Ten focused components, all pure-Astro, all using `class:list` + scoped `<style>` (no CVA, no helper). They live in `src/components/ui/`.

| Component     | Replaces in current scaffold                                       |
| ------------- | ------------------------------------------------------------------ |
| `Button`      | Inline `.btn` in Hero, Contact, 404                                |
| `Link`        | Ad-hoc `<a>` with external-icon/`rel`/`target` handling            |
| `Card`        | `.post-card`, `.project-card`, FeatureGrid item                    |
| `Badge`       | `.tech-list li`, project status pill                               |
| `Alert`       | `.alert` in Contact form, MDX callouts, Legal disclaimer           |
| `Container`   | Repeated `max-w-[80rem] mx-auto px-5`                              |
| `Section`     | Repeated `py-12 md:py-20 px-5`                                     |
| `Prose`       | Inline `.prose` styles in ArticleLayout                            |
| `Breadcrumbs` | Manual breadcrumbs in Article/Project layouts (also feeds JSON-LD) |
| `Avatar`      | Inline author image rendering                                      |

Plus: a short `COMPONENTS.md` in the template root documenting variant patterns and the "owned, edit freely" expectation.

**Definition of done:** the existing pages refactor to use these components without any visual regression, and the component set is documented in the docs site under `Reference > Components`.

### 0.3.0 — accessibility audit + real Lighthouse numbers

Defending the SEO/perf pitch with measured evidence.

- **Real Lighthouse numbers** published per release on GitHub Releases. CI runs Lighthouse on the scaffolded playground; numbers go on the BENCHMARKS docs page with methodology + raw JSON artifacts.
- **WCAG 2.2 AA audit** of every shipped page. Manual axe-core pass + keyboard navigation walkthrough + screen-reader pass on Nav, ThemeToggle, LocaleSwitcher, CookieBanner, Contact form, Mobile menu. Fixes land in this release. Documented in an `ACCESSIBILITY.md` template doc.
- **Reduced-motion + prefers-contrast** verified on all interactive components.
- **Skip-link, landmark, focus-management** review across all four layouts.

### 0.4.0 — content polish + LQIP for raster

- **Blog post tooling**: reading time computed at build, displayed on cards + article header.
- **Related posts**: tag-overlap-based "More like this" component for ArticleLayout.
- **MDX components**: callouts, code-block copy button, image-with-caption, definition list. All pure-Astro, exported from a single `mdx-components.ts` users register globally.
- **LQIP for raster**: today the implementation gracefully no-ops if the file path can't be resolved from `meta.src`. 0.4 either lands a working raster path (sharp + filesystem walk during build) or is honest about removing the LQIP layer if it's not pulling its weight. Either way: ship a real answer.
- **Search**: Pagefind integration as a registry component (manual install for now; becomes one-command via `add` at 1.1).

### 0.5.0 — deployment story

The scaffold defaults to `@astrojs/node` standalone today. Real users deploy elsewhere.

- **Adapter swap recipes** in DEPLOY.md: Vercel, Netlify, Cloudflare Pages, GitHub Pages (static-only), Deno Deploy, Bun runtime.
- **Static-only mode**: a `--static` init flag (or post-init refactor recipe) that drops the contact form, removes the adapter, and produces fully-static output for users who don't need server features.
- **One-click deploy buttons** in the docs site + generated README, pre-wired to the scaffolded shape.

### 0.6.0 — i18n depth

- **Per-locale parallels for static pages**: ship `[lang]/about.astro`, `[lang]/contact.astro`, `[lang]/projects/index.astro`, `[lang]/legal/[...slug].astro`. Currently only `[lang]/blog/[...slug].astro` exists. With monolingual config they generate zero paths (free); with multilingual config they activate.
- **Translation tooling**: a small `t:check` script that flags missing keys per locale, suggested values, and untranslated content collection entries.
- **Locale-specific OG images**: `siteConfig.defaultOgImage` already supports `Record<locale, string>`; ship a real example with `og-en.png` + `og-es.png` so the pattern is concrete.

---

## Path to 1.0

After 0.6, every release should be a polish step toward stability. The 1.0 commitment is:

- **API surface stable** — `<SEO>`, `<JsonLd>`, `<Image>`, `<HeroImage>`, all UI primitives, and the `siteConfig` shape.
- **Template structure stable** — the path layout under `src/`, the Zod schemas for content collections, the conventions documented.
- **CLI flag/prompt set stable** — adding a new prompt is a major version bump.
- **Documented breaking changes** — deprecations get one minor's worth of warning before removal.

What 1.0 does **not** mean:

- Frozen UI primitives (we'll keep adding via the registry).
- Frozen content schemas (additive fields are non-breaking).
- "We've stopped shipping" — quite the opposite.

Realistic shape: 0.7–0.9 are bug fixes, doc improvements, polish on the 0.x feature set. 1.0 lands when we have at least three known production users who've upgraded clean across at least one minor.

---

## Mid-term: 1.x

### 1.1.0 — `astro-ignite add`

The registry-driven `add` command. This is the second half of the shadcn philosophy — we shipped the scaffold half at 0.1; this is when the kit grows.

Shape:

```bash
astro-ignite add tabs                  # adds Tabs to src/components/ui/
astro-ignite add accordion             # adds Accordion
astro-ignite add megamenu              # adds the heavy navigation primitive
astro-ignite add pagefind-search       # adds a search index + UI
astro-ignite add og-generation         # adds Satori-based dynamic OG image generation
```

How it works:

- A **registry manifest** at `https://astro-ignite.dev/registry/index.json` lists components, their dependencies (file deps + npm deps), and the Astro version they require.
- The CLI reads the user's `astro-ignite.json` config (created by 1.1's `init` command — see below), figures out paths and aliases, fetches the component files, and writes them into `src/components/ui/`. Adds any required npm deps to `package.json`. Re-runs install.
- Each component is **fully owned post-install**. `add` will refuse to overwrite by default; `add --overwrite` is opt-in for re-syncing.

This release also adds:

- **`astro-ignite init`** — adds the kit to an _existing_ Astro project (not just greenfield). Detects the project, writes config, sets up Tailwind/aliases/utils.
- **`astro-ignite list`** — shows what registry components exist.
- **`astro-ignite diff <component>`** — shows differences between your local component and the upstream registry version.

### 1.2+ — registry components

Each is its own minor release once it lands.

The first wave (highest-leverage):

| Component                  | Why                                                                                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tabs**                   | Universal, useful for docs, settings, demo pages. Pure `<details>` + vanilla JS.                                                                                 |
| **Accordion**              | FAQ pages, collapsed sections. Pure `<details>` + scoped CSS.                                                                                                    |
| **MegaMenu**               | The heavy nav primitive. Replaces simple Nav for sites with deep hierarchy. ~150 lines of vanilla JS for keyboard nav, focus management, mobile drawer fallback. |
| **DropdownMenu**           | Generic dropdown abstracted from ThemeToggle/LocaleSwitcher. `<details>` + vanilla JS.                                                                           |
| **Modal/Dialog**           | `<dialog>` element + show/hide vanilla JS. Used for "Are you sure?" UX.                                                                                          |
| **Toast**                  | Notification stack + ARIA live region. Vanilla JS.                                                                                                               |
| **Pagination**             | Blog/projects index pagination.                                                                                                                                  |
| **Search (Pagefind)**      | Build-time search index + UI component.                                                                                                                          |
| **OG generation (Satori)** | Build-time dynamic OG images. Replaces the static default.                                                                                                       |

The second wave (form fields):

| Component                          | Why                                                           |
| ---------------------------------- | ------------------------------------------------------------- |
| **Input / Textarea / Select**      | Form primitives styled to match the theme.                    |
| **Checkbox / Radio / Switch**      | Form primitives.                                              |
| **Label / FieldGroup / FormError** | Composition for accessible forms.                             |
| **DatePicker**                     | The hard one — vanilla JS or accept a small framework island. |

The third wave (data/visuals):

| Component             | Why                                                              |
| --------------------- | ---------------------------------------------------------------- |
| **Table / DataTable** | Sortable table for content like changelog or product comparison. |
| **Skeleton**          | Loading placeholders if the user adds client-side data.          |
| **Tag / TagList**     | Distinct from Badge: clickable, links to filtered list pages.    |
| **Tooltip**           | Vanilla JS + scoped CSS. Accessibility-careful.                  |
| **Avatar variants**   | Group, with status indicators, etc.                              |

Components in the third wave probably end at the framework boundary — DataTable with sort/filter benefits a lot from React. We'll evaluate as the wave lands.

### 1.5+ — multiple starter templates

The CLI's first prompt becomes "What kind of site?" with three or four canonical shapes:

- **Marketing / portfolio** — current default. Minimal blog, projects, contact.
- **Content site** — heavier blog setup: tags, authors index, search, RSS sub-feeds, related posts wired up.
- **Documentation** — Starlight-based, dogfoods astro-ignite for the marketing pages (the current docs site graduates).
- **Landing page** — single-page, no blog, no projects, optimized for waitlist/signup conversion.

Each is its own template directory under `packages/templates/<name>/`. Conditional logic in the scaffolder picks the right one. Most components are shared via the registry.

---

## Long-term: 2.x

### 2.0 — registry-first distribution

By 2.0 the architecture inverts:

- **Templates become thin** — the marketing/portfolio template ships only what's truly common. Most components arrive via `add` after init.
- **The CLI's job is narrowed** — pick a template, init it, run `add` for everything else.
- **Versioning per component** — components in the registry have their own semver. Users `update` granularly.

This is the model that lets the kit grow to 50+ components without bloating the default scaffold.

### 2.x — community registries

Like shadcn marketplaces or Tailwind plugins:

- Users can publish their own registries (`add --registry https://my-company.com/components/`).
- The CLI supports multiple registries simultaneously.
- A discovery page on the docs site lists known community registries.

### Beyond 2

Honest answer: we'll know what 3.x looks like when 2.x is shipping. Things that _might_ land later:

- **AI-assisted scaffolding** — "Generate a portfolio for a designer who specializes in X" produces tailored copy + image suggestions.
- **First-party CMS adapter recipes** (Sanity, Payload, Decap, Tina) as registry components.
- **A11y / SEO scoring** built into the CLI — `astro-ignite check` runs Pa11y + Lighthouse + JSON-LD validation against a local dev server.

These are speculative. Don't build a project plan around them.

---

## Out of scope (now and likely forever)

Things we're saying no to:

- **Becoming a framework.** No runtime npm package. No `<IgniteApp>` wrapping. Code stays owned.
- **Visual page builder / no-code editor.** Code-first or nothing.
- **Default heavy framework runtime** (React/Vue/Svelte preinstalled). Always a one-command opt-in via `astro add`.
- **CMS opinions baked into the scaffold.** Content collections are the default; CMS adapters are recipes, not first-class.
- **Authentication / user accounts.** Out of scope for marketing/blog/portfolio. Recipe-only if/when.
- **E-commerce primitives.** Specialized — different audience, different tool.
- **Multi-tenancy / SaaS scaffolds.** Same reasoning.
- **Per-component theming systems.** The `@theme` token + CSS-variable approach is the theming system. No CSS-in-JS, no runtime style engine.

If you find yourself fighting these, you're probably reaching for the wrong tool. Reach for Next.js, Remix, or SvelteKit — astro-ignite isn't trying to compete with them.

---

## Risks + open questions

These are the things that could shift the roadmap.

### "What if Astro 6 breaks something major?"

Astro 5 is stable but Astro 6 will arrive. Breaking changes affect: i18n routing config (touched by every page), `astro:content` (touched by all collections), `astro:fonts` (might consolidate), Adapter API (the contact form depends on it). Migration guide will ship within two weeks of Astro 6 stable.

### "What if Tailwind v4 stable looks different from beta?"

We pinned v4 beta. If stable shifts the `@theme` API or the `@variant` directive, every CSS file in the template needs an update. Locked to ride alongside Tailwind's stable cadence — first patch release after their 4.0 ships will track.

### "What if the hard 95-mobile Lighthouse gate is too strict?"

The gate exists because it's the only way to defend the perf pitch. If it turns out to flake on CI runners more than expected, we relax to median-of-5 (vs current 3) before lowering the floor. We don't lower the floor.

### "Should we ship a React variant of the template?"

Probably not. The whole point of pure Astro is the perf pitch. A React-default variant is a different product. Closer answer: at 2.x we might ship a registry component called `react-island-pattern` that demonstrates how to add React the right way for the few components that genuinely need it.

### "What about Solid? Vue? Svelte? Preact?"

Same answer as React. The kit is framework-agnostic by being framework-free. Users add what they want via `astro add`. We don't pick winners.

### "What if `astro-ignite add` needs SSR/serverless infrastructure to host the registry?"

It doesn't — the registry is just a static JSON manifest hosted alongside the docs site. Adding components is `fetch` + `fs.writeFile`. No runtime backend. We control complexity by keeping the architecture static.

---

## How to influence this roadmap

The order things ship in is informed by:

1. **Bugs blocking real users** — top priority always.
2. **Feedback from actual users** building real sites with astro-ignite. Open issues with use cases, not just "I want feature X."
3. **Maintainability cost** — low-cost adds happen sooner. High-cost (DataTable, DatePicker) happen when the use case is loud.
4. **The principles at the top of this file.** Things that don't fit them don't ship even if popular.

Want to argue for a reorder? Open an issue with:

- The actual use case you're hitting (with a link to a real project if possible).
- What you tried as a workaround.
- Why the workaround isn't sufficient.

A concrete pull request beats an issue. A working prototype of the component as a pure-Astro file is the strongest signal you can send.

---

## Don't expect

- **Dates.** Releases ship when ready. Inserting target dates would force trade-offs that hurt the principles.
- **Backwards compatibility shims for unannounced breaking changes.** We'll never silently break things; we will break things at minor versions in 0.x with explicit changelogs.
- **Free support for production deployments.** This is open source. Issues are for bugs and concrete proposals; not "help me deploy."
- **Reciprocal contribution credit.** No "founder" labels, no hierarchy. Contributors are listed in changelogs and that's it.

---

_Last updated: 2026-05-10. This document evolves with the project — re-read it before planning multi-month integrations._
