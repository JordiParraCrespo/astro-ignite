---
'astro-ignite': patch
'create-astro-ignite': patch
---

**Docs chrome carries the brand.** The footer renders the `>_` lockup instead of a bold site name, links to the marketing site when the new optional `siteConfig.urls.site` is set, and signs the copyright line with the organization name. The docs toolbar gains a GitHub link driven by `siteConfig.social.github`, and the sidebar mark matches the marketing header size. `ComponentShowcase` advertises the real install path (`npx shadcn@latest add @astro-ignite/<name>`) and reads its preview label through `t()`; the tabs/accordion demo copy no longer mentions a non-existent `add` subcommand. Added translation keys: `footer.website`, `nav.github`, `components.previewAria`, `blocks.previewAria`.
