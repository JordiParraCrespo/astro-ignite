# Content collections

The documentation itself (MDX) plus legal pages. **The schema lives one
level up in `src/content.config.ts`** — this folder holds the entries.

## Layout

- `docs/{locale}/{...slug}.mdx` — the doc pages. The locale-folder
  layout is mandatory (it drives the i18n parallel routes and the
  catch-all router in `src/pages`). Default locale is `en`.
- `legal/{locale}/{privacy,terms,cookies}.mdx`

## Rules

- **New field / collection → edit `src/content.config.ts`** (Zod). Doc
  frontmatter carries `title`, `description`, and a handful of optional
  fields (`canonical`, `draft`, `noindex`, `lastUpdated`, `readingTime`,
  `tags`) — keep new fields in the schema, not ad hoc.
- Keep the `{locale}/` folder layout for every localized collection; a
  doc that exists in `en/` should gain a sibling under each locale you
  ship (`siteConfig.locales`).
- Sidebar nav, breadcrumbs, and prev/next are **not** derived from
  frontmatter or folder structure — they're all driven by the
  hand-maintained array in `src/config/sidebar.ts`. Adding an MDX file
  here makes it renderable at its route, but it won't appear in the
  sidebar, breadcrumbs, or prev/next until you also add it to
  `sidebar.ts`.
- Body is MDX; prose styling comes from `DocsLayout`, not per-file
  `<style>`.
