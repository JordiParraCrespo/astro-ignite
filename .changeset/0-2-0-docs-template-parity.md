---
'astro-ignite': minor
'create-astro-ignite': minor
---

**Docs template: full parity with the starter.** A scaffolded docs site now ships the same production-grade surface the starter does:

- **Pre-installed atom set.** All registry atoms land in `src/components/ui/` (byte-mirrors of `packages/registry/base/*`), plus the `lib/toast.ts` helper — same set the starter ships. Users who scaffolded earlier can copy the atoms from the registry source.
- **404 page** with i18n + `[lang]/` locale parallels: `NotFoundHero` component, `Astro.response.status = 404`, "back to home" + "search the docs" affordances.
- **500 page** (both templates): `pages/500.astro` backed by `ServerErrorHero` with `seo.500` / `errors.500` i18n keys. Rendered by the node adapter on uncaught server errors in the starter; built to `/500.html` in the static docs site. Emitted once at the root and exempt from the `[lang]/` parallel rule, like 404.
- **Footer chrome** on every page: brand mark, description, Legal column (privacy/terms/cookies via `getRelativeLocaleUrl`), optional Resources column (docs landing + GitHub when `siteConfig.social.github` is set), copyright row. New `footer.{privacy,terms,cookies}` i18n keys.
- **RSS feed** at `/rss.xml` (most recently updated docs, newest-first by `lastUpdated`), advertised via `<link rel="alternate">` — plus a localized `pages/[lang]/rss.xml.ts` matching the starter's per-locale feed (dormant until a second locale is added). Also fixes `apps/site`'s feed living under the non-canonical `[locale]` param dir.
- **Perf + sitemap build defaults**: `build.inlineStylesheets: 'always'` (eliminates the render-blocking stylesheet round-trip) and sitemap `serialize` priorities (landing `1.0`, default `0.7`, `/legal/*` `0.3`) — the same knobs the starter records.
