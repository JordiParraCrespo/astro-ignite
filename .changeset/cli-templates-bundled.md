---
'astro-ignite': minor
---

Templates are now bundled into the published `astro-ignite` npm package via a `prepack` step. Previously the CLI would fail at runtime because `<pkg>/templates/<kind>/` didn't exist in the published tarball. The `files` field now includes `templates/`, and `scripts/copy-templates.mjs` populates it from `packages/templates/` before pack (skipping `node_modules`, build artifacts, and renaming `_gitignore` → `.gitignore`). The `create-astro-ignite` shim delegates to `astro-ignite bootstrap` and so picks this up transitively.
