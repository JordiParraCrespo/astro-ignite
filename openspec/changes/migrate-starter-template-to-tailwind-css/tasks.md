---
name: migrate-starter-template-to-tailwind-css
capabilities:
  - templates-css-tokens
  - templates-perf
---

## Ordered task checklist

Each task lists the scenario(s) (`S<n>`) and invariant(s) (`I<n>`,
referenced by capability prefix) it covers. Tasks are ordered so each
step is reviewable as a standalone commit via `scripts/committer
--design`.

### Phase 1 — Audit & token surface

- [ ] **T1. Inventory scoped `<style>` blocks in the starter.** Run
      `grep -l '<style' packages/templates/starter/src/**/*.astro` and
      record the matrix of (component, tokens consumed, CSS features
      used) in a comment block at the top of `design.md` (under
      "Beasties decision"). Confirms whether any component uses
      `clamp()`, container queries, or keyframes that Tailwind cannot
      express. _(Covers: S1, S2 — discovery before edits.)_
- [ ] **T2. Verify the `--color-*` token surface is sufficient.** Walk
      the inventory from T1 and cross-check that every CSS variable
      referenced is already declared in `global.css`. If a component
      uses an ad-hoc literal (e.g. `0.8125rem` for the eyebrow font
      size), decide whether to add a token (`--font-size-eyebrow`) or
      keep the literal inside a Tailwind arbitrary value (`text-[0.8125rem]`).
      Document each new token in the global.css patch. No code edits
      yet. _(Covers: S1, S2, templates-css-tokens I1.)_

### Phase 2 — Migrate above-the-fold components first

- [ ] **T3. Migrate `Hero.astro`.** Replace the scoped `<style>` block
      with Tailwind utilities; each color uses `bg-[var(--color-*)]` or
      `text-[var(--color-*)]`; the eyebrow / title / description sizing
      uses the existing `clamp()` values via Tailwind arbitrary values
      (`text-[clamp(2.25rem,6vw,4.5rem)]`). Verify `pnpm dev` renders
      identically (visual diff against `main` in two browser windows).
      _(Covers: S1, S3, templates-css-tokens I1, I3.)_
- [ ] **T4. Migrate `Header.astro` + `Brand.astro` + `LocaleSwitcher.astro` + `ThemeToggle.astro`.** Same shape as T3.
      `ThemeToggle.astro` keeps its inline `<script>` block — that
      script is logic, not styling. _(Covers: S1, S3, templates-css-tokens I1, I3.)_
- [ ] **T5. Migrate `Footer.astro` + `FeaturesGrid.astro` + `Analytics.astro`.** Same shape.
      `Analytics.astro` rendering a `<script>` is unaffected; only the
      `<style>` block (if any) goes. _(Covers: S1, S3, templates-css-tokens I1, I3.)_
- [ ] **T6. Run perf checkpoint #1.** With T3–T5 merged onto a branch,
      run `pnpm build --filter @astro-ignite/template-starter` and then
      `pnpm perf:budget --page / --page /blog`. Record LCP / CLS /
      total-transfer in `design.md` under "Beasties measurement" Build B.
      If any metric regresses past the budget, revert the offending
      component and reshape the migration before continuing.
      _(Covers: S4, templates-perf I1, I2, I3.)_

### Phase 3 — Migrate the rest of the components

- [ ] **T7. Migrate page section components.** `AboutBody.astro`,
      `BlogIndexList.astro`, `ProjectsIndexList.astro`,
      `ContactSection.astro`, `NotFoundHero.astro`, `CookieBanner.astro`.
      One commit per component family. For each, before-after screenshots
      attached to the run notes confirm zero visual regression.
      _(Covers: S1, S3, templates-css-tokens I1, I3.)_
- [ ] **T8. Migrate layouts.** `BaseLayout.astro`, `ArticleLayout.astro`,
      `LegalLayout.astro`, `ProjectLayout.astro`. Layouts that only
      compose components shouldn't need any change beyond removing
      now-dead `<style>` blocks. _(Covers: S1, templates-css-tokens I1.)_
- [ ] **T9. Sweep pages.** Walk every file under
      `packages/templates/starter/src/pages/` (including `[lang]/`
      parallels) and remove any inline `<style>` blocks. Pages should
      already be composition-only after the
      `restructure-starter-template-component-o` change, so this is
      mostly a verification pass. _(Covers: S1.)_
