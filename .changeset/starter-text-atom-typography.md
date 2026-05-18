---
'astro-ignite': patch
'create-astro-ignite': patch
---

Starter template typography now routes through the `<Text>` atom across pages, components, and layouts. Page headers, body copy, footer text, the 404 block, and article/project/legal layout headers all use `<Text variant="…">` instead of raw `<h1>`–`<h6>` / `<p>` with inline Tailwind typography classes. Scoped `<style>` blocks shrink to layout-only rules. Hero/Nav/CookieBanner above-the-fold components keep their scoped styles; MDX-rendered `.prose` body content is unchanged.
