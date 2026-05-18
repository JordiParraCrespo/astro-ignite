# Tasks: starter-use-the-text-component-for-all-t

Order matters. T1 surveys; T2 (if needed) lands atom extensions first so
that subsequent edits resolve to a stable variant API; T3–T8 refactor
files in waves grouped by surface, leaving the tree in a buildable state
between waves; T9–T13 run the verification ladder.

The `committer --design` allow-list will reject any path not declared in
`design.md` § Files touched. Stay within it.

## Survey

- [x] **T1.** Inventory every `<h1>`–`<h6>` and `<p>` in
      `packages/templates/starter/src/{pages,components,layouts}/**/*.astro`
      and classify each as either (a) "body copy or heading inside an
      in-scope file", (b) "chrome / atom / scoped-style-encapsulated and
      excepted", or (c) "MDX-rendered through `<slot />` and out of
      scope". Output the classification to
      `openspec/changes/starter-use-the-text-component-for-all-t/runs/<ts>/inventory.md`
      so the reviewer can confirm S1, S2, S3 coverage. Covers **S1**,
      **S2**, **S3**.

## Atom extension (only if T1 requires it)

- [x] **T2.** If T1 surfaces a typography pattern none of the existing
      `Text` variants can express, extend
      `packages/registry/base/text.astro` with the new variant entry
      (variant union member + `defaultTag` + `variantClasses` row).
      Mirror the edit exactly into
      `packages/templates/starter/src/components/ui/text.astro`. Confirm
      the two files diff only in incidental whitespace. If no extension
      is needed, leave both files untouched and note "no extension
      required" in `runs/<ts>/inventory.md`. Covers **S5**.

## Refactor — pages (default locale)

- [x] **T3.** `packages/templates/starter/src/pages/index.astro`:
      replace the features `<h2>` with `<Text variant="h2">` and each
      feature-card `<h4>`/`<p>` with `<Text variant="h4">` /
      `<Text variant="muted">` (or whichever variants T1 maps them to).
      The numeric `index` / `tag` `<span>` chips are chrome and stay.
      Import `Text` from `@/components/ui/text.astro`. Drop the inline
      typography classes from the now-wrapped elements. Covers **S1**.

- [x] **T4.** `packages/templates/starter/src/pages/about.astro`:
      replace `.page-header h1` → `<Text variant="h1">`, `.lede` →
      `<Text variant="lead">`, and each `.prose` `<h2>` / `<p>` →
      `<Text>`. Shrink the scoped `<style>` block to layout rules only
      (`.page` width + padding). Covers **S1**.

- [x] **T5.** `packages/templates/starter/src/pages/contact.astro`:
      page header → `<Text>`; `.field-error` `<p>` → `<Text
variant="small" class="field-error">`. The `.field-error` class still
      provides the danger color (semantic error state, not typography).
      Covers **S1**.

- [x] **T6.** `packages/templates/starter/src/pages/blog/index.astro`:
      page header → `<Text>`; empty-state `<p>` → `<Text>`; per-card
      `<h2>`/`.post-meta`/`.post-description` → `<Text>`. Update the
      scoped `<style>` to drop typography rules. Covers **S1**.

- [x] **T7.** `packages/templates/starter/src/pages/projects/index.astro`:
      same pattern as T6 applied to the projects listing. Covers **S1**.

## Refactor — pages (`[lang]/` parallels)

- [x] **T8.** Mirror T3 / T4 / T5 / T6 / T7 into
      `packages/templates/starter/src/pages/[lang]/{index,about,contact}.astro`
      and `packages/templates/starter/src/pages/[lang]/{blog,projects}/index.astro`
      respectively. Every default-locale page MUST have its parallel
      updated in lockstep (this is templates-i18n I1/I2 — the audit
      will fail if parallel content drifts; in practice the structures
      already mirror, so changes are line-for-line). Covers **S1**.

## Refactor — components and layouts

