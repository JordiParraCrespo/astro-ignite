# Lib

Small, owned helpers. Named exports, no side-effecting imports.

## Files

- `cn.ts` — class-merge helper used by every component.
- `toast.ts` — `toast(...)` dispatches a `window` event consumed by
  `<Toaster />` (`components/ui/toaster.astro`).
- `docs-md.ts` — AI-native helpers: `docToMarkdown` renders a docs
  collection entry as clean Markdown (strips MDX `import`/`export`
  lines, preserves fenced code blocks); `pageHref`/`mdHref`/`mdSlugParam`
  map an entry id to its HTML path and `.md` path, mirroring the route
  structure (`[...slug].astro` + `[lang]/[...slug].astro`). Used by the
  `.md` routes and the `/llms-full.txt` bundle.
- `image/blur.ts` — blur-placeholder data for non-LCP images (heroes use
  `components/image/PriorityImage.astro`, which has no blur).
- `jsonld/` — typed `schema-dts` node builders + an `index.ts` barrel;
  `DocsLayout`/`BaseLayout` assemble these into the page `@graph`.

This template ships **no `email/`** (no contact form / Actions) — don't
add runtime deps for features the docs site doesn't have.

## Rules

- No deep relative paths — import via the `@/` alias (`@/lib/cn`).
- No abstraction before the third copy.
- Add a JSON-LD type as its own builder file + export from
  `jsonld/index.ts`; don't inline `@graph` nodes in components.
