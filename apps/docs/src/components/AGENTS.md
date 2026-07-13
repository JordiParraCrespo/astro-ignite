# Components

UI for the docs site. Organized by intent, not by page.

## Layout

- `ui/` — **atoms** (shadcn-style, from the astro-ignite registry, owned
  here). Singletons flat (`button.astro`, …); compound families in their
  own folder (`card/`, `tabs/`, `accordion/`, `dialog/`,
  `dropdown-menu/`), one file per part.
- `docs/` — the documentation chrome (`SidebarNav`, `OnThisPage`,
  `Breadcrumbs`, `PrevNext`, `SearchBox` — the `<dialog>`-based command
  palette, `ComponentShowcase`) plus the MDX content primitives
  registered in `mdx-components.ts`: `Callout`, `CodeBlock`, `CodeGroup`,
  `CardGroup`, `Frame`, `Steps`/`Step`, `Expandable`,
  `ParamField`/`ResponseField`, `Icon` (+ `icons.ts`), `Tree`, `Update`,
  `Mermaid`, `Columns`, `Banner`, `Tiles`/`Tile`, `Accordion`/
  `AccordionItem`, the `Tabs` family, `Tooltip`. `AiActions` also lives
  here but is **not** in `mdx-components.ts` — `DocsLayout.astro`
  imports and renders it directly in the doc header, so it isn't usable
  as an MDX tag.
- `common/` — site chrome (`Footer`, `Brand`, `ThemeToggle`,
  `LocaleSwitcher`, `Analytics`). No `Header` — the docs sidebar
  replaces the top nav.
- `seo/` — `SEO.astro` + `JsonLd.astro` (the page's `@graph` node).
- `legal/` — `CookieBanner.astro` (consent gate). `not-found/` — 404
  hero. `error/` — 500 hero.
- `blocks/` — `not-found-state.astro` (registry-showcase page content,
  not part of the docs template mirror).

## Rules (enforced)

- **Astro + vanilla JS only** — no React/Vue/Svelte/Radix. Native HTML
  primitives: `<details name>` (accordion), `<dialog>` (dialog + search),
  popover API (dropdown), CSS (tooltip), custom elements (`ai-tabs`,
  `ai-toaster`).
- **Design tokens only** — Tailwind v4 utilities resolving `--color-*`
  (`bg-[var(--color-bg)]`); never raw zinc/hex.
- **Scoped `<style>` only for what Tailwind can't express**, each with a
  leading `<!-- tailwind-exception: <reason> -->` comment.
- **No comments** unless the _why_ is non-obvious; **no single-class
  atoms**.
- Merge classes with `cn` from `src/lib/cn.ts`.

Shared atoms belong in the registry first, then here.
