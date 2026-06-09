# Content collections

Authored content (MDX/JSON) for blog, projects, authors, and legal
pages. **The schema lives one level up in `src/content.config.ts`** —
this folder holds the entries.

## Layout

- `blog/{locale}/{slug}.mdx`, `projects/{locale}/{slug}.mdx` — the
  locale-folder layout is mandatory (it's how i18n parallel routes find
  the right entry). Default locale is `en`.
- `legal/{locale}/{privacy,terms,cookies}.mdx`
- `authors/<id>.json` — author records referenced by blog posts.

## Rules

- **New collection or field → edit `src/content.config.ts`** (Zod
  schema). Image fields (e.g. the optional `ogImage`, author `image`)
  are validated as real assets via Astro's `image()` helper, so
  dimensions are known at build (zero CLS).
- Keep the `{locale}/` folder layout for every localized collection;
  a post that exists in `en/` should gain a sibling under each
  additional locale you ship.
- Blog and project cards (and their detail-page heroes) render a
  token-resolved CSS gradient cover, not a hero image — there is no
  `heroImage` field. To give a post a social/OG preview, set the
  optional `ogImage` (generated from HTML sources, not hand-drawn SVG —
  see the template's `docs/IMAGES.md`); otherwise OG falls back to the
  site-wide default banner.
- Body content is MDX; prose styling is handled by the layout, not
  per-file `<style>`.
