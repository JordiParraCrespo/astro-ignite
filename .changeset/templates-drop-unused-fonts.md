---
'@astro-ignite/template-starter': patch
'@astro-ignite/template-docs': patch
---

Drop unused experimental Astro fonts and switch cookie banner to CSS-gated visibility.

- **Fonts removed.** The `<Font>` components in `BaseLayout.astro` and the `experimental.fonts` config in `astro.config.mjs` were emitting 4+ woff2 fetches into the inlined critical CSS, but the page never painted them: the `@theme` rule in `global.css` redefines `--font-display` / `--font-mono` to plain `"Geist"` / `"Geist Mono"`, overriding the hashed family names Astro generates, so no element matched any `@font-face`. The starter additionally had `preload` set on `--font-display`, which made the regression worse on LCP. The page now renders in the system fallbacks already listed in the token chain (`ui-sans-serif` / `ui-monospace`) — visually identical to what the broken cascade was producing.
- **Cookie banner CSS-gated.** The old pattern stamped the banner with the `hidden` attribute and toggled it from JS on load, producing a late visibility flip in the viewport (dominant Speed Index hit). The anti-flash inline script in `BaseLayout` now stamps `html[data-consent='recorded']` if the consent value is already in localStorage; CSS in `CookieBanner` hides the banner whenever that attribute is present. Returning visitors never see the banner; new visitors see it from FCP.

To re-enable Geist (or any custom font) in a scaffolded site, change the token value in `global.css` to the family Astro emits, or drop in your own self-hosted `@font-face` block.
