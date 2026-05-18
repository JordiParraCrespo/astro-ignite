# Tasks: add-e2e-testing-to-all-templates-and-app

Order matters: infrastructure (T1–T5) lands first so every subsequent
task can iterate locally with `pnpm test:e2e --project=<one>`; the
shared helpers (T6–T9) precede target-specific specs (T10–T16); CI
(T17) and docs (T18–T19) close the change.

- [x] **T1.** Add `@playwright/test` to the workspace root
      `package.json` devDependencies (and add `@types/node` if not
      already inherited from a template). Add the `test:e2e` script:
      `"test:e2e": "playwright test"`. Pin the Playwright version so
      the CI cache key in T17 is stable. Covers **S1**.

- [x] **T2.** Add `tests` to `pnpm-workspace.yaml`'s `packages:` list
      only if the implementer chooses to expose `tests/e2e/` as a
      pnpm-workspace package (optional). Otherwise leave
      `pnpm-workspace.yaml` untouched. Document the choice in the
      run's impl log. Covers **S1** (resolution of `@playwright/test`).

- [x] **T3.** Create `tests/e2e/tsconfig.json` that extends the root
      `tsconfig` (or `apps/site`'s) for Astro / Node typings and sets
      `include: ['**/*.ts']`. Confirm `pnpm typecheck` still exits 0.
      Covers **S20**.

- [x] **T4.** Add a Playwright report / `test-results/` ignore entry
      to `.gitignore` (e.g. `tests/e2e/test-results/`,
      `tests/e2e/playwright-report/`) and a matching glob to
      `.prettierignore` so the JSON / HTML reports do not get
      reformatted. Covers **S20**.

- [x] **T5.** Create `playwright.config.ts` at the workspace root. The
      config defines one `projects[]` entry per target, each with its
      own `testDir`, `cwd`, `webServer`, and `use.baseURL`. Targets:
      `starter`, `docs-template`, `docs-template-built`, `site`,
      `docs-app`, `playground`. The `playground` project's `webServer`
      uses `astro preview` of the prebuilt `apps/playground/dist` and
      is skipped unless `PLAYWRIGHT_PLAYGROUND_READY=1` is set (CI
      flips this after `pnpm scaffold:test --full`). Default reporter:
      `[['list'], ['html', { open: 'never', outputFolder:
'tests/e2e/playwright-report' }]]`. Covers **S1**, **S2**.

- [x] **T6.** Build `tests/e2e/shared/console.ts` —
      `captureConsoleErrors(page)` returns an object that subscribes
      to `page.on('console', ...)` and `page.on('pageerror', ...)`,
      filters via a documented allow-list (favicon 404, `astro:fonts`
      preload hints in dev, the well-known Vite client warnings), and
      exposes `assertNone()` that fails the test with the captured
      log. Covers **S2**.

- [x] **T7.** Build `tests/e2e/shared/theme.ts` (S5),
      `tests/e2e/shared/consent.ts` (S8, S9), and
      `tests/e2e/shared/locales.ts` (S6, S7). Each helper exports the
      signatures listed in `design.md > New signatures`. Covers
      **S5**, **S6**, **S7**, **S8**, **S9**.

- [x] **T8.** Build `tests/e2e/shared/email.ts` and decide between
      `MOCK_EMAIL=1` env-gated transport vs Playwright `page.route`
      blocking of `api.resend.com`. Document the choice and the
      rationale at the top of the file and in the run's impl log.
      Covers **S11**.

- [x] **T9.** Build `tests/e2e/shared/targets.ts` — the canonical
      list of projects, their `cwd`, their `webServer`, and which
      `common/` specs each project includes (`playground` includes
      only `homepage` and `not-found`; the rest include the full
      set). Imported by `playwright.config.ts`. Covers **S1**.

- [x] **T10.** Write the parametrised common specs under
      `tests/e2e/common/`:
      `homepage.spec.ts` (S2, S4 partial),
      `nav.spec.ts` (S3, S4),
      `theme-toggle.spec.ts` (S5),
      `locale-switcher.spec.ts` (S6, S7),
      `consent.spec.ts` (S8, S9),
      `not-found.spec.ts` (S10).
      Each spec uses `test.describe.parallel` and reads target metadata
      from `tests/e2e/shared/targets.ts` so the same spec body runs
      across every project that opts into it. Tags each spec with
      Playwright `@grep`-friendly markers (`@nav`, `@theme`,
      `@i18n`, `@consent-pregate`, `@consent-postgate`) so
      `pnpm audit:invariants --change ...` can shell out per
      invariant. Covers **S2–S10**.

- [x] **T11.** Write the starter-specific specs under
      `tests/e2e/starter/`:
      `contact.spec.ts` (S11),
      `blog.spec.ts` (S12).
      Covers **S11**, **S12**.

- [x] **T12.** Write the docs-template-specific specs under
      `tests/e2e/docs-template/`:
      `sidebar.spec.ts` (S13),
      `mdx.spec.ts` (S14),
      `search.spec.ts` (S15 — split into a `dev` sub-test that asserts
      the dialog opens with the prod-only hint, and a `built` sub-test
      that only runs under the `docs-template-built` project).
      Covers **S13**, **S14**, **S15**.

- [x] **T13.** Write the app-level specs at `tests/e2e/site/` and
      `tests/e2e/docs-app/`. These primarily extend `common/` with any
      site-specific or docs-app-specific spec (e.g. landing-page
      blocks, RSS link). Keep additions minimal — the apps inherit
      every locked-practice scenario from `common/`. Covers **S2–S10**
      for the apps.

- [x] **T14.** Write `tests/e2e/playground/smoke.spec.ts` — homepage + 404 + no console errors, gated behind
      `PLAYWRIGHT_PLAYGROUND_READY=1`. Covers **S16**.

- [x] **T15.** Implement the test-only `if (process.env.SITE_E2E ===
'1')` branches required by the locale and email scenarios. The
      diff stays inside `tests/e2e/` _only_ if the implementer picks
      the pure `page.route` approach for both. If the env-gated
      template branch approach is picked instead, the template's
      `astro.config.mjs` (and optionally `src/lib/email/index.ts`)
      gets a guarded branch — see `design.md > Templates require zero
behaviour change`. The change to those files MUST be confined
      to a single `if (process.env.SITE_E2E === '1') { ... }` block
      with a comment pointing at `tests/e2e/AGENTS.md`. Verify the
      production build path is byte-identical by running
      `pnpm --filter @astro-ignite/template-starter build` with and
      without the var and diffing `dist/`. Covers **S6**, **S11**.

- [~] **T16.** Boot every project locally and confirm green:
  `pnpm test:e2e --project=starter`,
  `pnpm test:e2e --project=docs-template`,
  `pnpm test:e2e --project=docs-template-built`,
  `pnpm test:e2e --project=site`,
  `pnpm test:e2e --project=docs-app`,
  and a full `pnpm test:e2e` once. Capture the full run under
  `runs/<ts>/e2e.txt`. Covers **S2–S15**, **S18**.

- [x] **T17.** Add the CI integration described in `design.md > CI
integration`: - New `e2e` job in `.github/workflows/ci.yml` (cached
      Playwright browser install, runs every project except
      `playground`). - Extra step in the existing `e2e-scaffold` job's `--pm=pnpm`
      matrix slot that runs `pnpm test:e2e --project=playground`
      with `PLAYWRIGHT_PLAYGROUND_READY=1` after
      `scripts/scaffold-test.mjs --full` succeeds. - HTML report uploaded as a workflow artifact on failure.
      Covers **S17**.

- [x] **T18.** Document the workflow: - NEW `tests/e2e/AGENTS.md` — directory layout, how to add a
      spec, the env-var contract for `SITE_E2E` / `MOCK_EMAIL` /
      `PLAYWRIGHT_PLAYGROUND_READY`, how to debug locally
      (`PWDEBUG=1`, `pnpm exec playwright test --ui`). - MOD root `AGENTS.md` (and the `CLAUDE.md` symlink) — under
      "Common commands" add `pnpm test:e2e`; under a new section
      "End-to-end tests" point at `tests/e2e/AGENTS.md`. - MOD `packages/templates/starter/AGENTS.md`,
      `packages/templates/docs/AGENTS.md`,
      `apps/site/AGENTS.md`, `apps/docs/AGENTS.md` — one paragraph
      each pointing at `tests/e2e/AGENTS.md` and naming the
      Playwright project for that target. Covers **S19**.

- [x] **T19.** Run `pnpm format`, `pnpm format:check`, `pnpm
typecheck`, `pnpm lint`, and confirm all four exit 0. Covers
      **S20**.

- [x] **T20.** Run `pnpm audit:invariants --change
add-e2e-testing-to-all-templates-and-app` and confirm exit 0.
      The dispatcher will read the audit table in `design.md > Invariants
this change touches` and shell out to each `pnpm test:e2e
--grep ...` command. Capture the run under `runs/<ts>/audit.txt`.
      Covers **S21**.

- [~] **T21.** Run `pnpm perf:budget` (or the equivalent perf gate that
  applies because `capabilities` matches `/^templates-/`) and
  capture the report under `runs/<ts>/perf.txt`. The expected
  delta is zero — no runtime code ships to the templates or apps.
  Covers `design.md > Performance budget applicability`.

- [x] **T22.** Add a changeset (`.changeset/add-e2e-testing-to-all-templates-and-app.md`)
      summarising the new e2e suite. Mark all publishable packages as
      `patch` if any template / app file changed even via env-gated
      branch (T15); otherwise mark the changeset as a workspace-only
      / "none" entry. Required by
      `feature_list.json > rules.require_changeset_to_close`.

- [x] **T23.** Final sweep — `git status` is clean, `git diff
--name-only main` lists only the paths in `design.md > Files
touched`, and `scripts/committer --design
openspec/changes/add-e2e-testing-to-all-templates-and-app/design.md
"<msg>" <paths>` stages successfully for each commit.
