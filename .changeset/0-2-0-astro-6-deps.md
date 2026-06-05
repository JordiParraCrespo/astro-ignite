---
'astro-ignite': minor
'create-astro-ignite': minor
---

**Astro 6.3 + full dependency modernization.** **Breaking: the Node floor rises to `>=22.12.0`** (Astro 6 requires it); scaffolded projects now need Node 22+.

Template runtime: `astro` ^5 → ^6.3, `@astrojs/node` ^9 → ^10, `@astrojs/mdx` ^4 → ^5, `@astrojs/sitemap` ^3.2 → ^3.7, Tailwind v4 beta → ^4.3, **Zod 3 → 4**, **Resend 4 → 6**, **schema-dts 1 → 2**. Tooling: TypeScript 6, Vitest 4, `@clack/prompts` 1, Playwright 1.60, sharp 0.34.

Pins that matter (and why):

- **Vite stays at `^7.3.3`** — Astro 6.3 requires `vite@^7.3.2`; Vite 8 needs Astro 7. Without the explicit pin, a fresh install resolves a second `vite@8` for `@tailwindcss/vite` and breaks the Tailwind plugin.
- **ESLint stays at `^9`** — `eslint-plugin-jsx-a11y` caps its peer at ESLint 9, which npm/yarn enforce as a hard install error in scaffolded projects.

Migration details: Zod 4 idioms adopted throughout (`import { z } from 'astro/zod'`, `z.url()`, `z.email()`); Astro 6 disables SVG processing by default, so the starter (which ships SVG placeholder heroes) sets `image.dangerouslyProcessSVG: true` — replace the placeholders with raster heroes and you can drop it.
