# Lib

Small, owned helpers. Named exports, no side-effecting imports.

## Files

- `cn.ts` — class-merge helper used by every component.
- `toast.ts` — `toast(...)` dispatches a `window` event consumed by
  `<Toaster />` (`components/ui/toaster.astro`).
- `image/blur.ts` — blur-placeholder data for non-LCP images (heroes use
  `PriorityImage`, which deliberately has no blur).
- `jsonld/` — typed `schema-dts` node builders, one per type
  (`organization`, `person`, `website`, `webPage`, `blogPosting`,
  `creativeWork`, `breadcrumbList`) + `types.ts` and an `index.ts`
  barrel. Layouts assemble these into the page `@graph`.
- `email/` — provider abstraction for the contact form: `index.ts`
  (the seam) + `resend.ts` + `smtp.ts`. **The CLI strips these deps when
  a template doesn't ship `email/index.ts`** — keep that file as the
  detection point.

## Rules

- No deep relative paths — import via the `@/` alias (`@/lib/cn`).
- No abstraction before the third copy; these stay small and editable.
- Add a new JSON-LD type as its own builder file + export it from
  `jsonld/index.ts`; don't inline `@graph` nodes in components.
