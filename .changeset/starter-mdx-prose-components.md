---
'astro-ignite': patch
'create-astro-ignite': patch
---

**Starter: ship MDX prose components (`Callout`, `CodeBlock`, `Figure`).** Blog and project posts can now use `<Callout>` (note/tip/warning/danger admonitions), `<CodeBlock>` (filename header + copy button), and `<Figure>` (captioned, framed media) directly in MDX — no import needed, since they're wired through a shared `src/components/mdx/mdx-components.ts` map into all four content routes (`blog` + `projects`, default and `[lang]`). Components are 100% Tailwind (tokens-only, no scoped styles), and their `pre`/`img` styling overrides the `.prose` base via wrapper variants so framed code and images render correctly inside the prose container.
