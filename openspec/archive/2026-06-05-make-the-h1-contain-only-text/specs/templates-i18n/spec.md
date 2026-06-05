# Delta: templates-i18n — make-the-h1-contain-only-text

This change targets `apps/site/` (a manual mirror of the `starter`
template), not `packages/templates/<kind>/`. The long-lived `templates-i18n`
spec is the inherited contract (see `apps/site/CLAUDE.md`: _"Specs
(inherited from starter): openspec/specs/templates-\*/spec.md (all of
them)"_), so the delta is filed against it.

The change removes one i18n key (`landing.hero.headlineMuted`) from both
locale dictionaries and the call site that read it. None of the spec's
existing Requirements (parallel routes, `getStaticPaths` parity, content
collection layout, `getRelativeLocaleUrl` usage, `LocaleSwitcher` presence)
is altered.

## ADDED Requirements

_None._

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._

## Notes

- **Why no spec delta?** The spec describes structural i18n
  invariants (where routes live, how content is organised, how links
  are produced). Removing a single dictionary key from a mirror site
  doesn't change any of those structural rules.
- **Where the live guards are.** Type narrowing via
  `Dictionary = typeof en` in `apps/site/src/i18n/index.ts:20` plus
  `TranslationKey = Path<Dictionary>` at line 39 is the effective
  invariant that catches stray uses of the removed key. `pnpm
typecheck` enforces it.
- **Audit coverage.** `scripts/audit/i18n-parallels.mjs` and
  `scripts/audit/internal-links-localized.mjs` both scope to
  `packages/templates/<kind>/` and do not run against `apps/site/`, so
  no audit script is affected by this change.
