# Notes: migrate-docs-template-to-tailwind-css

## Decisions recorded during implementation

### T2 — DocsLayout MDX-prose treatment

Picked **Option (a)** from `design.md`: `@apply` inside a kept
`<style is:global>` block. Rationale: MDX-emitted elements are not in
Tailwind's class-scan path, so they need selectors. `@apply` re-uses
Tailwind utilities (and the token layer) inside those selectors so the
rule remains the single source of truth.

### T3 — LegalLayout MDX-prose treatment

LegalLayout's `:global(blockquote)` rule is a single declaration set
that can be expressed via `@apply`. The MDX prose for legal pages is
otherwise handled by Tailwind's `prose` class on the `.legal-prose`
container — Tailwind v4 does not ship typography by default, but the
existing rules are minimal and live inside the legal layout. Kept as
`<style is:global>` + `@apply`, mirroring T2.

### T1 — BaseLayout

No scoped `<style>` block exists. `.skip-link` lives in `global.css`
(unchanged). T1 is a no-op; no commit required.

### T8 — CookieBanner keyframes

No slide-in keyframe is needed; the banner uses a CSS opacity
transition that maps cleanly to Tailwind transition utilities.

### Tailwind arbitrary-value spelling

Per design.md "Rejected alternative — Migrate via a Tailwind config
theme extension", use `bg-[var(--color-bg)]` style arbitrary values
(not custom `@theme` named utilities). Lengths that match a Tailwind
scale stop use the stop (`mb-6` for `1.5rem`); otherwise use
arbitrary `[…]` syntax.

### `tracking-[…]` arbitrary letter-spacing

Some headings use `-0.04em`, `-0.03em`, `-0.02em` letter-spacing.
These map to Tailwind arbitrary values `tracking-[-0.04em]` etc.
