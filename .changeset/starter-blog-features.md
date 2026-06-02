---
'@astro-ignite/template-starter': minor
---

Finish the blog features the starter previously only hinted at (the i18n
dictionary already shipped keys for reading time, prev/next, and a table of
contents, but nothing rendered them).

- **Reading time** — a `~{n} min read` badge on index/related cards and in the
  article byline, computed from the post body (`src/lib/reading-time.ts`).
- **Previous/next navigation** — older/newer post links at the foot of every
  article (`PostNav.astro`).
- **Related posts** — up to three posts ranked by shared tags
  (`RelatedPosts.astro`), replacing the empty `related` slot.
- **Table of contents** — built from the article's headings, anchored to the
  ids Astro injects (`TableOfContents.astro`).
- **Tag archives** — `/blog/tags/<tag>` (with `[lang]` parallels), one page per
  tag, plus tag links on each post header and tag chips on cards. Tag data was
  collected by the schema but unused.
- **Pagination** — the blog index splits at `POSTS_PER_PAGE` (6) with
  `/blog/page/<n>` routes and a newer/older control. Dormant until a blog has
  more than one page, like the i18n parallels.

New blog data lives in `src/lib/blog.ts` (locale query, adjacency, related,
tag collection, pagination meta), shared across the index, pagination, tag, and
post routes. New i18n keys added to `en.json` + `es.json`. Starter only;
`apps/site` is a manual mirror and is not touched here.
