---
'@astro-ignite/template-starter': minor
'@astro-ignite/template-docs': minor
'@astro-ignite/site': minor
'@astro-ignite/docs': minor
---

Close two template parity slips (and mirror to `apps/site` + `apps/docs`):

- **500 error page.** Both templates now ship `pages/500.astro` (a sibling
  to `404.astro`) backed by a `ServerErrorHero` component and new
  `seo.500` / `errors.500` i18n keys. It sets `Astro.response.status = 500`
  — meaningful for the starter, whose `@astrojs/node` adapter renders it on
  uncaught server errors, and harmless (built to `/500.html`) for the
  static docs site. Like `404.astro` it is emitted once at the root and
  exempt from the `[lang]/` parallel rule (the `i18n-parallels` audit and
  the `templates-i18n` spec now document this).
- **Localized docs RSS.** The docs template gains `pages/[lang]/rss.xml.ts`,
  matching the starter's per-locale feed. The default-locale feed at
  `/rss.xml` no longer carries the stale "per-locale feeds are a follow-up"
  note. Both feeds stay dormant until a second locale is added to
  `siteConfig.locales`.

While mirroring to `apps/docs` (which runs with `es` enabled) this surfaced
and fixed a live bug: `apps/site` shipped its per-locale feed under
`pages/[locale]/rss.xml.ts` — the non-canonical `[locale]` param dir the
templates forbid in favour of `[lang]` — and `apps/docs` had no localized
feed at all, so `/es/rss.xml` 404'd. Both now serve `/[lang]/rss.xml`.
