# Spec delta: templates-perf — docs-add-footer-chrome-parity-with-start

This change adds new HTML markup (the `<Footer />` component) to
every page in the docs template build via `BaseLayout.astro`. The
existing `templates-perf` requirements (Lighthouse mobile ≥ 95, total
transfer ≤ 150KB compressed for the home page, Beasties critical-CSS
inlining, no new runtime deps) apply unchanged to every affected page.
No new runtime dependency is added by this change. The footer is
Astro + vanilla HTML / Tailwind utilities — no `<script>`, no font
load, no third-party request.

This delta exists so the per-change audit dispatcher and the
reviewer's perf-budget tier know to include the docs home page (`/`)
and at least one inner page (e.g. `/introduction`) in the budget run
after the footer is wired in.

## ADDED Requirements

_None._

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._
