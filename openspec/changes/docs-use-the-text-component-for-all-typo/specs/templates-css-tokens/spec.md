# Delta: templates-css-tokens — docs-use-the-text-component-for-all-typo

This change refactors typography call sites across
`packages/templates/docs/` (and its scaffolded mirror in `apps/docs/`)
to route through the existing `<Text>` atom — newly mirrored from
`packages/registry/base/text.astro` into
`packages/templates/docs/src/components/ui/text.astro` — instead of
inline Tailwind utilities and per-component scoped `<style>` rules.
It does not change the long-lived `templates-css-tokens` contract:
components still reference tokens, the zinc scale still lives only in
`global.css`, tri-state dark mode still flips tokens, and
above-the-fold components still use scoped `<style>`.

## ADDED Requirements

_None._

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._

## Notes

- **Why no spec delta?** The capability spec describes the
  _structural_ CSS contract — tokens, no raw zinc, tri-state dark
  mode, layered CSS. Centralising typography through an existing atom
  is consistent with every Requirement in the spec; it does not add a
  new rule. The audit table's I1 (no raw zinc / hex), I2 (`global.css`
  tokens), I3 (tri-state dark mode), and I4 (layered CSS —
  above-the-fold scoped `<style>`) all continue to hold after the
  change. This mirrors the precedent established in
  `openspec/changes/starter-use-the-text-component-for-all-t/specs/templates-css-tokens/spec.md`.
- **Why not a new "atom-first typography" Requirement?** Considered
  and rejected in `../../design.md` § Rejected alternative — same
  reasoning the starter spec used. The rule would need a "body copy
  vs chrome label" heuristic and a maintained allow-list. We follow
  the precedent set by `templates-i18n` I6 (`LocaleSwitcher`
  presence — "manual (no static audit yet)") and let the reviewer's
  visual sweep + the `scaffold:test` pass be the live guard.
- **Live guards relevant to the change:**
  - `node scripts/audit/tokens-only.mjs` — I1 (no raw zinc / hex).
  - `node scripts/audit/tokens-only.mjs --layered` — I4 (Hero / Nav /
    Header keep their scoped `<style>` block; the docs template
    contains none of those three, so the audit is vacuously green for
    docs and continues to enforce the rule against any future
    above-the-fold chrome that lands in the docs template).
  - `pnpm scaffold:test` — Lighthouse budget on the generated docs
    fixture (the playground regenerates with the docs template
    selection on demand).
  - The `grep` regression check in `tasks.md` T16 — confirms no
    `<h1>`–`<h6>` or `<p>` outside the allow-listed atom sources
    carries typography utility soup in either the docs template or
    `apps/docs/`.
- **Audit coverage.** The audit scripts above already scan
  `packages/templates/<kind>/` (which includes `docs/`) and
  `apps/*/src/`. No audit script needs updating.
- **Where the refactor _does_ nudge the spec.** The "Layered CSS
  strategy" Requirement says above-the-fold uses scoped `<style>`,
  below-the-fold uses Tailwind. The refactor removes the typography
  portions of scoped `<style>` blocks on `DocsLayout`, `LegalLayout`,
  `ComponentShowcase`, `SidebarNav`, and `CookieBanner`. Those scoped
  blocks survive — only the typography rules collapse; layout,
  positioning, and bespoke decoration stay. `SidebarNav` is the only
  one of those five that is above-the-fold (it is the docs chrome
  rail), and its scoped block remains. The audit's hard-coded
  above-the-fold allow-list (`Hero.astro`, `Header.astro`,
  `Nav.astro`) does not include `SidebarNav.astro`, so the audit
  result is unchanged.
- **MDX rendering is out of scope.** The `<style is:global>.docs-prose`
  and `<style is:global>.legal-prose` blocks stay untouched (these
  cover the rendered MDX `<slot />`, which is explicitly out of
  scope). The Layered CSS Requirement's spirit is preserved: the
  global prose stylesheet is the canonical centralisation for
  markdown-rendered typography in this template.
