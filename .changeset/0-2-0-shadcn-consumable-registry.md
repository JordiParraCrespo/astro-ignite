---
'astro-ignite': minor
'create-astro-ignite': minor
---

**Publicly consumable, shadcn-schema-conformant registry.** The astro-ignite atoms can now be installed into _any_ project with `npx shadcn@latest add @astro-ignite/<name>` — the headline shadcn-2025 move.

- `registry.json` now conforms to the [shadcn 3.0 registry schema](https://ui.shadcn.com/docs/registry): the shadcn `$schema`, a `type` on every file object, and a `title`/`description` per item.
- A build step (`packages/registry/scripts/build-registry.mjs`) emits one resolved `registry-item` JSON per item — file source inlined as `content`, internal deps rewritten to the namespaced form (`cn` → `@astro-ignite/cn`) so a consumer's `@astro-ignite` namespace resolves them against this registry. `apps/site` runs it at `pre(dev|build)` with `--out public/r`, hosting the payloads at `https://astroignite.dev/r/<name>.json`.
- Compound families (card, tabs, accordion, dialog, dropdown-menu, radio-group) install all their files; `cn` resolves transitively.
- `pnpm test` now covers `@astro-ignite/registry`: a check that every `registry.json` item has a corresponding emitted, schema-shaped payload. `packages/registry` joins the pnpm workspace so the check runs in CI.

The scaffolded templates are unchanged — they still ship the atoms pre-installed and fully owned; this only adds an external on-ramp. No `astro-ignite add` command is implied anywhere.
