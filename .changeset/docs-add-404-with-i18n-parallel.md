---
'@astro-ignite/template-docs': minor
'@astro-ignite/docs': minor
---

Add a styled 404 page with i18n + locale parallels to the docs template
(and mirror to `apps/docs`). `pages/404.astro` and `pages/[lang]/404.astro`
set `Astro.response.status = 404`, share a new `NotFoundHero` component,
and surface a "back to home" link plus a "search the docs" affordance.
Closes #41.
