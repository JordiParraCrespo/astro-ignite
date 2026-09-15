---
'astro-ignite': patch
'create-astro-ignite': patch
---

**Dependency refresh.** Bump template runtime and tooling dependencies within their existing major versions across both templates, the CLI packages, the registry, and the mirrored apps (`site`, `docs`, `playground`).

Template runtime: `astro` ^7.0.2 → ^7.3.2, `@astrojs/node` ^11.0.0 → ^11.1.5, `@astrojs/mdx` ^7.0.0 → ^7.0.8, `@astrojs/rss` ^4.0.18 → ^4.0.19, `@astrojs/sitemap` ^3.7.3 → ^3.7.4, `@tailwindcss/vite`/`tailwindcss` ^4.3.0 → ^4.3.3, `markdown-it` ^14.1.1 → ^14.3.2, `sanitize-html` ^2.17.4 → ^2.17.7, `zod` ^4.4.3 → ^4.6.5, `mermaid` ^11.12.0 → ^11.17.2 (docs template).

Tooling: `eslint`/`@eslint/js` → ^9.39.5, `eslint-plugin-astro` ^1.3.1 → ^1.7.0, `typescript-eslint` → ^8.70.0, `vite` → ^8.3.0, `prettier` (monorepo/apps, not the template-pinned `3.8.3`) → ^3.9.6, `vitest` → ^4.1.11, `@playwright/test` → ^1.63.0, `@changesets/cli` → ^2.31.1, `globals` → ^17.12.0, `@types/node` → ^25.9.6.

Also bumps `@shikijs/transformers` ^3.23.0 → ^4.4.3 in the docs template and `apps/docs`, required to match the `@shikijs/types` version Astro 7.3 now pulls in — the stale 3.x range broke `astro check` with a `ShikiTransformer` type-incompatibility error against `astro.config.mjs`'s `transformerNotationDiff`/`transformerNotationHighlight`/`transformerMetaHighlight` calls.

No major-version bumps: every change stays within the range already declared in each `package.json` (or, for `@shikijs/transformers`, the next range needed to keep typechecking against Astro 7.3's bundled shiki). `astro`, `eslint`, `eslint-plugin-astro`, `typescript`, `vitest`, `@astrojs/mdx`, `mermaid`, `markdown-it`, and `resend` all have newer majors available upstream — left untouched pending a dedicated migration pass for each.
