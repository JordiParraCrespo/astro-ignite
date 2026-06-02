---
'@astro-ignite/template-starter': patch
---

Route all component-rendered text in the starter through the `Text` atom.

Hero, FeaturesGrid, BlogIndexList, ProjectsIndexList, AboutBody,
ContactSection, and CookieBanner previously rendered raw `<h1>`–`<h4>` /
`<p>` with ad-hoc arbitrary-value typography classes. They now use
`<Text variant=…>` so headings and prose resolve through the shared type
scale (display / h1–h4 / lead / body / small / muted / eyebrow) and the
`--color-*` tokens, instead of one-off `text-[clamp(...)]` declarations.
Heading levels are preserved where they differ from the visual variant
(e.g. card titles render `as="h2"` on the `h3` scale); `id` / `aria-*` /
`<time>` children pass through unchanged.

Structural and interactive text is intentionally left alone — UI atoms
(Button, Badge, Link, Label, Kbd), the project metadata `<dl>`, nav /
back / view links, contact status banners, and MDX `.prose` content
(the documented Tailwind-exception). No behavior change; no new deps.
