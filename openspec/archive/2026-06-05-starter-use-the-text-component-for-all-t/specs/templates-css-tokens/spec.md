# Delta: templates-css-tokens — starter-use-the-text-component-for-all-t

This change refactors typography call sites across
`packages/templates/starter/` to route through the existing `<Text>`
atom instead of inline Tailwind utilities and scoped `<style>` blocks at
the page level. It does not change the long-lived
`templates-css-tokens` contract: components still reference tokens, the
zinc scale still lives only in `global.css`, tri-state dark mode still
flips tokens, and above-the-fold components still use scoped `<style>`.

## ADDED Requirements

_None._

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._

## Notes

- **Why no spec delta?** The capability spec describes the _structural_
  CSS contract — tokens, no raw zinc, tri-state dark mode, layered CSS.
  Centralising typography through an existing atom is consistent with
  every Requirement in the spec; it does not add a new rule. The audit
  table's I1 (no raw zinc / hex), I2 (`global.css` tokens), I3
  (tri-state dark mode), and I4 (layered CSS — above-the-fold scoped
  `<style>`) all continue to hold after the change.
- **Why not a new "atom-first typography" Requirement?** Considered and
  rejected in `../../design.md` § Rejected alternative. The rule would
  need a "body copy vs chrome label" heuristic that's not statically
  decidable without a maintained allow-list. We follow the precedent
  set by `templates-i18n` I6 (`LocaleSwitcher` presence — "manual (no
  static audit yet)") and let the reviewer's visual sweep + the
  scaffold:test pass be the live guard for this refactor.
- **Live guards relevant to the change:**
  - `node scripts/audit/tokens-only.mjs` — I1 (no raw zinc / hex).
  - `node scripts/audit/tokens-only.mjs --layered` — I4 (Hero / Nav /
    Header keep their scoped `<style>` block).
  - `pnpm scaffold:test` — Lighthouse budget on the generated starter
    fixture.
  - The `grep` regression check in `tasks.md` T12 — confirms no `<h1>`
    –`<h6>` or `<p>` outside the allow-listed components carries
    typography utility soup.
- **Audit coverage.** The audit scripts above scan
  `packages/templates/<kind>/` so they run against the starter source
  after the refactor. No audit script needs updating.
- **Where the refactor _does_ nudge the spec.** The "Layered CSS
  strategy" Requirement says above-the-fold uses scoped `<style>`,
  below-the-fold uses Tailwind. The refactor moves page-level scoped
  `<style>` for typography (e.g. `.page-header h1`, `.lede`) into
  Tailwind utilities via the atom's `variantClasses`. This is
  _consistent_ with the spec — those page-headers are not above-the-
  fold per the audit's allow-list (`Hero.astro`, `Header.astro`,
  `Nav.astro`). If a reviewer reads the spec strictly and worries that
  page headers near the top of the document count as above-the-fold,
  `design.md` § Performance budget applicability covers the fallback
  (restore a scoped `<style>` block on a per-page basis if Beasties
  fails to inline the critical CSS).
