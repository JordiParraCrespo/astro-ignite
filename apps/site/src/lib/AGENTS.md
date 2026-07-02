# Lib

Small, owned helpers. Named exports, no side-effecting imports.

## Files

- `cn.ts` — class-merge helper used by every component.
- `blog.ts` — site-specific utilities for the `blog` collection:
  `GLYPH_MAP` (tag → display glyph), `glyphFor`, `initialsFor`,
  `readingTime`, the `BlogCardData` type, and `getBlogCards()`. No
  adjacency (prev/next) or pagination-meta logic — routes that need
  that query the collection directly.
- `clipboard.ts` — `copyToClipboard(text)` thin wrapper around the
  Clipboard API; returns `false` when unavailable.
- `image/blur.ts` — blur-placeholder data for non-LCP images (heroes use
  `PriorityImage`, which deliberately has no blur).
- `jsonld/` — typed `schema-dts` node builders, one per type
  (`organization`, `person`, `website`, `webPage`, `blogPosting`,
  `creativeWork`, `breadcrumbList`) + `types.ts` and an `index.ts`
  barrel. Layouts assemble these into the page `@graph`.

## Rules

- No deep relative paths — import via the `@/` alias (`@/lib/cn`).
- No abstraction before the third copy; these stay small and editable.
- Add a new JSON-LD type as its own builder file + export it from
  `jsonld/index.ts`; don't inline `@graph` nodes in components.
