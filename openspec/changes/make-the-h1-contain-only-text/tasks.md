# Tasks: make-the-h1-contain-only-text

Order matters: removing the call site (T1) before removing the dictionary
keys (T2, T3) means `pnpm typecheck` stays green at every intermediate
commit. Doing it the other way would leave the tree red between T2 and T1.

- [ ] **T1.** In `apps/site/src/components/landing/HeroSection.astro`,
      replace the `<h1>` body (currently a `<span class="text-fg-muted">`
      wrapping `{t('landing.hero.headlineMuted')}` followed by `{' '}` and
      `{t('landing.hero.headlineTail')}`) with a single
      `{t('landing.hero.headlineTail')}` child. The `<h1>` element, its
      class list, and the surrounding `<header>` / grid markup do not
      change. Covers **S1**.

- [ ] **T2.** In `apps/site/src/i18n/en.json`, delete the
      `landing.hero.headlineMuted` entry. Preserve JSON validity (trailing
      commas). Covers **S2**.

- [ ] **T3.** In `apps/site/src/i18n/es.json`, delete the
      `landing.hero.headlineMuted` entry. Preserve JSON validity. Covers
      **S3**.

- [ ] **T4.** Run `grep -R "landing.hero.headlineMuted" apps/site/src` and
      confirm zero matches. Covers **S4**.

- [ ] **T5.** Run `pnpm typecheck` from the repo root and confirm exit 0.
      Covers **S5**.

- [ ] **T6.** Run `pnpm build --filter @astro-ignite/site` and confirm
      exit 0. Covers **S6**.

- [ ] **T7.** Run `git diff --name-only -- packages/templates/starter/`
      and confirm zero output. Covers **S7** (boundary: starter mirror
      stays untouched).

- [ ] **T8.** Run `pnpm audit:invariants --change make-the-h1-contain-only-text`
      and confirm it passes — apps/site is not template-audited, so I1–I6
      stay green by construction; this is the live guard.

- [ ] **T9.** Run the perf-budget check applicable to the harness
      (`pnpm perf:budget` or equivalent for `apps/site`) and capture the
      report under `openspec/changes/make-the-h1-contain-only-text/runs/<ts>/perf.txt`.
      Covers the "Performance budget applicability" section of
      `design.md`.

- [ ] **T10.** Add a changeset summarising the apps/site hero
      simplification (no template changes, no public API impact). Required
      by `feature_list.json` rule `require_changeset_to_close`.
