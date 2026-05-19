# Spec delta: templates-perf — docs-add-404-page-with-i18n-locale-paral

This change adds a new HTML surface to the docs template build (the 404
page, plus one localized parallel per non-default locale). The existing
`templates-perf` requirements (Lighthouse mobile ≥ 95, total transfer
≤ 150KB compressed for the home page, Beasties critical-CSS inlining,
no new runtime deps) apply unchanged to the new pages. No new
runtime dependency is added by this change. This delta exists so the
per-change audit dispatcher and the reviewer's perf-budget tier know
to include the 404 surface (`/does-not-exist` or `/404.html`) in the
budget run.

## ADDED Requirements

_None._

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._
