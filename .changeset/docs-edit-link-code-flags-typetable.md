---
'astro-ignite': patch
'create-astro-ignite': patch
---

**Docs template follow-up: edit link, code-block flags, TypeTable.**

- `siteConfig.repo` (`url`, `branch`, `docsDir`) adds an "Edit this page" pencil to the doc toolbar, linking to the entry's `.mdx` on GitHub. Omit it to hide the link; the template ships it commented out.
- Fenced code blocks gain `// [!code focus]` (dims the other lines until hover), `// [!code word:token]` and `/token/` word highlighting, and two fence-meta flags: `wrap` soft-wraps long lines and `no-lines` drops the line-number gutter.
- New `TypeTable` MDX component: a props reference table (prop, type, default, description) with required and deprecated markers, for the component reference pages.
- Hero button labels are centred (MDX wraps multi-line children in `<p>`); the accent is indigo.
