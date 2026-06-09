---
'astro-ignite': patch
'create-astro-ignite': patch
---

**Starter: ship MDX prose components (`Callout`, `Figure`).** Blog and project posts can now use `<Callout>` (note/tip/warning/danger admonitions) and `<Figure>` (captioned, framed media) directly in MDX — no import needed, since they're wired through a shared `src/components/mdx/mdx-components.ts` map into all four content routes (`blog` + `projects`, default and `[lang]`). Components are 100% Tailwind (tokens-only, no scoped styles); `Figure`'s `img` styling overrides the `.prose` base via wrapper variants so framed images render correctly inside the prose container. (Plain fenced code keeps Shiki highlighting + the `.prose pre` styling — no dedicated code-block component.)
