# Content collections

Authored content (MDX/JSON) for blog, projects, authors, and legal
pages. **The schema lives one level up in `src/content.config.ts`** —
this folder holds the entries.

## Layout

- `blog/{locale}/{slug}.mdx`, `projects/{locale}/{slug}/index.mdx` — the
  locale-folder layout is mandatory (it's how i18n parallel routes find
  the right entry); projects nest under a per-slug directory (the
  `projects` collection loader globs `*/*/index.mdx`), blog does not.
  Default locale is `en`. No content has been authored under
  `projects/` yet.
- `legal/{locale}/{privacy,terms,cookies}.mdx`
- `authors/<id>.json` — author records referenced by blog posts.

## Rules

- **New collection or field → edit `src/content.config.ts`** (Zod
  schema). `heroImage` is validated as a real asset via Astro's
  `image()` helper, so dimensions are known at build (zero CLS).
  _(Diverges from the starter template, which has no `heroImage` field
  and uses a CSS gradient cover — see apps/site/AGENTS.md § Known
  divergences.)_
- Keep the `{locale}/` folder layout for every localized collection;
  a post that exists in `en/` should gain a sibling under each
  additional locale you ship.
- Hero/banner images are **generated from HTML sources**, not
  hand-drawn SVG — see the root `AGENTS.md` § Banner & hero images (or
  `openspec/specs/banner-pipeline/spec.md`). Reference them from
  frontmatter `heroImage`. (`docs/IMAGES.md` in this app documents the
  `<Image>`/`<PriorityImage>` responsive-image components, not the
  banner-generation pipeline — don't confuse the two.)
- Body content is MDX; prose styling is handled by the layout, not
  per-file `<style>`.
