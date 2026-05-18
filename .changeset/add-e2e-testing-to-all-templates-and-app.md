---
---

chore: add Playwright end-to-end test suite (`tests/e2e/`)

Workspace-only infrastructure. No published-package contract changes:

- The `astro-ignite` CLI and `create-astro-ignite` shim ship the same
  bits as before — neither emits Playwright into a scaffolded user
  project.
- Template runtime files are unchanged; the new suite observes existing
  behaviour from a browser.

The new suite covers homepage console health, header/footer nav,
theme toggle persistence, LocaleSwitcher behaviour, cookie consent
gating of analytics, the starter contact form (with Resend blocked at
the browser network layer), the docs template sidebar + MDX + search
dialog, the `apps/site` + `apps/docs` mirrors, and a post-scaffold
playground smoke. Run `pnpm test:e2e` at the workspace root.
