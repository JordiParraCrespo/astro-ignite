# apps/site Boundary

The marketing landing for astro-ignite itself. **Manual mirror of the
`starter` template** — changes here do **not** reach CLI users.

## Public Contracts

- **Source of truth:** `packages/templates/starter/` is the canonical
 starter template. Any change that should reach CLI users lives there
 first.
- **Specs (inherited from starter):**
 - `openspec/specs/templates-*/spec.md` (all of them)

## Boundary Rules

- **This directory is a mirror, not a source.** When you fix a bug here,
 mirror it back to `packages/templates/starter/` in the same PR, or
 document why it doesn't belong there in `progress/impl_<name>.md`.
- All the starter rules apply: tokens, no framework JS, i18n parallels,
 consent-gated analytics, layered CSS, `@graph` JSON-LD, perf budget.
- The blog under `src/content/blog/` is real content (release notes,
 posts about the project). Banners for these posts must come from the
 claude-design HTML pipeline; see `openspec/specs/banner-pipeline/spec.md`.
- The `scripts/banners/` directory in this app is the only place that
 imports from `packages/design-fetch/` (build-time).

## Expanding The Boundary

- Adding a new page only relevant to the marketing site (e.g., a
 `/launch` event page) → fine to live only here; do **not** add it to
 `packages/templates/starter/`. Note the rationale in
 `progress/impl_<name>.md`.
- Adding a new chrome component (header item, footer link, etc.) → add
 to `packages/templates/starter/` first, then mirror here.
- Audits run against starter, not against this app. The `i18n-parallels`
 audit is template-scoped; you can break i18n parallels here only if
 the same break exists in starter (and then you've got a starter bug).
