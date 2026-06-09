---
'astro-ignite': patch
'create-astro-ignite': patch
---

**Starter: add a `localize` i18n helper and dedupe locale-aware value resolution.** `localize(value, locale)` (in `src/i18n`) resolves a `string | Record<locale, string>` to a single string, falling back to the default locale. It replaces the copy-pasted OG-image resolution in `ArticleLayout`, `ProjectLayout`, and `SEO.astro`, and the author `bio` lookup in `ArticleLayout`. The two layouts also now reuse the existing `postSlug` / `projectSlug` helpers instead of re-deriving the slug inline. No change to rendered output.
