# Lib

Small, owned helpers. Named exports, no side-effecting imports.

## Files

- `cn.ts` — class-merge helper used by every component.
- `toast.ts` — `toast(...)` dispatches a `window` event consumed by
  `<Toaster />` (`components/ui/toaster.astro`).
- `blog.ts` — single source of truth for the `blog` collection
  (locale-filtered fetch + sort, adjacency, related posts, tag counts,
  pagination meta). Routes don't query the collection directly.
- `projects.ts` — same role for the `projects` collection:
  `getProjectsForLocale(locale, order)` (locale-filtered, sorted by
  `datePublished`; `order` is `'asc' | 'desc'`, default `'desc'`) and
  `projectSlug(project)` to strip the locale prefix off an entry id.
- `reading-time.ts` — `readingTimeMinutes(body)` estimates reading time
  at 200 wpm; used for the "{n} min read" badge on blog cards.
- `image/blur.ts` — blur-placeholder data for non-LCP images (heroes use
  `PriorityImage`, which deliberately has no blur).
- `jsonld/` — typed `schema-dts` node builders, one per type
  (`organization`, `person`, `website`, `webPage`, `blogPosting`,
  `creativeWork`, `breadcrumbList`) + `types.ts` and an `index.ts`
  barrel. Layouts assemble these into the page `@graph`.
- `email/` — provider abstraction for the contact form: `index.ts`
  (the seam) + `resend.ts` + `smtp.ts` in this template source. A
  scaffolded project only gets `index.ts` plus whichever transport
  matches the chosen provider — `scaffold.ts`'s `CONDITIONAL_FILES` gate
  drops the other one. **The CLI strips the matching deps when a
  template doesn't ship `email/index.ts` at all** — keep that file as
  the detection point.

## Rules

- No deep relative paths — import via the `@/` alias (`@/lib/cn`).
- No abstraction before the third copy; these stay small and editable.
- Add a new JSON-LD type as its own builder file + export it from
  `jsonld/index.ts`; don't inline `@graph` nodes in components.
