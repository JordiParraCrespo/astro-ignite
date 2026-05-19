---
'@astro-ignite/template-docs': minor
'@astro-ignite/docs': minor
---

Ship an `/rss.xml` feed for the docs template (and mirror to `apps/docs`).
Surfaces the most recently updated docs entries from the default locale,
sorted newest-first by `lastUpdated`. `BaseLayout.astro` advertises the
feed via `<link rel="alternate" type="application/rss+xml">` for reader
discovery. Closes #51.
