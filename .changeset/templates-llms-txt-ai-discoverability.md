---
'@astro-ignite/template-starter': minor
'@astro-ignite/template-docs': minor
'@astro-ignite/site': minor
'@astro-ignite/docs': minor
---

Add an `llms.txt` AI-discoverability index to both templates (and mirror to
`apps/site` + `apps/docs`):

- **`pages/llms.txt.ts`.** A new endpoint serves `/llms.txt` following the
  [llmstxt.org](https://llmstxt.org) convention — an H1 site name, a
  blockquote summary, then H2 sections of `- [title](url): description`
  links pointing LLMs and AI agents at the site's primary content. Titles
  and descriptions are pulled from the same SEO copy / content frontmatter
  the pages already render, so the index can't drift from what humans see.
- **Starter** surfaces standalone pages (home / about / contact), blog
  posts, projects, and legal. **Docs** surfaces the docs collection (home
  doc first) and legal.
- **Single root file, all locales.** Unlike the per-locale `rss.xml`,
  `llms.txt` is emitted once at the root and lists every locale in
  `siteConfig.locales`; section headings gain a ` (hreflang)` suffix only
  when more than one locale is active, so the single-locale default stays
  clean. Absolute URLs are built from the request `site` origin (falling
  back to `siteConfig.url`), matching `robots.txt` / `rss.xml`.

No new dependencies and no robots/sitemap changes — `llms.txt` sits
alongside the existing `robots.txt` and `rss.xml` endpoints.
