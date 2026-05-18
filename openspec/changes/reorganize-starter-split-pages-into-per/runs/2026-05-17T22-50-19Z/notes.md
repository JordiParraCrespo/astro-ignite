# Implementation notes — reorganize-starter-split-pages-into-per

Run: 2026-05-17T22-50-19Z

## Localization pattern

**Section calls `useTranslations` itself.** Each new section component
re-derives `locale = Astro.currentLocale ?? siteConfig.defaultLocale`
and calls `useTranslations(locale)` for its own copy keys. Pages pass
only the prepared collection / action data (`postCards`, `projectCards`,
contact `result` / `inputError`).

Why: avoids prop-drilling 4–6 translated strings per section and keeps
the default-locale page and its `[lang]/` parallel byte-identical in the
body. The page frontmatter still owns JSON-LD assembly (which also reads
translations).

## 404 section

Picked option (a): a new
`src/components/sections/not-found/NotFoundHero.astro` carrying the
existing `<section class="not-found">` markup and its scoped `<style>`
block. The pre-existing `src/components/blocks/not-found-state.astro` is
a different shape (token/Tailwind-only marketing block) and not the same
markup; leaving it untouched.

## features array

`FeaturesGrid.astro` builds its own `features` array internally using
the section-side `useTranslations`. The page passes nothing — the
component is parameter-free. The page just renders `<FeaturesGrid />`
underneath `<Hero />`.