- [x] **T9.** `packages/templates/starter/src/components/Footer.astro`:
      brand-block `<p>` / tagline `<p>` → `<Text>` (semibold body and
      muted small); section `<h3>` → `<Text variant="h4" as="h3">`;
      copyright + built-with `<p>` → `<Text variant="small"
tone="muted">`. The links inside `<ul>` are nav links (chrome) and
      stay as `<a class="...">`. Covers **S2**.

- [x] **T10.** `packages/templates/starter/src/components/blocks/not-found-state.astro`:
      `<span class="mono ...">{code}</span>` → `<Text variant="eyebrow"
class="mono">`; `<h1 ...>` → `<Text variant="h1">`; `<p ...>` →
      `<Text variant="muted">`. The block mirrors the `404.astro` shape
      installed in PR #31. Covers **S2**.

- [x] **T11.** `packages/templates/starter/src/layouts/ArticleLayout.astro`,
      `ProjectLayout.astro`, `LegalLayout.astro`: hand-rolled header
      `<h1>` and meta/summary `<p>` → `<Text>`. The MDX `<slot />` body
      and the `.prose` `<style is:global>` block remain untouched —
      they cover MDX rendering, which is explicitly out of scope. Drop
      the now-unused scoped rules (`.article-header h1`, `.legal-header
h1`, `.project-header h1`, `.project-summary`, `.legal-meta`,
      `.article-meta` typography). Keep layout-only rules
      (margin / display / max-width). Covers **S3**.

## Verification

- [ ] **T12.** From the repo root run
      `grep -REn '<(h[1-6]|p)\b[^>]*class="[^"]*\b(text-\[|text-(lg|sm|xs|base|2xl|3xl|4xl|5xl|6xl)|leading-|font-(medium|semibold|bold|normal)|tracking-)[^"]*"' packages/templates/starter/src/`
      and confirm matches occur only inside
      `src/components/Hero.astro`, `src/components/Nav.astro`,
      `src/components/CookieBanner.astro`, or `src/components/ui/*`.
      Any other match is a bug — go back and fix it before continuing.
      Covers **S4**.

- [ ] **T13.** From the repo root run
      `node scripts/audit/tokens-only.mjs` and
      `node scripts/audit/tokens-only.mjs --layered` and confirm both
      exit 0. Covers **S6**, **S7**.

- [ ] **T14.** From the repo root run
      `node scripts/audit/no-react-in-atoms.mjs --named-only --registry --family-layout`
      and confirm exit 0. Covers **S8**.

- [ ] **T15.** From the repo root run
      `pnpm audit:invariants --change starter-use-the-text-component-for-all-t`
      and capture the output under
      `openspec/changes/starter-use-the-text-component-for-all-t/runs/<ts>/audit.md`.
      Covers **S9**.

- [ ] **T16.** From the repo root run `pnpm typecheck` and confirm
      exit 0 (the Text atom's prop types narrow at every call site).

- [ ] **T17.** From the repo root run `pnpm test` (recursive vitest)
      and confirm exit 0.

- [ ] **T18.** From the repo root run `pnpm scaffold:test` against the
      starter fixture. Confirm the build succeeds and the Lighthouse
      output recorded by the harness meets the existing template
      budget. Capture the report under
      `openspec/changes/starter-use-the-text-component-for-all-t/runs/<ts>/perf.txt`.
      Covers **S10**.

- [ ] **T19.** Confirm boundary: from the repo root run
      `git diff --name-only main -- ':!openspec'` and verify every
      changed file is under
      `packages/templates/starter/` or is
      `packages/registry/base/text.astro` (the only registry mirror
      file). Zero `apps/**`, zero `packages/templates/docs/**`, zero
      other registry files. Covers **S11**.

- [ ] **T20.** Add a changeset under `.changeset/` describing the
      starter typography refactor (patch-level — no public API impact;
      the Text atom's signature only grows non-breaking variants if at
      all). Required by `feature_list.json` rule
      `require_changeset_to_close`.