- [ ] **T10. Clean `global.css`.** Remove rules that existed only to
      patch around scoped `<style>` blocks now deleted. Keep the
      `@theme` token block, `.light` overrides, `@layer base` resets,
      `.hairline`, `.mono`, `.caret` / `@keyframes ig-blink`. No token
      values change. _(Covers: S1, S3, templates-css-tokens I2, I3.)_

### Phase 4 — Beasties decision & spec delta finalisation

- [ ] **T11. Run the Beasties A/B/C measurement.** Per the table in
      `design.md`, measure LCP median-of-5 with Beasties enabled
      pre-migration (Build A), with Beasties enabled post-migration
      (Build B), and without Beasties post-migration (Build C). Fill
      in the table. _(Covers: S4, S5, templates-perf I1, I4.)_
- [ ] **T12. Apply the Beasties decision.** If DROP: remove the
      Beasties integration from `astro.config.mjs` and the dep from
      `package.json`; keep the spec delta as written (the
      templates-perf delta in this change already deletes the Beasties
      requirement + I4 row). If RETAIN: replace the templates-perf
      spec delta with a MODIFIED Requirement that keeps Beasties but
      drops the "above the fold" language. _(Covers: S5, templates-perf I4, I5.)_
- [ ] **T13. Drop the layered-CSS audit body.** Edit
      `scripts/audit/tokens-only.mjs` so the `--layered` flag becomes a
      deprecated no-op (accept the flag; print a one-line "deprecated"
      notice on stderr; exit 0). Do not delete the flag entry — older
      change `design.md` files may still list it in their `pnpm
audit:invariants` invocation. _(Covers: S2, templates-css-tokens I4.)_

### Phase 5 — Mirror, refresh, document

- [ ] **T14. Mirror into `apps/site/`.** Apply the same Tailwind-first
      shape to every component under `apps/site/src/` that had a
      scoped `<style>` block before this migration. Run `pnpm build
--filter @astro-ignite/site` and `pnpm typecheck` to verify.
      _(Covers: S6, templates-css-tokens I1, I3.)_
- [ ] **T15. Refresh the CLI template cache.** Run `node
packages/astro-ignite/scripts/copy-templates.mjs`. Commit the
      regenerated `packages/astro-ignite/templates/starter/` tree.
      _(Covers: S7.)_
- [ ] **T16. Update documentation.** Root `AGENTS.md`,
      `packages/templates/starter/CLAUDE.md`,
      `packages/templates/starter/AGENTS.md` (note: the latter two
      may be the same file via symlink — edit the source once),
      `.claude/skills/new-template/SKILL.md` item 4 if applicable.
      Replace every sentence claiming "above-the-fold uses scoped
      `<style>` blocks" with the single-layer Tailwind description.
      _(Covers: S8.)_
- [ ] **T17. Apply the spec deltas.** This change's `specs/templates-css-tokens/spec.md`
      and `specs/templates-perf/spec.md` are deployed to the
      long-lived specs by the leader after the change is APPROVED — no
      action here other than ensuring the deltas are written and
      consistent with the implementation. _(Covers: S2, S5.)_
- [ ] **T18. Write the changeset.** Add
      `.changeset/migrate-starter-template-to-tailwind-css.md`
      describing the styling-strategy switch as a breaking change for
      end users tracking the starter's component diff; include the
      Beasties decision in one sentence. _(Covers: S10.)_

### Phase 6 — Full verification

- [ ] **T19. Regenerate the playground.** Run `pnpm scaffold:test
--full`. The playground tree under `apps/playground/` is
      regenerated by CI; verify locally that the scaffold builds clean.
      _(Covers: S4, templates-perf I1.)_
- [ ] **T20. Final invariant + perf + e2e sweep.** Run, in order:
      `pnpm format && pnpm typecheck && pnpm test && pnpm
audit:invariants --change migrate-starter-template-to-tailwind-css
&& pnpm perf:budget && pnpm test:e2e --project=starter`. Every
      command must exit 0. Attach the perf:budget JSON to the run
      directory. _(Covers: S2, S3, S4, S9, templates-css-tokens I1, I2, I3; templates-perf I1, I2, I3, I5.)_
- [ ] **T21. Walk the `new-template` 15-item audit checklist.** The
      skill at `.claude/skills/new-template/SKILL.md` ships a
      template-completeness checklist; the issue body explicitly
      requires walking it after this migration. Mark each item pass /
      fail in the run notes. _(Covers: S8, S9.)_
