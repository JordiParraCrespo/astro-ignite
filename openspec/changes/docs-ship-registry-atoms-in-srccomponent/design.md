# Design: docs-ship-registry-atoms-in-srccomponent

## Files touched

The `committer --design` allow-list parses backtick-wrapped paths under
this section through the next H2. Prefix-match semantics apply: an
entry like `packages/astro-ignite/templates/docs/` matches every file
under it. All paths are relative to the repository root.

### Atoms (template — new files mirroring the registry)

Each new file is a byte copy of the corresponding registry source. The
registry's `files[].target` paths (already shipped today) define the
flattening rule for compound families (`base/card/card-content.astro` →
`src/components/ui/card-content.astro`). The starter mirror at
`packages/templates/starter/src/components/ui/<filename>` is the same
byte sequence (T1 will re-verify with `diff -q`); for paste-and-go
purposes the implementer may copy from either the registry source or
the starter mirror.

Top-level singletons (13 files):

- NEW `packages/templates/docs/src/components/ui/alert.astro`
- NEW `packages/templates/docs/src/components/ui/avatar.astro`
- NEW `packages/templates/docs/src/components/ui/badge.astro`
- NEW `packages/templates/docs/src/components/ui/button.astro`
- NEW `packages/templates/docs/src/components/ui/input.astro`
- NEW `packages/templates/docs/src/components/ui/kbd.astro`
- NEW `packages/templates/docs/src/components/ui/label.astro`
- NEW `packages/templates/docs/src/components/ui/link.astro`
- NEW `packages/templates/docs/src/components/ui/separator.astro`
- NEW `packages/templates/docs/src/components/ui/skeleton.astro`
- NEW `packages/templates/docs/src/components/ui/textarea.astro`
- NEW `packages/templates/docs/src/components/ui/toaster.astro`
- NEW `packages/templates/docs/src/components/ui/tooltip.astro`

Compound family — accordion (2 files):

- NEW `packages/templates/docs/src/components/ui/accordion.astro`
- NEW `packages/templates/docs/src/components/ui/accordion-item.astro`

Compound family — card (6 files):

- NEW `packages/templates/docs/src/components/ui/card.astro`
- NEW `packages/templates/docs/src/components/ui/card-content.astro`
- NEW `packages/templates/docs/src/components/ui/card-description.astro`
- NEW `packages/templates/docs/src/components/ui/card-footer.astro`
- NEW `packages/templates/docs/src/components/ui/card-header.astro`
- NEW `packages/templates/docs/src/components/ui/card-title.astro`

Compound family — dialog (3 files):

- NEW `packages/templates/docs/src/components/ui/dialog.astro`
- NEW `packages/templates/docs/src/components/ui/dialog-description.astro`
- NEW `packages/templates/docs/src/components/ui/dialog-title.astro`

Compound family — dropdown-menu (2 files):

- NEW `packages/templates/docs/src/components/ui/dropdown-menu.astro`
- NEW `packages/templates/docs/src/components/ui/dropdown-menu-item.astro`

Compound family — tabs (4 files):

- NEW `packages/templates/docs/src/components/ui/tabs.astro`
- NEW `packages/templates/docs/src/components/ui/tabs-content.astro`
- NEW `packages/templates/docs/src/components/ui/tabs-list.astro`
- NEW `packages/templates/docs/src/components/ui/tabs-trigger.astro`

