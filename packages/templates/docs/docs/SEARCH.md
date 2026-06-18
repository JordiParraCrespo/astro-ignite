# Search

Full-text search is powered by **Pagefind** — a static-site search library that indexes your `dist/` folder after every build. No server, no third-party API, no crawler subscription.

## How it works

The `postbuild` script in `package.json` runs after `astro build`:

```
"postbuild": "pagefind --site dist"
```

Pagefind crawls every HTML file in `dist/`, extracts text, and writes a binary search index to `dist/pagefind/`. The search dialog (`src/components/docs/SearchBox.astro`) lazy-loads `/pagefind/pagefind.js` on first open and queries the index client-side.

## Dev mode

In `pnpm dev`, the `dist/pagefind/` bundle doesn't exist yet. The dialog opens, but returns an "unavailable" message pointing to `pnpm build && pnpm preview`.

To get search working locally:

```bash
pnpm build   # builds dist/ and runs pagefind
pnpm preview # serves dist/ — search is fully functional here
```

## Configuring the index

### Exclude pages from search

Add a `data-pagefind-ignore` attribute to the wrapping element in a layout or page:

```astro
<article data-pagefind-ignore>
  {/* This page's content won't appear in search results */}
</article>
```

To exclude an entire section type, add it to the layout file for that section — e.g. to exclude all legal pages, add it to `src/layouts/LegalLayout.astro`.

### Exclude headings or blocks within a page

```html
<div data-pagefind-ignore="all">Content not indexed</div>
```

A `<section>` or `<div>` with `data-pagefind-ignore="all"` is skipped entirely. Omit the value (just `data-pagefind-ignore`) to suppress the block from results but still allow parent-page results to surface.

### Set page metadata

Pagefind reads frontmatter exposed via `data-pagefind-meta`:

```astro
<html lang={lang} data-pagefind-meta={`language:${lang}`}></html>
```

The docs template doesn't do this by default. If you need per-language result weighting, add the attribute to `src/layouts/BaseLayout.astro`.

### Change the excerpt length

In `SearchBox.astro`, the `pagefind.options` call sets `excerptLength`:

```ts
await pagefind.options?.({ excerptLength: 15 });
```

Increase this number to show more surrounding context in sub-results. Setting it to `0` uses the Pagefind default (30 words).

## Internationalizing search strings

The dialog reads UI strings via the `useTranslations()` helper. Search-related keys live in `src/i18n/en.json` (and the matching locale files):

```json
"search": {
  "label": "Search docs…",
  "placeholder": "Search docs…",
  "query": "Search query",
  "empty": "Start typing to search the docs.",
  "noResults": "No results for",
  "unavailable": "Search is only available on a built site.",
  "unavailableHint": "Run <code>pnpm build && pnpm preview</code>.",
  "navigate": "to navigate",
  "open": "to open",
  "close": "to close",
  "esc": "Esc",
  "docsRoot": "Docs"
}
```

Add matching keys to each locale file when adding a new language.

## Removing search

1. Delete `<SearchBox />` from `src/components/docs/SidebarNav.astro`.
2. Delete `src/components/docs/SearchBox.astro`.
3. Remove `pagefind` from `devDependencies` in `package.json`.
4. Remove the `postbuild` script from `package.json`.
5. Remove the `search.*` keys from each `src/i18n/*.json` file.
