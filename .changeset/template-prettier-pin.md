---
'astro-ignite': patch
'create-astro-ignite': patch
---

**Fix template docs and pin prettier version.** Correct three stale references in template documentation — `@astrojs/node@^10` → `^11` in `starter/docs/ACTIONS.md`, broken link `CONTACT_FORM.md` → `CONTACT-FORM.md` in `starter/docs/DEPLOYING.md`, and expanded MDX component kit list in `docs/README.md` to include all 18 primitives that ship. Also pin `prettier` to `3.8.3` (exact) in both templates' `package.json` files to prevent the scaffold `format:check` CI step from failing when package managers resolve a newer semver-compatible prettier that formats `.astro` union types differently.
