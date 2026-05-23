---
'astro-ignite': minor
'create-astro-ignite': minor
---

Upgrade the templates to **Astro 6.3**.

Dependency bumps (starter, docs, and the `apps/*` mirrors):

- `astro` `^5.1.0` → `^6.3.0`
- `@astrojs/node` `^9` → `^10` (the adapter major that pairs with Astro 6)
- `@astrojs/mdx` `^4` → `^5`
- `@astrojs/sitemap` `^3.2` → `^3.7`
- `@astrojs/cloudflare` `^12` → `^13` + add `wrangler@^4.94` (apps/site)

**Breaking — Node floor raised to `>=22.12.0`.** Astro 6 requires Node
22.12+, so the repo `engines` and the CI Node matrix move from 20 → 22
(unit tests on 22 + 24). Scaffolded projects now require Node 22+.

Astro 6 migration fixes:

- Astro 6 disables SVG image processing by default. The starter ships
  lightweight SVG placeholder heroes/avatars routed through `<Picture>`,
  so its `astro.config.mjs` now sets `image.dangerouslyProcessSVG: true`.
  Replace the placeholders with raster heroes (see `docs/IMAGES.md`) and
  you can drop it.
- `@astrojs/cloudflare` v13 removed the `platformProxy` option (local
  bindings now come from the wrangler config); dropped from
  `apps/site/astro.config.mjs`.

Docs/spec/invariant updated to say Astro 6 / `@astrojs/node@^10`
(including the `cli-dep-stripping --adapter` audit).

Note: Astro 6 bundles Zod 4, which deprecates `z.string().url()` etc.
These surface as non-blocking `astro check` hints; the Zod-4 idiom
migration is deferred to a follow-up.
