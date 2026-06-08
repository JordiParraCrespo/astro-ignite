---
'astro-ignite': minor
'create-astro-ignite': minor
---

**Starter: ambient radial-glow backdrop on the blog & projects index pages.** Both index sections now render a subtle, decorative radial gradient behind the page header (`surface-2` → transparent, blooming from top-center), so the pages no longer read as flat black around the heading. The glow is a `pointer-events-none`, `aria-hidden` layer sitting behind the content via an isolated stacking context, resolves through `--color-*` tokens (theme-aware), and adds no markup that affects layout or accessibility.
