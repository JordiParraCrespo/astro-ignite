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
  frontmatter typically carries `title`, `description`, and sidebar
  ordering metadata — keep those in the schema, not ad hoc.
- Keep the `{locale}/` folder layout for every localized collection; a
  doc that exists in `en/` should gain a sibling under each locale you
  ship (`siteConfig.locales`).
- Sidebar nav + breadcrumbs + prev/next are derived from collection
  entries and their ordering metadata — add a page by adding an MDX file
  in the right place, not by editing nav by hand.
- Body is MDX; prose styling comes from `DocsLayout`, not per-file
  `<style>`.
