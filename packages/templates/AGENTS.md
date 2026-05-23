# Templates Boundary

This directory holds the **products** of astro-ignite: one real,
production-grade Astro project per use case. The CLI
(`packages/astro-ignite/`) copies one of these wholesale into the user's
target directory. Users own every line afterward — there is no runtime
dependency back on the scaffolder.

## Layout

- `starter/` — marketing + blog + projects site (contact form via Astro
  Actions, email provider, full content collections).
- `docs/` — documentation site built from primitives (no Starlight). No
  Actions, no email.

Each variant is a standalone Astro project with its own `package.json`,
`AGENTS.md`, `README.md`, and `docs/` deep dives. **Edit templates
here** — `packages/astro-ignite/templates/` and `apps/playground/` are
generated copies, and `apps/site` / `apps/docs` are manual mirrors that
do **not** auto-update.

## Adding or changing a template

- Use the **`new-template` skill** (`.claude/skills/new-template/`) — it
  walks the 15-item locked-practices audit so a new variant doesn't ship
  with i18n / legal / locale-switcher gaps.
- Every template must satisfy the locked invariants (i18n parallel
  routes, `getRelativeLocaleUrl`, LocaleSwitcher, token-resolved
  Tailwind, `@graph` JSON-LD, consent-gated analytics). See each
  template's own `src/**/AGENTS.md` and the root `AGENTS.md`.
- A template that omits a feature must let `scaffold.ts:rewritePackageJson`
  strip the matching deps (see the email/Resend gate pattern).
- After changing a template, audit whether `apps/site` / `apps/docs`
  need the same change (they are mirrors) and run `pnpm audit:invariants`.
