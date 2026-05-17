---
'astro-ignite': minor
---

Initial scaffold of the `astro-ignite` CLI: prompts (site name, URL, locales, package manager, email provider), conditional file copy (Resend/SMTP), `site.ts` substitution, `package.json` rewriting (strips deps the chosen template doesn't use), package-manager-aware install + git init. Exposed today as `npx astro-ignite bootstrap` and via the `npm create astro-ignite@latest` shim.
