# Layouts

Page shells. They own `<head>`, the JSON-LD graph, and the LCP image
contract — content pages and route files compose them.

## Files

- `BaseLayout.astro` — the root shell every page wraps. Renders
  `<head>` (via `seo/SEO.astro`), assembles the `schema-dts` **`@graph`**
  from each page's contributed node, sets the lang/dir, and emits
  `<link rel="preload" as="image">` for anything passed via
  `preloadImages={[…]}`. Components can't reach into `<head>`, so a page
  with a hero passes its image up through this prop.
- `ArticleLayout.astro` / `ProjectLayout.astro` — blog post / project
  detail shells. They render the hero through
  `components/image/PriorityImage.astro` (eager, `fetchpriority="high"`,
  no blur placeholder) and preload it via `BaseLayout`. _(Diverges from
  the starter template, which uses a CSS gradient cover instead of an
  image asset — see apps/site/AGENTS.md § Known divergences.)_
- `LegalLayout.astro` — privacy/terms/cookies prose shell.

## Rules

- **JSON-LD composes via `@graph`** — a layout/page contributes its node
  (built from `src/lib/jsonld/*`); never emit a standalone
  `<script type="application/ld+json">`.
- `width` + `height` are **required** on hero images so the slot is
  reserved before CSS loads (zero CLS).
- Set `<html lang>`/`dir` from the active locale; route titles/links go
  through i18n (`src/i18n`) and `getRelativeLocaleUrl`.
- Styling stays token-resolved and Tailwind-first (see
  `components/AGENTS.md`).
