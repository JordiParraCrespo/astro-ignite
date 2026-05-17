# apps/docs Boundary

The docs site for astro-ignite itself. **Manual mirror of the `docs`
template** — changes here do **not** reach CLI users.

## Public Contracts

- **Source of truth:** `packages/templates/docs/`.
- **Specs (inherited from docs template):** the `templates-*` capability
 specs.

## Boundary Rules

- Mirror, not source. Bug fixes go to `packages/templates/docs/` first;
 mirror here in the same PR.
- All docs-template rules apply: tokens, i18n parallels (yes, docs has
 them too), perf budget, JSON-LD via the layout `@graph`.
- No email/Resend deps. No Astro Actions. If docs grows a search feature
 that needs Actions, update both `packages/templates/docs/` and
 `openspec/specs/cli-scaffold/spec.md` in the same change.

## Expanding The Boundary

- Adding a new docs page → add to `packages/templates/docs/` and mirror.
- Adding a docs-only chrome change (custom sidebar, etc.) → add to
 `packages/templates/docs/` first.
- Audits run against the docs template, not against this app.
