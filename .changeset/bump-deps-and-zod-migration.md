---
'astro-ignite': minor
'create-astro-ignite': minor
---

Bump every dependency to latest and finish the Astro 6 migration.

Dependency bumps (templates, apps, tooling):

- **Zod 3 → 4**, **Resend 4 → 6**, **schema-dts 1 → 2** (template runtime)
- **TypeScript 5 → 6**, **ESLint 9 → 10** (+ `@eslint/js` 10, `globals`
  17), **Vitest 2 → 4**, **`@clack/prompts` 0 → 1** (CLI), **@types/node
  22 → 25**, **@playwright/test 1.60**, **sharp 0.34**, plus
  `sanitize-html` / `typescript-eslint` patches.
- **Vite stays on `^7.3.3`** — Astro 6.3 requires `vite@^7.3.2`; Vite 8
  needs Astro 7.

Zod 4 / Astro 6 deprecation migration (clears the `astro check` hints):

- `import { z } from 'astro:content' | 'astro:schema'` →
  `import { z } from 'astro/zod'` (Astro 6 deprecated the re-exports).
- `z.string().url()` → `z.url()`, `z.string().email()` → `z.email()`
  (Zod 4 idioms) across the content collections and contact action.

The `apps/site` blog banners that read "Astro 5 · Tailwind v4" were
regenerated to "Astro 6" via the Chrome banner pipeline.
