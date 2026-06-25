---
'astro-ignite': minor
'create-astro-ignite': minor
---

**Sätteri markdown engine.** Pin Astro 7's Rust-powered Markdown/MDX
processor explicitly in every template.

Astro 7 already makes Sätteri (`@astrojs/markdown-satteri`) the default
markdown processor, replacing the unified (remark/rehype) pipeline. Both
templates now declare it explicitly — `markdown: { processor: satteri() }`
in `astro.config.mjs`, with `@astrojs/markdown-satteri` added as a direct
dependency — so the engine choice is owned rather than implicit, and the
config carries the single seam for Sätteri `features` / mdast + hast
plugins.

No behaviour change: GFM, SmartyPants, heading slugs, and directives are
native to Sätteri (no remark/rehype plugins were in use). The docs
template's build-time Shiki transformers (line highlight, diff markers)
continue to flow through the top-level `markdown.shikiConfig`, which
Sätteri still reads. RSS feeds are unaffected — `rss.xml.ts` renders post
bodies with `markdown-it`, a standalone call that was never part of
Astro's page pipeline.

Applied across both templates (`starter`, `docs`) and the mirrored apps
(`site`, `docs`). The generated CLI template copies regenerate from
source at `prepack`.
