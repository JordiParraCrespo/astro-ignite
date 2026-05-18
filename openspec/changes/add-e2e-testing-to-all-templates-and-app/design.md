# Design: add-e2e-testing-to-all-templates-and-app

## Architecture summary

A single workspace-root Playwright install, one `playwright.config.ts`,
one `tests/e2e/` tree. Targets are modelled as Playwright **projects**.
Each project sets its own `testDir` and its own `webServer` (or list of
webservers) so a `pnpm test:e2e` invocation can boot only the targets
the developer cares about, in parallel where independent.

```
playwright.config.ts            # one config, projects array per target
tests/e2e/
  AGENTS.md                     # contributor guide
  tsconfig.json                 # isolated TS project for tests
  shared/                       # console allow-list, theme + locale +
                                # consent helpers, network mocks
  common/                       # parametrised specs run by every
                                # non-playground project
  starter/                      # template-starter specifics
  docs-template/                # template-docs specifics (incl. built)
  site/                         # apps/site app-level specs
  docs-app/                     # apps/docs app-level specs
  playground/                   # CI smoke after scaffold:test
```

Each non-playground project's `webServer` runs the target's existing
`astro dev` (or `astro preview` for the docs-template-built project)
with `--mode test` and a small set of env vars (`SITE_E2E_LOCALES`,
`MOCK_EMAIL`, etc.) that the templates already gate on (or that this
change introduces _only_ as test-env hooks — see "Templates require
zero behaviour change").

## Files touched

- NEW `playwright.config.ts`
- NEW `tests/e2e/`
- NEW `.changeset/add-e2e-testing-to-all-templates-and-app.md`
- MOD `package.json`
- MOD `pnpm-lock.yaml`
- MOD `pnpm-workspace.yaml`
- MOD `.gitignore`
- MOD `.prettierignore`
- MOD `.github/workflows/ci.yml`
- MOD `AGENTS.md`
- MOD `CLAUDE.md`
- MOD `packages/templates/starter/AGENTS.md`
- MOD `packages/templates/starter/CLAUDE.md`
- MOD `packages/templates/docs/AGENTS.md`
- MOD `packages/templates/docs/CLAUDE.md`
- MOD `apps/site/AGENTS.md`
- MOD `apps/site/CLAUDE.md`
- MOD `apps/docs/AGENTS.md`
- MOD `apps/docs/CLAUDE.md`
- MOD `openspec/changes/add-e2e-testing-to-all-templates-and-app/`
- MOD `openspec/progress/current.md`

Notes for the committer:

- `tests/e2e/` is listed as a single directory entry. The committer's
  `--design` validator accepts paths whose prefix matches a directory
  entry, so every file the implementer adds underneath (specs, helpers,
  AGENTS.md, tsconfig.json, fixtures) is in scope without enumerating
  them here.
- `packages/templates/*/CLAUDE.md` and `apps/*/CLAUDE.md` are symlinks
  to the sibling `AGENTS.md`. Editing the `AGENTS.md` is the canonical
  edit; both names appear so the committer's filename check passes
  whichever filename git diff reports.
- No file under `packages/templates/*/src/`, `apps/*/src/`,
  `packages/registry/`, `packages/create-astro-ignite/src/`, or
  `scripts/audit/` is touched. The change is purely additive
  infrastructure plus documentation.
- `apps/playground/**` is NOT touched directly — the committer already
  forbids that path, and the playground project boots whatever
  `pnpm scaffold:test --full` produced.

## New signatures

Test-only helpers exported from `tests/e2e/shared/`:

- `tests/e2e/shared/console.ts`
  ```ts
  export type ConsoleErrorEntry = { type: string; text: string; url: string };
  export function captureConsoleErrors(page: Page): {
    entries: ConsoleErrorEntry[];
    assertNone(): void;
  };
  ```
- `tests/e2e/shared/theme.ts`
  ```ts
  export async function clickThemeToggle(page: Page): Promise<'light' | 'dark'>;
  export async function readPersistedTheme(page: Page): Promise<string | null>;
  ```
- `tests/e2e/shared/consent.ts`
  ```ts
  export async function clearConsent(context: BrowserContext): Promise<void>;
  export async function acceptConsent(page: Page): Promise<void>;
  export function trackAnalyticsHits(
    page: Page,
    hostPattern: string | RegExp
  ): {
    hits: () => number;
  };
  ```
- `tests/e2e/shared/locales.ts`
  ```ts
  export async function switchLocale(page: Page, target: string): Promise<void>;
  export const TWO_LOCALE_ENV: Record<string, string>;
  ```
- `tests/e2e/shared/email.ts`
  ```ts
  export const MOCK_EMAIL_ENV: Record<string, string>;
  export async function blockResend(page: Page): Promise<{ hits: () => number }>;
  ```
- `tests/e2e/shared/targets.ts` — the canonical list of Playwright
  projects + their `cwd`, `webServer`, and the slice of common specs
  they include. Imported by `playwright.config.ts` to keep the config
  declarative.

The CLI's exported API does not change. Nothing in
`packages/create-astro-ignite/src/*` or `packages/registry/*` is
modified. Template `astro.config.mjs` files _read_ a small number of
new env vars (`SITE_E2E_LOCALES`, `MOCK_EMAIL`) but only inside an
explicit `if (process.env.SITE_E2E === '1')` block so the production
build path is byte-identical. See "Templates require zero behaviour
change" below.

## Templates require zero behaviour change

The hard rule is that the implementer SHALL NOT change template runtime
behaviour. Two specific patterns are allowed because they are observably
no-ops outside the test environment:

1. **Test-only env-gated branches in `astro.config.mjs`.** The starter
   and docs templates may grow a leading
   `if (process.env.SITE_E2E === '1') { /* add 'es' to locales */ }`
   block. Outside `SITE_E2E=1`, the file behaves exactly as before. The
   audit `scripts/audit/i18n-parallels.mjs --config` already only
   checks `siteConfig` (not Astro config), so this does not regress
   `templates-i18n` I4.

2. **Test-only env-gated email transport in `src/lib/email/index.ts`.**
   If `MOCK_EMAIL=1`, `sendContactEmail` no-ops and resolves to
   `{ ok: true }` without importing `resend`. Outside that env var the
   file is unchanged. This is the minimal viable mock — the
   implementer may instead choose pure Playwright `page.route`
   interception of `api.resend.com`; both are acceptable, the
   implementer documents which they picked in
   `runs/<ts>/impl_<name>.md`.

If a test exposes a real bug in a template / app, the implementer
opens a separate change rather than fixing it under this slug. The e2e
suite is the carrier, not the carrier _and_ the patch.

## CI integration

`.github/workflows/ci.yml` gains one new top-level job and modifies one
existing job:

- **NEW job `e2e`** — depends on nothing, runs in parallel with
  `lint-typecheck`, `test`, `template-build`, `apps-build`. Steps:
  1. checkout, pnpm setup, node 20
  2. `pnpm install --frozen-lockfile`
  3. `pnpm exec playwright install --with-deps chromium` (cached via
     `actions/cache@v4` keyed on `pnpm-lock.yaml` and a
     `PLAYWRIGHT_VERSION` constant pulled from the root
     `package.json`)
  4. `pnpm test:e2e --project=starter --project=docs-template
--project=site --project=docs-app --project=docs-template-built`
  5. uploads the HTML report on failure (`actions/upload-artifact`)
- **MOD job `e2e-scaffold`** — appends an extra step **only on the
  `--pm=pnpm` matrix entry** that runs
  `pnpm test:e2e --project=playground` after `scripts/scaffold-test.mjs
--full` finishes. The other matrix entries (`npm`, `yarn`, `bun`)
  keep their existing scope — the playground smoke is an e2e
  observation of the canonical `pnpm` flow, not a per-pm gate.

Total CI delta: one new job (~3–5 min on the first cold cache, ~1 min
warm) plus one step in an existing matrix slot.

## Invariants this change touches

The change adds new invariants via `## ADDED Requirements` deltas; it
does not modify or remove any existing invariant. The invariants this
change introduces, and the audit commands `pnpm audit:invariants
--change add-e2e-testing-to-all-templates-and-app` will run, are:

| Id                      | Statement                                                           | Audit                                      |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| templates-i18n I7       | LocaleSwitcher behavior covered by an e2e test                      | `pnpm test:e2e --grep '@i18n'`             |
| templates-i18n I8       | Header / footer internal nav navigates correctly in a live browser  | `pnpm test:e2e --grep '@nav'`              |
| templates-css-tokens I5 | Theme toggle flips `<html>.classList` and persists via localStorage | `pnpm test:e2e --grep '@theme'`            |
| templates-consent I5    | Cookie banner visible pre-consent; analytics endpoint not contacted | `pnpm test:e2e --grep '@consent-pregate'`  |
| templates-consent I6    | Cookie banner accept → consent stored → analytics fires next nav    | `pnpm test:e2e --grep '@consent-postgate'` |
| cli-scaffold I5         | Scaffolded playground passes an e2e smoke (homepage + 404)          | `pnpm test:e2e --project=playground`       |
| cli-scaffold I6         | Workspace exposes `pnpm test:e2e` that lists at least one project   | `pnpm test:e2e --list`                     |

Audit commands (parseable by `scripts/audit/run-all.mjs --change`):

- audit: `pnpm test:e2e --list`

Note: the `--grep` and `--project=playground` audits in the table above
are only meaningful with running dev servers and installed browsers, so
the `audit:invariants` dispatcher runs only the cheap `--list` check.
The full grep-based audits run inside the `e2e` CI job — that is the
canonical pass/fail signal for the behavioural invariants.

The existing audits remain untouched and must continue to pass:

- `node scripts/audit/i18n-parallels.mjs` and its `--strict`,
  `--content`, `--config` variants — unaffected by the change (no
  template page is added or moved).
- `node scripts/audit/internal-links-localized.mjs` — unaffected (no
  internal link is rewritten).
- `node scripts/audit/tokens-only.mjs` and its variants — unaffected
  (no component CSS / class change).
- `node scripts/audit/consent-gated-analytics.mjs` and its `--banner`,
  `--policy`, `--boundary` variants — unaffected.
- `node scripts/audit/cli-dep-stripping.mjs` and its `--adapter`,
  `--no-imports`, `--pm` variants — unaffected (no CLI behaviour
  change).
- `node scripts/audit/jsonld-graph.mjs` — unaffected.
- `node scripts/audit/no-react-in-atoms.mjs` — unaffected; e2e specs
  live outside `packages/registry/base/` and the audit's path filter
  already excludes them.
- `node scripts/audit/banner-pipeline.mjs` — unaffected.

If the implementer needs to add new audit scripts for the new
invariants above, they go under `scripts/audit/` _without_ replacing
the `pnpm test:e2e --grep ...` audit command listed in the delta
specs. The grep-based audit is the primary mechanism; a thin wrapper
script may be added if `audit:invariants` ergonomics call for it, but
its job is to shell out to the same `pnpm test:e2e` invocation.

## Performance budget applicability

The feature's `capabilities` array contains entries matching
`/^templates-/`, so the harness rule
`require_perf_budget_to_close_when: change.capabilities matches /^(templates|registry)-/`
fires. The implementer SHALL run `pnpm perf:budget` and capture the
report under `openspec/changes/add-e2e-testing-to-all-templates-and-app/runs/<ts>/perf.txt`.

In practice this change ships **no runtime code** to any template or
app — every new file lives under `tests/e2e/` or is a workspace-level
config. The only template files that may grow a test-only `if
(process.env.SITE_E2E === '1')` branch are `astro.config.mjs` and
optionally `src/lib/email/index.ts`; both branches are dead under the
production build path, so:

- LCP / INP / CLS: identical to baseline.
- Total transfer (compressed home): identical to baseline (the env-var
  branch in `astro.config.mjs` is evaluated at build time; under
  `SITE_E2E !== '1'` the bundle is byte-for-byte equal to today).
- New runtime deps: **zero**. Playwright and its browsers are
  workspace-level devDependencies — they are stripped by `pnpm
install --prod` and never reach a scaffolded user. The reviewer
  should confirm that `packages/templates/*/package.json` is unchanged
  by this PR.

The "no new runtime dep without justification" rule (`templates-perf`
Requirement 2) does not fire — no template's `package.json` adds a
dependency. The justification rule still applies should a follow-up
change pull a deeper email mocker, locale fixture loader, etc. into a
template; not in scope here.

## Rejected alternatives

**A. Use vitest + happy-dom / jsdom for "e2e".**
Rejected: the things the issue asks for (theme toggle reads
`localStorage`, locale switcher navigates, contact form posts via
Astro Actions and shows a server-rendered success state, pagefind
bundle loads from `/pagefind/`) require a real browser. Happy-dom
would silently swallow LocaleSwitcher / pagefind / Resend interactions,
producing tests that pass while the user-visible flow breaks. That is
exactly what `pnpm scaffold:test` does today; adding more of the same
solves nothing.

**B. Cypress instead of Playwright.**
Rejected for two reasons. (1) Playwright is built on the same
chromium-for-testing stack we already install for the banner pipeline
(`apps/site/scripts/banners/generate.mjs` uses headless Chrome), so the
CI image stays simpler. (2) Playwright's `webServer` config makes it
trivial to model one project per target with its own `cwd`; Cypress
requires a wrapper script per target. The size of the suite (5 targets,
~20 specs) does not justify the extra plumbing.

**C. One Playwright project for everything, multiplexed via env.**
Rejected: each target has its own dev-server port, cwd, and (for the
docs-template-built project) build prerequisite. Modelling them as
separate Playwright projects lets us run them in parallel and skip
individual targets with `--project=...`. A single-project suite would
require a custom orchestrator, which is the wrapper we are trying to
avoid.

**D. Visual regression / screenshot diffs.**
Out of scope (see proposal). Listed here so the reviewer knows it was
considered and intentionally deferred — pixel-perfect screenshots are
brittle without a baseline-management pipeline, and the locked
practices we care about (i18n routing, consent gating, theme flipping)
are behavioural, not visual. We can layer screenshots on later without
disturbing this change.

**E. Run e2e against the published `apps/playground` only.**
Rejected: the issue explicitly calls out templates _and_ apps. Tests
must run against the template source so failures point at the source
of truth, not at the scaffolded copy. The playground smoke is in
addition to, not instead of, per-template projects.

**F. Bake the locale fixture (`['en', 'es']`) into the starter
permanently to avoid env-gating.**
Rejected: the starter's user-visible default is `siteConfig.locales =
['en']` and the locked practices invariant (templates-i18n I4) requires
that default. Changing it ships a different product to every CLI
user; we instead gate the second locale behind `SITE_E2E=1` so the
production build path is unchanged.
