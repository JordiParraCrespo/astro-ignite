# Full-text search (Pagefind)

The docs template ships full-text search powered by [Pagefind](https://pagefind.app/). Pagefind is a post-build static search library — it indexes the built HTML and ships the index alongside your static files.

## Why search doesn't work in dev

Pagefind indexes the production build output. There is no index during `pnpm dev`, so the search dialog opens but returns no results. To test search:

```bash
pnpm build    # builds the site and runs the postbuild indexer
pnpm preview  # serves the built output — search now works
```

The `postbuild` script in `package.json` runs `pagefind --site dist` automatically after every build.

## What gets indexed

By default Pagefind indexes the text content of every HTML file in `dist/`. For a docs site this means every docs page.

### Excluding pages from search

Add `data-pagefind-ignore` to the element you want to skip:

```html
<!-- Exclude a sidebar or header from search hits -->
<aside data-pagefind-ignore>...</aside>

<!-- Exclude an entire page's main content -->
<main data-pagefind-ignore>
  This page won't appear in results.
</main>
```

For individual components, the `DocsLayout.astro` wraps the main content in a `<div data-pagefind-body>` so only the docs body is indexed — headers, footers, sidebars, and nav elements are excluded automatically.

### Excluding a page entirely

Add `noindex: true` to the page's frontmatter — the page still renders and is reachable by URL, but is excluded from the sitemap and has a `robots` noindex meta tag added, which Pagefind also respects:

```yaml
---
title: Internal reference
description: Not meant for public search.
noindex: true
---
```

For a draft page you don't want indexed, use `draft: true` instead.

## Customizing the search dialog

The search dialog is in `src/components/docs/SearchBox.astro`. It initialises Pagefind's UI with default options. Common customizations:

### Change the number of results per page

```js
// In SearchBox.astro's <script>
new PagefindUI({
  element: '#search',
  pageSize: 10, // default is 5
});
```

### Add result excerpts

```js
new PagefindUI({
  element: '#search',
  showSubResults: true,
  excerptLength: 25,
});
```

### Filter by metadata

If you add `data-pagefind-meta` attributes to your docs pages, you can filter search results by them:

```astro
<!-- In DocsLayout.astro or a page -->
<article data-pagefind-meta="category:guide">
  ...
</article>
```

Then surface the filter in the UI:

```js
new PagefindUI({
  element: '#search',
  filters: { category: 'guide' },
});
```

See the [Pagefind filtering docs](https://pagefind.app/docs/filtering/) for the full filter API.

## Keyboard shortcut

The search box is triggered by the `/` key and `Cmd+K` / `Ctrl+K`. The keybinding is wired in `SearchBox.astro`. To change it, update the `keydown` listener in that component's `<script>` block.

## Rebuilding the index

The index is rebuilt on every `pnpm build`. In CI the build runs before the deployment step, so the index is always fresh. For local development, re-run `pnpm build && pnpm preview` to pick up new content in search.

## Adding search to a page outside the docs collection

The search index covers all built HTML. If you add a new Astro page and want it excluded from results, add `data-pagefind-ignore` to its `<main>` element. If you want a richer search metadata label (displayed in the result), add `data-pagefind-meta`:

```astro
<main data-pagefind-meta="title:My custom page, tag:reference">
  ...
</main>
```

## Troubleshooting

**"No results" after build** — confirm `dist/pagefind/` was created. If missing, the `postbuild` script didn't run. Run `pagefind --site dist` manually.

**Results from a previous build appear** — Pagefind writes a deterministic index; stale results mean the build ran against cached output. Delete `dist/` and rebuild.

**Search dialog styles don't match the site theme** — Pagefind injects its own CSS. To override, add styles targeting `.pagefind-ui` after Pagefind's stylesheet in `SearchBox.astro`. Use CSS custom properties where available (see `pagefind.app/docs/ui-usage/`).
