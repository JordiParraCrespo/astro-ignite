---
'astro-ignite': patch
'create-astro-ignite': patch
---

Add footer chrome to the docs template (and the `apps/docs` mirror) at
parity with the starter. A scaffolded docs site now renders a footer
on every page (via `BaseLayout`) with brand mark, description, a Legal
column linking to `/legal/{privacy,terms,cookies}` (resolved through
`getRelativeLocaleUrl`), an optional Resources column (docs landing +
GitHub link, surfaced only when `siteConfig.social.github` is set),
and a copyright + "Built with astro-ignite." bottom row. Three new
i18n keys — `footer.privacy`, `footer.terms`, `footer.cookies` — land
in `en.json` and `es.json` for both the template and the apps mirror.
No new runtime dependency. Existing scaffolded docs sites can mirror
the change by copying `Footer.astro` into
`src/components/common/` and inserting `<Footer />` after the
`<slot />` in `BaseLayout.astro`.
