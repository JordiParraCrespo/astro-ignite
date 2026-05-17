# Capability: registry-blocks

## Purpose

Blocks compose atoms. They are page-section-scale (PricingCard,
FeatureGrid, Hero, Testimonials) — not full pages, not full layouts.
A block is "drop this into your page, change the props, move on."

This capability is **not yet populated**. The first block ships under
feature `#2 — registry-block-pricing-card`.

## Boundary

Owned by: `packages/registry/blocks/*`. Each block lives in its own
directory with one composition file and (optionally) sub-parts.

Touched by: anywhere a marketing/landing page wants a pre-built section.

## Requirements

### Requirement: Blocks compose atoms, never re-implement them

A block SHALL build its UI from atoms in `base/*`. Re-implementing a
Card, Button, or Badge inside a block is forbidden — depend on the atom
and compose.

#### Scenario: PricingCard uses Card + Button
- **GIVEN** PricingCard needs a card surface and a CTA button
- **WHEN** it's implemented
- **THEN** the source imports from `base/card/*` and `base/button/*`;
  it does not redeclare card / button markup inline.

### Requirement: Same framework rule as atoms

Blocks SHALL also be Astro + vanilla JS. No React, no Radix, no
headless-UI in `packages/registry/blocks/*`.

#### Scenario: Adding a Testimonials carousel
- **GIVEN** the contributor wants a carousel
- **WHEN** they reach for embla-carousel-react
- **THEN** the audit rejects; a custom element or pure CSS scroll-snap
  is the correct path.

### Requirement: Blocks are demoed on a real page

Every block SHALL ship with a demo `.astro` (or `.mdx`) in
`apps/site/src/pages/blocks/<block-name>.astro` so users can see it
live. The demo page meets the `templates-perf` budget.

#### Scenario: A new block ships
- **GIVEN** a new PricingCard
- **WHEN** the PR opens
- **THEN** `apps/site/src/pages/blocks/pricing-card.astro` exists,
  renders the block in 2-3 prop variations, and `pnpm perf:budget`
  passes against it.

### Requirement: `registryDependencies` resolves the atom graph

A block's entry in `registry.json` SHALL list every atom it composes,
so `npx <future-cli> add pricing-card` pulls atoms transitively.

#### Scenario: Adding PricingCard
- **GIVEN** PricingCard composes Card + Button
- **WHEN** the registry entry is written
- **THEN** `registryDependencies: ["cn", "card", "button"]`.

## Invariants (audit table)

| Id | Statement | Audit |
|----|-----------|-------|
| I1 | No React / Vue / Svelte / Radix in `blocks/` | `node scripts/audit/no-react-in-atoms.mjs --include-blocks` |
| I2 | Every block has a demo under `apps/site/src/pages/blocks/` | manual until automated |
| I3 | Blocks import from `base/*` for atoms; no inline reimplementation | `node scripts/audit/no-react-in-atoms.mjs --no-reimpl` |
| I4 | `registry.json` block entries declare atom deps | `node scripts/audit/no-react-in-atoms.mjs --block-deps` |
