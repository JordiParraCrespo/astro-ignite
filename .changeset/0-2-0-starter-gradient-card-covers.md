---
'astro-ignite': minor
'create-astro-ignite': minor
---

**Starter: gradient card covers replace placeholder hero images.** Blog and project cards (and their detail-page heroes) now render a token-resolved CSS gradient cover instead of an image — blog cards pick one of four grayscale gradient variants deterministically from the entry id; project cards use the diagonal-stripe pattern with a status pill; both carry a faint `>_` brand glyph. The covers resolve through `--color-*` design tokens, so they flip with the light/dark theme.

Consequently the `heroImage` / `heroImageAlt` fields are **removed** from the `blog` and `projects` content schemas, and the hand-drawn SVG placeholder heroes (`hero-welcome.svg`, `hero-why.svg`, project `hero.svg`) are deleted. Social/OG previews now come from the optional per-entry `ogImage`, falling back to the site-wide default banner (`siteConfig.defaultOgImage`) — `og:image` and JSON-LD `image` stay populated. Migration for projects scaffolded from an older starter: drop `heroImage`/`heroImageAlt` from blog and project frontmatter; set `ogImage` where you want a custom social card.
