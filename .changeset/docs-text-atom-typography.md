---
'astro-ignite': patch
'create-astro-ignite': patch
---

Route every body-copy and heading site in the docs template (and the
`apps/docs` mirror) through the `<Text>` atom. Installs the atom into
`packages/templates/docs/src/components/ui/text.astro` and adds the
matching `cn` helper at `packages/templates/docs/src/lib/cn.ts`. The
atom contract is unchanged; this is a refactor that completes the
alignment started by `starter-use-the-text-component-for-all-t`
(PR #33).
