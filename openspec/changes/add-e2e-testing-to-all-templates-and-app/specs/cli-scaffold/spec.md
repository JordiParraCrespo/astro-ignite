# Delta: cli-scaffold — add-e2e-testing-to-all-templates-and-app

The long-lived `cli-scaffold` spec lists invariants **I1–I4** covering
dep-stripping, the `@astrojs/node@^9` adapter pin, the no-import-from-
`astro-ignite` rule, and package-manager detection. The
`scripts/scaffold-test.mjs` script already exercises the
"scaffold + assert files + (optionally) install + check + build" path
in CI. It does not, however, _drive_ the scaffolded site in a browser
— a successful build can still ship a broken cookie banner, theme
toggle, or navigation. This change does not modify I1–I4. It adds a
post-scaffold end-to-end smoke against `apps/playground/`, and files
**I5** + **I6** so the smoke and the `pnpm test:e2e` entry point are
first-class workspace invariants.

## ADDED Requirements

### Requirement: Scaffolded playground passes an e2e smoke

After `pnpm scaffold:test --full` has regenerated `apps/playground/`
and built it, an end-to-end smoke SHALL boot the built site via
`astro preview` and assert:

1. `/` returns 200, renders an `<h1>`, and emits no `page.on(
'console', 'error')` events outside the documented allow-list,
2. `/this-route-does-not-exist` returns 404 and renders the
   template's `404.astro`,
3. No request leaves the runner to any external host (analytics, email
   provider, font CDN — all blocked at the `page.route` layer).

The smoke is intentionally shallow. The canonical
template (`packages/templates/starter/`) is covered by deeper specs
elsewhere; the playground exists to catch regressions in
`scaffold.ts`'s substitution / dep-stripping path that only surface in
a fully assembled output.

#### Scenario: Smoke against the freshly scaffolded playground

- **GIVEN** CI has just run `node scripts/scaffold-test.mjs --full`
  and the playground's `dist/` exists
- **WHEN** Playwright boots the `playground` project (gated on
  `PLAYWRIGHT_PLAYGROUND_READY=1`)
- **THEN** the smoke spec passes for `/` and the unknown-route case.

### Requirement: Workspace exposes `pnpm test:e2e`

The workspace root `package.json` SHALL expose a `test:e2e` script
that:

1. Resolves to a Playwright invocation that includes at least the
   `starter`, `docs-template`, `site`, `docs-app`, and (under
   `PLAYWRIGHT_PLAYGROUND_READY=1`) `playground` projects,
2. Can be invoked as `pnpm test:e2e --project=<name>` to run one
   target,
3. Can be invoked as `pnpm test:e2e --list` to enumerate every spec
   without running anything (used as a cheap structural audit).

#### Scenario: Listing the suite

- **GIVEN** the workspace at HEAD
- **WHEN** `pnpm test:e2e --list` runs
- **THEN** the command exits 0 and the output includes at least one
  spec from every non-playground project.

## MODIFIED Requirements

_None._ The CLI's runtime contracts (dep-stripping, adapter pin,
no-imports rule, pm detection) are unchanged in scope and audit.

## REMOVED Requirements

_None._

## Invariants delta

| Id  | Statement                                                         | Audit                                |
| --- | ----------------------------------------------------------------- | ------------------------------------ |
| I5  | Scaffolded playground passes an e2e smoke (homepage + 404)        | `pnpm test:e2e --project=playground` |
| I6  | Workspace exposes `pnpm test:e2e` that lists at least one project | `pnpm test:e2e --list`               |

I5 is gated on `PLAYWRIGHT_PLAYGROUND_READY=1`. Locally, the gate is
off — running `pnpm test:e2e` without setting the env var skips the
playground project, which is the right ergonomics for a contributor
who has not just run `scaffold:test --full`. CI flips the gate after
the scaffold step succeeds, so the smoke is mandatory in PR runs.

## Notes

- This delta deliberately stays away from declaring "the CLI's
  scaffolded output SHALL pass an e2e suite as deep as the source
  template". That would make the playground a second canonical
  template, which it isn't — `apps/playground/` is a CI-regenerated
  smoke target. The deeper coverage lives at
  `packages/templates/starter/` and is exercised by the `starter`
  Playwright project.
- The new workspace-level `pnpm test:e2e` script is the entry point;
  the per-project breakdown (which spec runs where, which spec is
  tagged with which `@grep` marker) lives in `playwright.config.ts`
  and `tests/e2e/shared/targets.ts`. The spec deliberately does not
  pin those file paths because they are implementation choices owned
  by the implementer's task list.
