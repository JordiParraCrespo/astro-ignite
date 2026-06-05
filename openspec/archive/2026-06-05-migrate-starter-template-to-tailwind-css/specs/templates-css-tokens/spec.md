# Capability delta: templates-css-tokens

Applies to `openspec/specs/templates-css-tokens/spec.md`. The leader
merges this delta into the long-lived spec after the change is
APPROVED.

## MODIFIED Requirements

### Requirement: Layered CSS strategy → Tailwind-first styling, token-resolved

Templates SHALL express component styling through Tailwind v4 utility
classes resolved against the `--color-*` design tokens declared in
`src/styles/global.css`. Scoped `<style>` blocks inside Astro
components SHALL be reserved for cases Tailwind cannot express —
specifically keyframe animations, view-transition selectors, and
runtime-dynamic CSS computed from component props — and each such
block SHALL carry a leading `<!-- tailwind-exception: <reason> -->`
comment naming what Tailwind cannot express.

The previous "Above-the-fold uses scoped `<style>`; below-the-fold
uses Tailwind v4" split is removed. The previous Beasties dependency
is governed by the templates-perf capability and is no longer cited
here.

> Rationale (for future readers): the split it replaced was justified
> when Tailwind compile time made inline critical CSS necessary;
> Tailwind v4 compiles in ≤ 100 ms on this codebase, and the audit for
> "above the fold" could not be made deterministic without growing a
> per-page heuristic that rotted in practice. See the migration's
> `design.md` for the LCP measurements that supported the change.

#### Scenario: A new hero component is added

- **GIVEN** a contributor adds a new hero section above the fold
- **WHEN** they write its styling
- **THEN** color / spacing / typography utilities go in `class=` strings
  and resolve through `var(--color-*)` (e.g. `bg-[var(--color-bg)]`,
  `text-[var(--color-fg)]`); the file ships no scoped `<style>` block
  unless it implements a keyframe animation or view transition that
  Tailwind cannot express, in which case the block carries a
  `<!-- tailwind-exception: <reason> -->` comment.

#### Scenario: Audit catches a `<style>` block without justification

- **GIVEN** a contributor adds a scoped `<style>` block to a starter
  component without the exception comment
- **WHEN** the tokens-only audit runs
- **THEN** the audit fails with `unjustified <style> block — add
  <!-- tailwind-exception: <reason> --> or migrate to Tailwind`.

## Invariants (audit table) — delta

Remove the I4 row entirely from the long-lived spec's invariants table:

| Id     | Statement                                                                                                       | Audit                                              |
| ------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| ~~I4~~ | ~~Above-the-fold uses scoped `<style>` (heuristic — flag overuse of Tailwind in `Hero.astro`, `Header.astro`)~~ | ~~`node scripts/audit/tokens-only.mjs --layered`~~ |

The `--layered` flag on `scripts/audit/tokens-only.mjs` stays accepted
as a deprecated no-op so older changes' `design.md` files do not break
their `pnpm audit:invariants --change <name>` invocations; the body of
the check is removed and the flag prints a one-line "deprecated; this
invariant was retired by `migrate-starter-template-to-tailwind-css`"
notice on stderr.

If a future migration wants to enforce the new shape via an audit
(e.g., "no `<style>` block in a starter component unless the
exception comment is present"), it adds a new row + script — it does
not revive `--layered`.

## ADDED Requirements

### Requirement: Components reference tokens through Tailwind utilities

Every color / surface / border / shadow / radius value referenced from
a component SHALL resolve to a CSS variable declared in
`packages/templates/<kind>/src/styles/global.css` — either via a
Tailwind utility wired to the token layer (e.g. `bg-fg`, when the
Tailwind config maps `fg → var(--color-fg)`) or via arbitrary-value
syntax (`bg-[var(--color-fg)]`). Raw `bg-zinc-*`, `text-zinc-*`, hex
literals, and ad-hoc `rgb()` / `oklch()` calls in components remain
forbidden, exactly as the existing "Components reference tokens, never
raw zinc" requirement specifies.

#### Scenario: A reviewer scans the migrated tree

- **GIVEN** the starter migration is merged
- **WHEN** the reviewer greps `bg-zinc-` / `text-zinc-` / `#[0-9a-f]{3,8}`
  across every `.astro` file in `packages/templates/starter/src/`
- **THEN** the only matches are inside `src/styles/global.css`; every
  component is token-driven through utility classes.

(This requirement does not change anything that wasn't already true
under the existing "Components reference tokens, never raw zinc"
requirement — it is added here to make explicit that the new
single-layer strategy keeps the token-only rule intact and to remove
any ambiguity about whether arbitrary-value Tailwind syntax counts as
"referencing a token".)
