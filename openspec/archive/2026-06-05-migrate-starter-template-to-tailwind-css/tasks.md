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
      used) in a brief inventory note inside the run dir (e.g. under
      `openspec/changes/migrate-starter-template-to-tailwind-css/runs/<ts>/inventory.md`).
      Confirms whether any component uses `clamp()`, container queries,
      or keyframes that Tailwind cannot express. _(Covers: S1, S2 —
      discovery before edits.)_
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
- [ ] **T6. Run perf checkpoint #1 (advisory).** With T3–T5 merged
      onto a branch, run `pnpm build --filter @astro-ignite/template-starter`
      and then `pnpm perf:budget`. On the autopilot runner this skips
      Lighthouse with a non-failing finding (Chrome / lighthouse not
      available); the CI workflow `Lighthouse CI (mobile)` is the
      authoritative gate and runs on every push. Record whatever the
      local run emits in the run dir for traceability. If CI Lighthouse
      regresses past the budget on subsequent pushes, revert the
      offending component and reshape the migration before continuing.
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

### Phase 4 — Beasties removal & spec delta finalisation (DROP by policy)

- [ ] **T11. Confirm DROP-by-policy is consistent.** No measurement
      gate; the decision is recorded in `design.md` under "Beasties
      decision — DROP by policy". Verify that (a) the Beasties
      integration is gone from `packages/templates/starter/astro.config.mjs`,
      (b) the `astro-beasties` (or equivalent) dep is gone from
      `packages/templates/starter/package.json`, (c) `apps/site/`
      mirrors both removals. _(Covers: S4, S5, templates-perf I4.)_
- [ ] **T12. Apply the templates-perf spec delta.** The DROP-branch
      delta at `openspec/changes/migrate-starter-template-to-tailwind-css/specs/templates-perf/spec.md`
      is already written: it removes the Beasties requirement + I4
      audit row. No edit needed unless the implementer discovers a
      consistency issue between the delta and the code state.
      _(Covers: S5, templates-perf I4, I5.)_
- [ ] **T13. Drop the layered-CSS audit body.** Edit
      `scripts/audit/tokens-only.mjs` so the `--layered` flag becomes a
      deprecated no-op (accept the flag; print a one-line "deprecated"
      notice on stderr; exit 0). Do the same in `scripts/perf/run.mjs`
      for the `--critical-css` flag, consistent with the templates-perf
      spec delta. Do not delete the flag entries — older change
      `design.md` files may still list them in their `pnpm
audit:invariants` / `pnpm perf:budget` invocations.
      _(Covers: S2, templates-css-tokens I4.)_

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
      Beasties removal in one sentence (DROP by policy — Tailwind v4 + `inlineStylesheets: 'always'` removes Beasties' remaining
      surface area). _(Covers: S10.)_

### Phase 6 — Full verification

- [ ] **T19. Regenerate the playground.** Run `pnpm scaffold:test`
      (without `--full`; the full variant is CI-only). The playground
      tree under `apps/playground/` is regenerated by CI; verify
      locally that the scaffold builds clean.
      _(Covers: S4, templates-perf I1.)_
- [ ] **T20. Final invariant + perf sweep (local).** Run, in order:
      `pnpm format && pnpm typecheck && pnpm test && pnpm audit:invariants --change migrate-starter-template-to-tailwind-css && pnpm perf:budget`.
      Every command must exit 0. `pnpm perf:budget` is advisory locally
      and skips Lighthouse when Chrome/lighthouse aren't available;
      that's expected on the autopilot runner. Attach the perf:budget
      report to the run directory. The Playwright e2e sweep
      (`pnpm test:e2e --project=starter`) requires Chromium and is
      delegated to CI workflow "E2E (templates + apps)"; it already
      passes on this PR.
      _(Covers: S2, S3, S4, S9, templates-css-tokens I1, I2, I3; templates-perf I1, I2, I3, I5.)_
- [ ] **T21. Walk the `new-template` 15-item audit checklist.** The
      skill at `.claude/skills/new-template/SKILL.md` ships a
      template-completeness checklist; the issue body explicitly
      requires walking it after this migration. Mark each item pass /
      fail in the run notes. _(Covers: S8, S9.)_
