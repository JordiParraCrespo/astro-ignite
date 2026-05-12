# create-astro-ignite

## 0.1.0

### Minor Changes

- 33e8966: Templates are now bundled into the published npm package via a `prepack` step. Previously the CLI would fail at runtime because `<pkg>/templates/<kind>/` didn't exist in the published tarball. The `files` field now includes `templates/`, and `scripts/copy-templates.mjs` populates it from `packages/templates/` before pack (skipping `node_modules`, build artifacts, and renaming `_gitignore` → `.gitignore`).
- f02e323: Initial scaffold of the create-astro-ignite CLI: prompts (site name, URL, locales, package manager, email provider), conditional file copy (Resend/SMTP), site.ts substitution, package.json rewriting, package-manager-aware install + git init.
- 323a0fd: Split the CLI into two packages so both UXes work:
  - `astro-ignite` (new, primary): the real CLI. Subcommand-based. Today: `npx astro-ignite bootstrap`. Tomorrow: `add`, `upgrade`, etc.
  - `create-astro-ignite` (now a shim): preserves the `npm create astro-ignite@latest` UX by delegating to `npx astro-ignite@latest bootstrap`.

  Both packages publish in lockstep at the same version. End users can keep typing `npm create astro-ignite@latest my-site` or switch to the more explicit `npx astro-ignite bootstrap my-site` — both reach the same code.
