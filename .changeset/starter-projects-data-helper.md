---
'astro-ignite': patch
'create-astro-ignite': patch
---

**Starter: extract a `projects` data helper.** The locale-filtered fetch + date sort that the `/projects` index and its `[lang]/` mirror each duplicated now lives in `src/lib/projects.ts`, mirroring the existing `blog.ts` pattern. `getProjectsForLocale(locale, order)` takes an `'asc' | 'desc'` sort order (default `'desc'`, newest first) and `projectSlug(project)` strips the locale prefix off an entry id. Scaffold output is unchanged.
