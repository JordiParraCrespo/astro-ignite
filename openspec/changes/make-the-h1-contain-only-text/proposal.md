# Proposal: make-the-h1-contain-only-text

## Why

The `HeroSection` on `apps/site` currently splits its headline into two i18n
keys — a muted prefix (`landing.hero.headlineMuted` rendered inside a
`<span class="text-fg-muted">`) and the tail (`landing.hero.headlineTail`).
The product direction is a single plain-text headline. The muted prefix, its
nested span, and its translations need to go.

`apps/site/` is a marketing mirror, not a template. Only `apps/site/` files
are in scope; `packages/templates/starter/` must not change in this PR (the
boundary is enforced by `apps/site/CLAUDE.md`).

## Scope

In scope:

- `apps/site/src/components/landing/HeroSection.astro` — the `<h1>` is
  reduced to a single text child rendered from
  `t('landing.hero.headlineTail')`.
- `apps/site/src/i18n/en.json` — drop `landing.hero.headlineMuted`.
- `apps/site/src/i18n/es.json` — drop `landing.hero.headlineMuted`.

Out of scope:

- `packages/templates/starter/`. The starter mirror keeps its current hero
  shape; if/when the starter is updated, it will be a separate change.
- The rest of `landing.hero.*` keys (`lede`, `ledeEmph`, `pillTag`, `copyLabel`,
  CTAs). They stay as-is.
- The `<p>` lede block that uses `<span class="text-fg">{t('landing.hero.ledeEmph')}</span>`
  — that span is on a paragraph, not the `<h1>`, and the issue limits the
  change to the headline.
- Other muted/tail headline pairs in the file (`landing.cta.headlineMuted`,
  `landing.templates.starterPreviewHeadingMuted`). Those headlines live in
  different sections and are not the `<h1>`.

## Scenarios

### S1 — `<h1>` has a single plain-text child

- **GIVEN** the rendered landing page at `/`
- **WHEN** the DOM tree under the hero is inspected
- **THEN** the `<h1>` element has exactly one child node, a text node
  whose value equals `landing.hero.headlineTail` for the active locale;
  there is no `<span>` descendant of the `<h1>`.

### S2 — `landing.hero.headlineMuted` is gone from the English dictionary

- **GIVEN** `apps/site/src/i18n/en.json`
- **WHEN** the file is parsed as JSON
- **THEN** `landing.hero.headlineMuted` is undefined (the key does not
  exist under `landing.hero`).

### S3 — `landing.hero.headlineMuted` is gone from the Spanish dictionary

- **GIVEN** `apps/site/src/i18n/es.json`
- **WHEN** the file is parsed as JSON
- **THEN** `landing.hero.headlineMuted` is undefined (the key does not
  exist under `landing.hero`).

### S4 — `t('landing.hero.headlineMuted')` is no longer referenced

- **GIVEN** the `apps/site/src/` tree
- **WHEN** `grep -R "landing.hero.headlineMuted" apps/site/src` is run
- **THEN** there are zero matches. The TypeScript path type
  `TranslationKey = Path<typeof en>` therefore no longer admits the
  string `'landing.hero.headlineMuted'`, so any stray call would be a
  compile error.

### S5 — Typecheck passes

- **GIVEN** the modified working tree
- **WHEN** `pnpm typecheck` runs from the repo root
- **THEN** it exits 0. (This covers the type-narrowing implication of
  removing the key from `en.json`, since `Dictionary = typeof en`.)

### S6 — Site builds

- **GIVEN** the modified working tree
- **WHEN** `pnpm build --filter @astro-ignite/site` runs
- **THEN** it exits 0 and emits the expected static output.

### S7 — Starter template is untouched

- **GIVEN** the modified working tree
- **WHEN** `git diff --name-only main -- packages/templates/starter/` runs
- **THEN** there are zero files listed. (Enforces the boundary stated in
  `apps/site/CLAUDE.md`.)
