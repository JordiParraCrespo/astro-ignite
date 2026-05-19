---
'astro-ignite': patch
'create-astro-ignite': patch
---

Ship the registry's atom set pre-installed in the docs template (and
refresh the CLI template cache) so a fresh
`npm create astro-ignite -- --template docs` scaffolds the same
`src/components/ui/` set that the starter already does. 30 new atom
files land under `packages/templates/docs/src/components/ui/`
(byte-mirrors of `packages/registry/base/*`), and the matching
`lib/toast.ts` helper lands at `packages/templates/docs/src/lib/toast.ts`
so `toaster.astro` resolves its import. Non-breaking refactor; users
who previously scaffolded the docs template can copy the atoms into
their site manually or run `npx astro-ignite add <name>` for each
missing atom.
