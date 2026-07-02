# apps/site Boundary

The marketing landing for astro-ignite itself. **Manual mirror of the
`starter` template** — changes here do **not** reach CLI users.

## Public Contracts

- **Source of truth:** `packages/templates/starter/` is the canonical
  starter template. Any change that should reach CLI users lives there
  first.
- **Specs (inherited from starter):**
- `openspec/specs/templates-*/spec.md` (all of them)

## Boundary Rules

- **This directory is a mirror, not a source.** When you fix a bug here,
  mirror it back to `packages/templates/starter/` in the same PR, or
  document why it doesn't belong there in `openspec/progress/impl_<name>.md`.
- All the starter rules apply: tokens, no framework JS, i18n parallels,
  consent-gated analytics, `inlineStylesheets: 'always'` Tailwind-first
  styling, `@graph` JSON-LD, perf budget.
- The blog under `src/content/blog/` is real content (release notes,
  posts about the project). Banners for these posts must come from the
  claude-design HTML pipeline; see `openspec/specs/banner-pipeline/spec.md`.
- `scripts/banners/generate.mjs` renders the HTML sources in this directory
  to PNGs using Playwright's `chrome-headless-shell` binary directly (no
  Puppeteer, no `packages/design-fetch/` import). `design-fetch` is a
  separate, manually-invoked one-off CLI (see `packages/design-fetch/AGENTS.md`)
  used to pull a fresh claude-design bundle down to a scratch directory when
  the design system changes — its output isn't wired into this script.

## Expanding The Boundary

- Adding a new page only relevant to the marketing site (e.g., a
  `/launch` event page) → fine to live only here; do **not** add it to
  `packages/templates/starter/`. Note the rationale in
  `openspec/progress/impl_<name>.md`.
- Adding a new chrome component (header item, footer link, etc.) → add
  to `packages/templates/starter/` first, then mirror here.
- Audits run against starter, not against this app. The `i18n-parallels`
  audit is template-scoped; you can break i18n parallels here only if
  the same break exists in starter (and then you've got a starter bug).

## Known divergences from starter template

These features exist in `packages/templates/starter/` but intentionally
differ here:

- **Hero images.** Blog posts and project entries use a `heroImage` Astro
  asset field rendered via `components/image/PriorityImage.astro` (eager,
  `fetchpriority="high"`). The starter template uses a CSS gradient cover
  with no image asset; its `ogImage` field is optional and only for
  OG/social previews. This marketing site ships real article images, so
  the hero-asset pattern from the claude-design banner pipeline is used
  instead.
- **`localize()` absent.** The starter's `src/i18n/index.ts` exports
  `localize(value, locale)` for resolving localized siteConfig fields and
  content `bio` values. That function is not present here — apps/site does
  not use localized siteConfig values.
- **No Astro Actions, no adapter.** The starter template pins
  `@astrojs/node@^11` and handles the contact form with an Astro Action.
  This site builds with `output: 'static'` and no adapter; the contact
  form posts to a Cloudflare Pages Function (`functions/api/contact.ts`)
  instead — the one server-side piece, deployed alongside the static
  `dist/` output. There is no `src/actions/` directory here.

When syncing a bug-fix from this mirror back to the starter template,
check these divergences first: the fix may need adapting rather than
direct copy-paste.

## End-to-end tests

The `site` Playwright project at the workspace root boots this app via
`astro dev` and runs every `tests/e2e/common/` spec plus the
site-specific specs under `tests/e2e/site/`. See
[`tests/e2e/AGENTS.md`](../../tests/e2e/AGENTS.md). Scoped run:

```bash
pnpm test:e2e --project=site
```