Total: 30 new `.astro` files. `text.astro` is already shipped (PR #40)
and is not modified.

### Lib helper (template — new file)

- NEW `packages/templates/docs/src/lib/toast.ts` — byte copy of
  `packages/registry/lib/toast.ts`. Required because `toaster.astro`
  dispatches against this helper via `import { ... } from
'@/lib/toast'`. The starter mirror at
  `packages/templates/starter/src/lib/toast.ts` is the reference copy
  (T1 re-verifies the diff). `src/lib/cn.ts` already exists in the
  docs template (added with `text.astro` in PR #40) and is not
  modified.

### Apps mirror (`apps/docs/`)

The proposal-time survey shows `apps/docs/src/components/ui/` already
contains 30 atoms byte-equivalent to the registry source, and
`apps/docs/src/lib/toast.ts` already exists byte-equivalent to
`packages/registry/lib/toast.ts`. The default expectation is **no
edit** under `apps/docs/`. The paths below are listed only so the
committer accepts a defensive realignment edit if T1 surfaces a
divergence the static survey missed; if T1 confirms parity, the
listing is dead allow-list and no apps/docs file is staged.

- MOD `apps/docs/src/components/ui/` — only if T1 surfaces a
  divergence from the new docs-template atom set; realign the apps
  mirror to the template (the canonical source of "what the docs
  template ships pre-installed") so apps/docs continues to be a true
  mirror per `CLAUDE.md`'s apps-mirror-templates rule.
- MOD `apps/docs/src/lib/toast.ts` — same conditional realignment.

### CLI template cache (refreshed wholesale by the prepack script)

`packages/astro-ignite/templates/docs/` is a publish-time cache of the
docs template. The cache is checked into git so a developer cloning the
repo can `pnpm pack` reproducibly without first running the prepack
script by hand. The script
`packages/astro-ignite/scripts/copy-templates.mjs` regenerates the
cache wholesale from `packages/templates/docs/`, with these documented
transformations:

- skip `node_modules`, `dist`, `.astro`, `.turbo`, `.cache`, `.vercel`,
  `.netlify`, `.wrangler` (the `SKIP` set in the script);
- rename a top-level `_template.config.ts` etc. — the script keeps the
  `_gitignore` → `.gitignore` rename; everything else is a verbatim
  copy with `verbatimSymlinks: true`.

Running the script as part of this change rewrites the cache. The
diff against `main` will include every newly-added atom file plus the
new `lib/toast.ts`, AND any unrelated drift the cache has accumulated
since its last regeneration (`packages/astro-ignite/templates/docs/src/
lib/cn.ts` is missing at proposal time, for example — that file landed
in `packages/templates/docs/src/lib/cn.ts` with PR #40 but was never
copied into the cache; the regeneration picks it up alongside the
new atoms). The committer accepts that drift under the single
prefix-match entry below.

- MOD `packages/astro-ignite/templates/docs/` — every file under this
  directory is byte-canonically refreshed by running
  `node packages/astro-ignite/scripts/copy-templates.mjs` after the
  template source edits are complete. Do not hand-edit; the script
  regenerates the tree. The committer parser does prefix matching on
  this entry, so files under this directory match. The script's
  documented transformations (`_gitignore` ↔ `.gitignore`, `SKIP` set
  for build artefacts) are the only differences vs `packages/
templates/docs/` after the run.

### Harness paperwork

The implementer touches these as part of the protocol (run log, audit
captures, tasks/progress markers, changeset). The committer's
`--design` validator parses them out of this section.

- MOD `openspec/changes/docs-ship-registry-atoms-in-srccomponent/`
  (covers `tasks.md` close-out plus everything written under
  `runs/<ts>/`: `inventory.md`, `impl.md`, `audit.md`, `perf.md`).
- MOD `openspec/progress/current.md` — pointer to the active run dir
  (implementer protocol step 1).
- NEW `.changeset/` — patch-level changeset required by
  `feature_list.json` rule `require_changeset_to_close`. Pick a
  parallel name to the starter precedent's
  `.changeset/starter-text-atom-typography.md`: e.g.
  `.changeset/docs-atom-set-parity.md` and scope it to `astro-ignite`
  and `create-astro-ignite` (the docs template is `ignored` in
  `.changeset/config.json` the same way the starter is, so the version
  bump rides on the parent packages).

That is the full set. No new audit script. No file deletions. No
modifications to `packages/registry/**` (including `registry.json`).
No modifications to `packages/templates/starter/**`.

## New signatures

No new public exports. Every atom file is a byte mirror of the
registry source; the typed `Props` shapes and named exports already
defined in the registry remain authoritative. No registry manifest
change is required (existing `files[].target` paths already resolve
into `src/components/ui/<name>.astro`).

## CLI template cache

Why refresh the cache as part of this change vs trust the `prepack`
hook? Two reasons.

1. The cache **is** checked into git (78 tracked files under
   `packages/astro-ignite/templates/docs/` at proposal time). The
   tracked snapshot is the developer-visible artefact: tooling like
   `pnpm scaffold:test`, the autopilot harness, and any consumer who
   does `pnpm pack` without running the prepack hook (e.g. doing a
   pre-publish dry run) reads from the tracked cache. Leaving the
   tracked cache stale ships an incomplete scaffold whenever the
   `prepack` hook is bypassed.
2. The acceptance criterion in `feature_list.json` says explicitly:
   "`packages/astro-ignite/templates/docs/` is refreshed via `node
packages/astro-ignite/scripts/copy-templates.mjs` so a fresh `pnpm
pack` would ship the migrated cache." Refreshing the cache as part
   of the change guarantees the property by construction; trusting
   `prepack` defers it to a later moment when CI may or may not run
   the hook.

The script is idempotent: a second invocation on a clean tree produces
no diff. It is safe to run.

## Apps mirror — why it's likely a no-op

At proposal time, the survey shows:

- `apps/docs/src/components/ui/` already contains 30 atoms (every
  starter atom + `text.astro`), byte-equivalent to the registry source.
- `apps/docs/src/lib/toast.ts` exists and is byte-equivalent to
  `packages/registry/lib/toast.ts`.

That is, the scaffolded marketing mirror (`apps/docs`) was kept
up-to-date with the registry independently of the source template
during prior work, so the docs template is the **lagging** side, not
the apps mirror. After this change the docs template will be the
canonical source of "what a fresh scaffold contains" — apps/docs
already matches that canonical state.

T1 will re-verify the apps mirror parity claim with `diff -q`. The
expected outcome is "every file identical → no edit needed under
apps/docs". The realignment edits are listed in § Apps mirror only to
keep the committer's allow-list defensive against a survey miss.

## Invariants this change touches

This change touches two capabilities. Citations are by id from the
matching long-lived spec at `openspec/specs/<capability>/spec.md`.

### `registry-atoms`

- **I1** — "No React / Vue / Svelte / Radix imports in `base/`."
  Audit: `node scripts/audit/no-react-in-atoms.mjs`.
  Status: **preserved**. The audit's scope is `packages/registry/base/`
  and `packages/registry/blocks/` only. This change does not modify
  either tree — it only copies existing atoms (already audit-clean) into
  a template. The atoms shipped under `packages/templates/docs/src/
components/ui/` are byte mirrors of the audited registry source, so
  no framework import can sneak in. The audit's behaviour on the docs
  template is unchanged (it does not walk the template `ui/` tree, by
  design).

- **I2** — "No default exports in atom source files."
  Audit: `node scripts/audit/no-react-in-atoms.mjs --named-only`.
  Status: **preserved**. Same reasoning as I1 — the audit walks
  `packages/registry/base/`, which this change does not touch. The
  byte-mirrored template atoms keep their `.astro` default exports
  (allowed by the audit) and named `Props` exports (verified by the
  diff against the registry source).

- **I3** — "Every atom in `registry.json` has at least `cn` in
  `registryDependencies`."
  Audit: `node scripts/audit/no-react-in-atoms.mjs --registry`.
  Status: **preserved**. `registry.json` is not modified. The
  `registryDependencies` arrays for every atom remain
  `["cn"]` (or `["cn", "label"]` etc. as already declared). No
  dependency edges shift.

- **I4** — "Compound families live in `base/<family>/`."
  Audit: `node scripts/audit/no-react-in-atoms.mjs --family-layout`.
  Status: **preserved**. The audit walks `packages/registry/base/`,
  which this change does not touch. The template-side flattening
  (`base/card/card.astro` → `ui/card.astro`) follows
  `files[].target`, which is the long-standing layout for the starter
  mirror — the audit does not check template trees, by design.

### `templates-perf`

- **I3** — "Total transfer ≤ 150KB compressed (home)."
  Audit: `node scripts/perf/run.mjs --transfer`.
  Status: **preserved**. Atoms that no page imports are not rendered;
  Astro's compiler ships zero bytes for an unused `.astro` file (the
  template-internal file system does not become payload). Adding
  source files to the tree therefore does not affect the rendered
  HTML / CSS / JS for any docs page. The home-page transfer budget is
  unaffected.

- **I5** — "No undeclared runtime dep added since last archive."
  Audit: `node scripts/perf/run.mjs --deps`.
  Status: **preserved**. The atoms' only imports are `@/lib/cn`
  (template-local) and — for `toaster.astro` — `@/lib/toast`
  (template-local, new in this change). No external package is added
  to `packages/templates/docs/package.json` or
  `apps/docs/package.json`. `pnpm install` in either package will
  install the same set as before.

- **I1 / I2** (Lighthouse score / inner page score) and **I4**
  (Beasties critical CSS) are unaffected by this change (no rendered
  output changes), but the perf budget MUST still be run per the
  feature gating rule. See § Performance budget applicability below.

I2 (`global.css` defines `--color-*` tokens) and the
templates-css-tokens audit are not directly touched by this change.
Atoms ship as-is from the registry, which already conforms to
templates-css-tokens; running `node scripts/audit/tokens-only.mjs`
against the modified tree is therefore a guard that the new atom files
introduced no token regressions (none expected because they are byte
mirrors of registry source).

Audit commands the implementer MUST run (parseable by
`scripts/audit/run-all.mjs --change`):

- audit: `node scripts/audit/no-react-in-atoms.mjs`
- audit: `node scripts/audit/no-react-in-atoms.mjs --named-only --registry --family-layout`
- audit: `node scripts/audit/tokens-only.mjs`
- audit: `node scripts/perf/run.mjs --deps`

The implementer MUST run
`pnpm audit:invariants --change docs-ship-registry-atoms-in-srccomponent`
and capture the output under
`openspec/changes/docs-ship-registry-atoms-in-srccomponent/runs/<ts>/audit.md`.

No new invariant is proposed. The "docs template ships the full atom
set" guarantee enumerated by the issue is a one-time alignment, not a
long-lived audited rule — the starter precedent (atoms shipped
pre-installed under `src/components/ui/`) is already in place and is
not encoded as an invariant either.

## Performance budget applicability

The feature's capabilities (`registry-atoms`, `templates-perf`) both
match `/^(templates|registry)-/`, so the `feature_list.json` rule
`require_perf_budget_to_close_when` applies. The implementer MUST run
the perf budget check (typically `pnpm perf:budget`, or whatever the
harness dispatches) and capture the report under
`openspec/changes/docs-ship-registry-atoms-in-srccomponent/runs/<ts>/perf.md`.

Expected perf shape: **no change from baseline.** Adding unused
`.astro` source files to a template does not affect:

- **LCP**: no rendered output changes. The atoms are not yet imported
  by any docs-template page or layout. Astro tree-shakes; a file that
  no entry point references contributes zero bytes to the build.
- **CLS**: same reasoning. No layout shifts can come from a component
  the page never renders.
- **TBT / INP**: no new JS is bundled. The atoms compile to inert
  source until something imports them; nothing does, in this change.
- **Total transfer (home)**: unchanged. CSS / HTML / JS payload is
  identical pre/post.
- **Bundle size on disk** (developer-visible only): the `dist/`
  directory size is unchanged because tree-shaking elides unused
  components.

If, contrary to this analysis, the perf budget regresses on a
specific metric, the most likely cause is the prepack script picking
up an unrelated drift in the CLI cache (e.g. a stale page file). In
that case the implementer should:

1. Confirm the regression via `pnpm perf:budget --page <route>` for
   the specific page;
2. Diff the cache against the source to find the unrelated drift;
3. Either land the drift in this change (extend the design.md allow-list
   under `packages/astro-ignite/templates/docs/`) or revert the cache
   refresh and document the limitation in `runs/<ts>/perf.md`.

The starter precedent's perf-run documented an environmental caveat
when the sandbox lacked a Lighthouse / Chrome binary. Per
`wire-local-lighthouse-against-a-preview` (PR #48), the local gate
now degrades gracefully with a "skipped — chrome not installed; run
scripts/doctor/install-chrome.mjs" message and exits 0; CI Lighthouse
(`Lighthouse CI (mobile)`) remains the authoritative budget gate.

## Rejected alternatives

**Add `copy-button.astro` to the docs template too.** The registry
source ships `packages/registry/base/copy-button.astro`, but the
starter does **not** mirror it into
`packages/templates/starter/src/components/ui/`. Two scopes are
distinct:

1. "What the registry _can install_ via the shadcn-style CLI" — the
   full `base/` set, including `copy-button.astro`.
2. "What a template _ships pre-installed_" — a curated subset that
   the template's own pages already exercise; today the starter ships
   the 30-atom subset enumerated in the issue.

The acceptance criterion says "every atom that exists in the **starter**
template's `ui/` directory has a byte-equivalent file in the docs
template's `ui/`". Mirroring the starter set means we do not ship
`copy-button.astro` in the docs template either. Whether to expand
the starter's pre-installed set to include `copy-button.astro` (and
then mirror that growth into the docs template) is a separate issue.

**Skip `lib/toast.ts` and rely on the user to add it post-scaffold.**
Rejected because `toaster.astro` imports `@/lib/toast`. Shipping
`toaster.astro` without `lib/toast.ts` would leave a broken import in
a scaffolded site — `pnpm typecheck` would fail immediately. The
starter ships the helper alongside the atom for the same reason; the
docs template must do the same to be consistent.

**Mirror `packages/registry/lib/clipboard.ts` too.** Rejected because
no atom in the starter's pre-installed set imports
`clipboard.ts`; it is the dependency of `copy-button.astro`, which is
out of scope (see above). Shipping a `lib/clipboard.ts` no consumer
imports is dead code.

**Drop the CLI template cache refresh (let `prepack` handle it).**
Rejected for the reasons captured in § CLI template cache: the cache
is tracked in git, and the acceptance criterion in
`feature_list.json` requires it be refreshed as part of the change.
The reviewer would `CHANGES_REQUESTED` an implementation that left
the tracked cache stale.

**Refactor docs-template consumers (`ComponentShowcase`, `Callout`,
`CodeBlock`, `SidebarNav`, `SearchBox`) to use the newly-shipped
atoms.** Rejected as out-of-scope: the issue body's "Out of scope"
list says nothing about a consumer refactor, and the acceptance lines
are strictly about the atom set being present. Wiring up consumers
is a follow-up — the precedent set by
`starter-use-the-text-component-for-all-t` (atom install in PR #33's
predecessor; consumer sweep in PR #33) is the same staging discipline
the docs typography sweep followed (`docs-use-the-text-component-for-all-typo`).

**Edit `apps/docs/` proactively instead of conditionally.** Rejected
because the survey at proposal time shows `apps/docs/` already in
parity with the new docs-template state. Editing it without a
detected divergence would either be a no-op (waste of churn) or
introduce a real drift between the two trees. The conditional
realignment under § Apps mirror handles the unexpected case without
manufacturing one.
