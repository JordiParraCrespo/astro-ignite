# Layouts

Page shells. They own `<head>`, the JSON-LD graph, and the docs
furniture — pages compose them.

## Files

- `BaseLayout.astro` — the root shell. Renders `<head>` (via
  `seo/SEO.astro`), assembles the `schema-dts` **`@graph`** from each
  page's node, and sets `<html lang>` (no `dir` attribute — there's no
  RTL support yet). No `preloadImages` prop — the docs template doesn't
  preload hero images.
- `DocsLayout.astro` — the documentation reading shell: wraps content
  with `SidebarNav`, `OnThisPage` (TOC), `Breadcrumbs`, and `PrevNext`.
  Most doc pages render through this.
- `LegalLayout.astro` — privacy/terms/cookies prose shell.
- `ComponentsLayout.astro` — apps/docs-only shell for the `/components`
  registry-showcase pages (reuses `SidebarNav`/`ThemeToggle`/
  `LocaleSwitcher`, no `OnThisPage`/`PrevNext`). Not part of the docs
  template mirror.

## Rules

- **JSON-LD composes via `@graph`** — contribute a node (from
  `src/lib/jsonld/*`); never emit a standalone
  `<script type="application/ld+json">`.
- Titles/links go through i18n (`src/i18n`) + `getRelativeLocaleUrl`.
- Sidebar/TOC structure derives from the docs collection — keep it
  data-driven, not hand-listed per page.
- Styling stays token-resolved and Tailwind-first (see
  `components/AGENTS.md`).
