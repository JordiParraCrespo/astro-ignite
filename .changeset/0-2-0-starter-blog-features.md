---
'astro-ignite': minor
'create-astro-ignite': minor
---

**Starter: complete blog feature set.** The starter previously shipped i18n keys hinting at blog features nothing rendered. Now they all work:

- **Reading time** — `~{n} min read` badge on cards and in the article byline (`src/lib/reading-time.ts`).
- **Previous/next navigation** — older/newer links at the foot of every article (`PostNav.astro`).
- **Related posts** — up to three, ranked by shared tags (`RelatedPosts.astro`).
- **Table of contents** — built from the article's headings (`TableOfContents.astro`).
- **Tag archives** — `/blog/tags/<tag>` with `[lang]/` parallels, tag links on post headers, tag chips on cards.
- **Pagination** — the blog index splits at `POSTS_PER_PAGE` (6) into `/blog/page/<n>` routes; dormant until a blog outgrows one page, like the i18n parallels.

Shared blog data (locale query, adjacency, related ranking, tag collection, pagination meta) lives in `src/lib/blog.ts`. New i18n keys in `en.json` + `es.json`.
