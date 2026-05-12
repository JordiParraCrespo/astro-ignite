---
'astro-ignite': minor
'create-astro-ignite': minor
---

Split the CLI into two packages so both UXes work:

- `astro-ignite` (new, primary): the real CLI. Subcommand-based. Today: `npx astro-ignite bootstrap`. Tomorrow: `add`, `upgrade`, etc.
- `create-astro-ignite` (now a shim): preserves the `npm create astro-ignite@latest` UX by delegating to `npx astro-ignite@latest bootstrap`.

Both packages publish in lockstep at the same version. End users can keep typing `npm create astro-ignite@latest my-site` or switch to the more explicit `npx astro-ignite bootstrap my-site` — both reach the same code.
