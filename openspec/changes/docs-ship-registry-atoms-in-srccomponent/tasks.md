# Tasks: docs-ship-registry-atoms-in-srccomponent

Order matters. T1 surveys; T2–T7 copy atoms into the docs template in
small waves so the tree stays buildable; T8 ships `lib/toast.ts`; T9
verifies the apps mirror; T10 refreshes the CLI cache; T11–T18 run the
verification ladder.

The `committer --design` allow-list will reject any path not declared
in `design.md` § Files touched. Stay within it.

## Survey

- [x] **T1.** Inventory:
      (a) `diff -q packages/registry/base/<atom>.astro
packages/templates/starter/src/components/ui/<atom>.astro` for every
      starter atom (and for compound families,
      `diff -q packages/registry/base/<family>/<filename>
packages/templates/starter/src/components/ui/<filename>`) — confirm
      byte parity between registry and starter (the implicit "source of
      truth" reference); record any unexpected diff.
      (b) `diff -q packages/registry/lib/toast.ts
packages/templates/starter/src/lib/toast.ts` — confirm the lib
      helper is also byte-parallel.
      (c) For every atom file the survey identified at (a), and for
      `lib/toast.ts` at (b), record whether the docs template
      (`packages/templates/docs/src/components/ui/<filename>` and
      `packages/templates/docs/src/lib/toast.ts`) already has the file
      (expected: only `text.astro` exists today; everything else is
      missing). Output the per-file table to
      `openspec/changes/docs-ship-registry-atoms-in-srccomponent/runs/<ts>/inventory.md`.
      (d) `diff -q packages/templates/starter/src/components/ui/<filename>
apps/docs/src/components/ui/<filename>` for every starter atom and
      `diff -q packages/registry/lib/toast.ts apps/docs/src/lib/toast.ts`
      — confirm the apps/docs mirror is already byte-equivalent to the
      registry set (proposal-time scan asserts this; the inventory must
      re-verify before implementation). Record the result.
      (e) `git ls-files packages/astro-ignite/templates/docs/src/components/ui/`
      and `git ls-files packages/astro-ignite/templates/docs/src/lib/` —
      catalogue what the CLI cache currently contains so the diff after T10
      is interpretable (the proposal-time check shows the cache has
      neither `ui/` nor `lib/cn.ts`; the cache regeneration will pick those
      up alongside the new atoms — record the baseline so the reviewer can
      audit the unrelated drift that landed alongside this change).
      Covers **S1**, **S2**, **S3**, **S5**, **S8**.

## Atom copy — top-level singletons (13 files)

Copy each atom from `packages/templates/starter/src/components/ui/`
(or, equivalently, from `packages/registry/base/`) into the same
filename under `packages/templates/docs/src/components/ui/`. The
operation is `cp -p` (or equivalent) followed by `diff -q` confirming
byte equality. No content edit is made.

- [ ] **T2a.** Copy `alert.astro`, `avatar.astro`, `badge.astro`, and
      `button.astro` (4 files). Run
      `pnpm --filter @astro-ignite/template-docs typecheck` after this
      batch to confirm the template still compiles (no broken imports
      surface because the atoms import only `@/lib/cn`, which already
      exists in the docs template tree). Covers **S1**.

- [ ] **T2b.** Copy `input.astro`, `kbd.astro`, `label.astro`,
      `link.astro`, and `separator.astro` (5 files). Run the same
      typecheck. Covers **S1**.

- [ ] **T2c.** Copy `skeleton.astro`, `textarea.astro`, and
      `tooltip.astro` (3 files). Run typecheck. Covers **S1**.

- [ ] **T2d.** Copy `toaster.astro` (1 file). At this point typecheck
      WILL fail because `toaster.astro` imports `@/lib/toast` which
      does not yet exist in the docs template. Proceed immediately to
      T8 (which adds the helper) — do NOT run typecheck between T2d
      and T8 unless you also run T8 first. Covers **S1**.

## Atom copy — compound families (17 files)

- [ ] **T3.** accordion: copy `accordion.astro` and
      `accordion-item.astro` from `packages/registry/base/accordion/`
      (or starter mirror) into
      `packages/templates/docs/src/components/ui/`. Verify with
      `diff -q`. Covers **S1**, **S3**.

- [ ] **T4.** card: copy `card.astro`, `card-content.astro`,
      `card-description.astro`, `card-footer.astro`,
      `card-header.astro`, `card-title.astro` from
      `packages/registry/base/card/` (or starter mirror) into
      `packages/templates/docs/src/components/ui/`. Verify with
      `diff -q`. Covers **S1**, **S3**.

- [ ] **T5.** dialog: copy `dialog.astro`, `dialog-description.astro`,
      `dialog-title.astro` from `packages/registry/base/dialog/` (or
      starter mirror) into `packages/templates/docs/src/components/ui/`.
      Verify with `diff -q`. Covers **S1**, **S3**.

- [ ] **T6.** dropdown-menu: copy `dropdown-menu.astro` and
      `dropdown-menu-item.astro` from
      `packages/registry/base/dropdown-menu/` (or starter mirror) into
      `packages/templates/docs/src/components/ui/`. Verify with
      `diff -q`. Covers **S1**, **S3**.

- [ ] **T7.** tabs: copy `tabs.astro`, `tabs-content.astro`,
      `tabs-list.astro`, `tabs-trigger.astro` from
      `packages/registry/base/tabs/` (or starter mirror) into
      `packages/templates/docs/src/components/ui/`. Verify with
      `diff -q`. Covers **S1**, **S3**.

## Lib helper

- [ ] **T8.** Copy `packages/registry/lib/toast.ts` to
      `packages/templates/docs/src/lib/toast.ts`. Verify with
      `diff -q packages/registry/lib/toast.ts
packages/templates/docs/src/lib/toast.ts` (exit 0) and
      `diff -q packages/templates/starter/src/lib/toast.ts
packages/templates/docs/src/lib/toast.ts` (exit 0). Run
      `pnpm --filter @astro-ignite/template-docs typecheck` and confirm
      it exits 0 — `toaster.astro` now resolves its `@/lib/toast`
      import. Covers **S1**, **S2**, **S9**.

## Apps mirror verification (conditional realignment)

- [ ] **T9.** Re-verify the apps/docs parity claim against the new
      docs-template state. From the repo root run
      `    for f in packages/templates/docs/src/components/ui/*.astro; do
  name=$(basename "$f")
  diff -q "$f" "apps/docs/src/components/ui/$name"
done
diff -q packages/templates/docs/src/lib/toast.ts apps/docs/src/lib/toast.ts`
      Expected outcome: every comparison reports "identical" (exit 0
      across the loop). If so, log "apps/docs parity confirmed, no
      edit" in the inventory; no apps/docs file is staged for commit.
      If a divergence surfaces, copy the docs-template file over the
      apps/docs file (i.e. align apps/docs to the new canonical state)
      and log the path-by-path realignment in the inventory; the
      design.md allow-list under § Apps mirror covers the staged
      paths. Covers **S5**.

## CLI template cache refresh

- [ ] **T10.** Run, from the repo root,
      `node packages/astro-ignite/scripts/copy-templates.mjs`. The
      script regenerates `packages/astro-ignite/templates/` from
      `packages/templates/`. Expected diff vs `main` for the docs
      branch:
      (a) every new atom under
      `packages/astro-ignite/templates/docs/src/components/ui/<filename>`
      (30 NEW files, matching the docs-template `ui/` set after T2–T7);
      (b) `packages/astro-ignite/templates/docs/src/lib/toast.ts`
      (NEW);
      (c) `packages/astro-ignite/templates/docs/src/lib/cn.ts` (NEW —
      unrelated drift; the cache lacked it before this change and the
      regeneration picks it up automatically — see § CLI template
      cache for the rationale);
      (d) any other unrelated drift the cache had accumulated since
      its last refresh — record each path in
      `runs/<ts>/impl.md` so the reviewer can audit the scope.
      After the script run, verify with
      `diff -rq packages/templates/docs/ packages/astro-ignite/templates/docs/`
      that the only differences are the documented `_gitignore` ↔
      `.gitignore` rename and the `SKIP` set of build-artefact
      directories. Covers **S8**.

## Verification

- [ ] **T11.** From the repo root, run the S1 verifier:
      `    for f in packages/templates/starter/src/components/ui/*.astro; do
  name=$(basename "$f")
  diff -q "$f" "packages/templates/docs/src/components/ui/$name"
done`
      and confirm every comparison reports "identical" (zero "differ"
      lines). Same loop against
      `packages/registry/base/<atom>.astro` (for the singletons) and
      `packages/registry/base/<family>/<filename>` (for the compound
      families) — all identical. Capture the output in
      `runs/<ts>/audit.md`. Covers **S1**, **S3**.

- [ ] **T12.** Run `node scripts/audit/no-react-in-atoms.mjs` and
      `node scripts/audit/no-react-in-atoms.mjs --named-only --registry
--family-layout`. Both exit 0 (no change vs `main`; the audit walks
      `packages/registry/base/`, which this change does not modify).
      Capture in `runs/<ts>/audit.md`. Covers **S6**.

- [ ] **T13.** Run `node scripts/audit/tokens-only.mjs`. Confirm the
      modified docs template introduces zero new I1 violations beyond
      the pre-existing baseline (the `themeColor: '#fafafa'` hex
      literal in `packages/templates/docs/src/config/site.ts` predates
      this change and is out of scope; see prior changes' impl logs
      for the same exception note). Capture in `runs/<ts>/audit.md`.
      Covers **S6**.

- [ ] **T14.** Run
      `pnpm audit:invariants --change docs-ship-registry-atoms-in-srccomponent`
      and capture the output under `runs/<ts>/audit.md`. Confirm exit
      code 0 (modulo any documented baseline failures from prior
      changes). Covers **S11**.

- [ ] **T15.** Run `pnpm --filter @astro-ignite/template-docs typecheck`,
      `pnpm --filter @astro-ignite/template-docs build`,
      `pnpm --filter @astro-ignite/docs typecheck`, and
      `pnpm --filter @astro-ignite/docs build`. Capture each result in
      `runs/<ts>/impl.md`. If the full-repo `pnpm typecheck` fails
      inside `apps/playground/` for a pre-existing reason (per the
      starter precedent), document it as the same out-of-scope
      environmental issue. Covers **S9**.

- [ ] **T16.** Run `pnpm test` and `pnpm format:check`. Capture the
      result in `runs/<ts>/impl.md`. No new vitest tests are
      introduced by this change (the contract is enforced by the
      audit suite + the byte-equality verifier at T11).

- [ ] **T17.** Run `pnpm scaffold:test` and
      `pnpm perf:budget --change docs-ship-registry-atoms-in-srccomponent`.
      Capture both reports in `runs/<ts>/perf.md`. If the sandbox
      lacks a Lighthouse / Chrome binary, document the environmental
      caveat (per `wire-local-lighthouse-against-a-preview` the local
      gate degrades gracefully; CI is authoritative) and capture the
      non-Lighthouse signals (dep counts, build sizes). Confirm
      `pnpm scaffold:test` writes the new atoms into
      `apps/playground/src/components/ui/` byte-equivalently to the
      docs-template source. Covers **S10**, **S12**.

- [ ] **T18.** Run
      `git diff --name-only main -- ':!openspec' ':!.changeset'` and
      confirm every changed file is under
      `packages/templates/docs/src/components/ui/`,
      `packages/templates/docs/src/lib/`,
      `packages/astro-ignite/templates/docs/`, or — only if T9 fired —
      `apps/docs/src/components/ui/` / `apps/docs/src/lib/toast.ts`.
      No `apps/site/**`, no `apps/playground/**`, no
      `packages/templates/starter/**`, no `packages/registry/**` (in
      particular `packages/registry/registry.json` is unchanged).
      Capture the diff list in `runs/<ts>/impl.md`. Covers **S7**,
      **S13**.

## Changeset

- [ ] **T19.** Add `.changeset/docs-atom-set-parity.md` (patch level,
      scoping `astro-ignite` and `create-astro-ignite` — the docs
      template is `ignored` in `.changeset/config.json` the same way
      the starter is, so the version bump rides on the parent
      packages, matching the starter precedent at
      `.changeset/starter-text-atom-typography.md` and the docs
      precedent at `.changeset/docs-text-atom-typography.md`).
      Describe the change as: "Ship the registry's atom set
      pre-installed in the docs template (and refresh the CLI
      template cache) so a fresh `npm create astro-ignite -- --template
docs` scaffolds the same `src/components/ui/` set that the starter
      already does. Non-breaking refactor; users who previously
      scaffolded the docs template can copy the atoms into their site
      manually or run `npx astro-ignite add <name>` for each missing
      atom."
