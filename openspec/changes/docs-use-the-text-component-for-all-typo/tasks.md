# Tasks: docs-use-the-text-component-for-all-typo

Order matters. T1 surveys; T2 lands the atom file (and any lockstep
extension); T3–T8 refactor docs-template surfaces in waves leaving the
tree buildable between them; T9–T15 mirror the same refactor into
`apps/docs/`; T16–T23 run the verification ladder.

The `committer --design` allow-list will reject any path not declared
in `design.md` § Files touched. Stay within it.

## Survey

- [x] **T1.** Inventory every `<h1>`–`<h6>` and `<p>` in
      `packages/templates/docs/src/{pages,components,layouts}/**/*.astro`
      and in `apps/docs/src/{pages,components,layouts}/**/*.astro`.
      Classify each as either (a) "body copy or heading inside an
      in-scope file", (b) "chrome / atom / scoped-style-encapsulated
      and excepted", (c) "MDX-rendered through `<slot />` and out of
      scope", or (d) "live preview demo block on a docs page that
      demonstrates the atom contract — out of scope". Output the
      classification to
      `openspec/changes/docs-use-the-text-component-for-all-typo/runs/<ts>/inventory.md`
      so the reviewer can confirm S2, S3, S4, S12 coverage. Covers
      **S2**, **S3**, **S4**, **S12**.

## Atom install + lockstep extension (only if T1 needs it)

- [x] **T2a.** Create
      `packages/templates/docs/src/components/ui/text.astro` by copying
      `packages/registry/base/text.astro` and rewriting the `cn` import
      to resolve against the docs template's local `src/lib/cn.ts`
      (mirror the starter mirror at
      `packages/templates/starter/src/components/ui/text.astro`).
      Confirm `diff -u
packages/templates/starter/src/components/ui/text.astro
packages/templates/docs/src/components/ui/text.astro` shows no
      divergence beyond what diffs against the registry source. Covers
      **S1**.

- [x] **T2b.** Create `apps/docs/src/components/ui/text.astro` with the
      same content as T2a (the `ui/` folder already exists in
      `apps/docs/src/components/`). Confirm `diff -u
packages/templates/docs/src/components/ui/text.astro
apps/docs/src/components/ui/text.astro` shows no divergence. Covers
      **S1**, **S12**.

- [x] **T2c.** **Only if T1 surfaces a typography pattern none of the
      existing `Text` variants can express:** extend
      `packages/registry/base/text.astro` with the new variant entry
      (variant union member + `defaultTag` + `variantClasses` row).
      Mirror the edit exactly into
      `packages/templates/starter/src/components/ui/text.astro`,
      `packages/templates/docs/src/components/ui/text.astro`, AND
      `apps/docs/src/components/ui/text.astro`. Confirm all four files
      diff only in incidental whitespace and the `cn` import path. If
      no extension is needed, leave all four files at their post-T2b
      state and note "no extension required" in
      `runs/<ts>/inventory.md`. Covers **S5**.

## Refactor — docs template layouts

- [ ] **T3.** `packages/templates/docs/src/layouts/DocsLayout.astro`:
      replace `<h1>{title}</h1>` with `<Text variant="h1">{title}</Text>`
      and `<p class="docs-lede">{description}</p>` with
      `<Text variant="lead" class="docs-lede">{description}</Text>`.
      Import `Text` from `@/components/ui/text.astro`. Shrink the
      scoped `<style>` block per `design.md` § Scoped style rules
      removed (`.docs-header h1` and `.docs-lede` lose typography
      props; keep layout/spacing). The `<style is:global>.docs-prose`
      block stays untouched. Covers **S4**, **S6**.

- [ ] **T4.** `packages/templates/docs/src/layouts/LegalLayout.astro`:
      replace `<h1>{entry.data.title}</h1>` with `<Text variant="h1">{…}</Text>`
      and `<p class="legal-meta">…</p>` with
      `<Text variant="muted" class="legal-meta">…</Text>`. Shrink the
      scoped `<style>` block (`.legal-header h1` and `.legal-meta`
      typography props collapse; layout/flex props stay). The
      `<style is:global>.legal-prose` block stays untouched. Covers
      **S4**, **S6**.

## Refactor — docs template components

- [ ] **T5.** `packages/templates/docs/src/components/docs/ComponentShowcase.astro`:
      replace `<h1 class="showcase__title">{name}</h1>` with
      `<Text variant="h1" class="showcase__title">{name}</Text>` and
      `<p class="showcase__desc">{description}</p>` with
      `<Text variant="lead" class="showcase__desc">{description}</Text>`.
      Shrink the scoped `<style>` per § Scoped style rules removed
      (`.showcase__title` keeps `text-transform: lowercase` and
      `font-family: var(--font-mono, monospace)` because those are
      bespoke decoration; `.showcase__desc` keeps `max-width: 60ch`
      and `margin`). Covers **S3**, **S6**.

- [ ] **T6.** `packages/templates/docs/src/components/docs/SidebarNav.astro`:
      replace `<h2 class="sidebar-group-title mono">{group.group}</h2>`
      with
      `<Text variant="eyebrow" as="h2" class="sidebar-group-title">{group.group}</Text>`.
      Keep the `mono` class on the wrapper if it was needed for
      `font-family` — or drop it if the atom's `eyebrow` already
      delivers the desired letter-spacing/case without `mono`; the
      inventory at T1 records which. Shrink the scoped
      `.sidebar-group-title` rule to layout-only (`padding`, `margin`).
      The rest of the sidebar's scoped block stays — it's
      above-the-fold chrome. Covers **S3**, **S6**.

- [ ] **T7.** `packages/templates/docs/src/components/legal/CookieBanner.astro`:
      replace `<h2 id="cookie-banner-title">{…}</h2>` with
      `<Text variant="h4" as="h2" id="cookie-banner-title">{…}</Text>`
      and `<p id="cookie-banner-description">{…}</p>` with
      `<Text variant="muted" id="cookie-banner-description">{…}</Text>`.
      Drop the now-redundant `.cookie-banner h2 { font-size; font-weight }`
      and `.cookie-banner p { color }` rules from the scoped block;
      keep layout (`margin`, `padding`, positioning). The aria/role
      attributes and the inline `<script is:inline>` stay untouched.
      Covers **S3**, **S6**.

## Refactor — docs template pages (audit-only by default)

- [ ] **T8.** Verify each page under
      `packages/templates/docs/src/pages/**/*.astro` (`index.astro`,
      `[...slug].astro`, `legal/[...slug].astro`,
      `[lang]/index.astro`, `[lang]/[...slug].astro`,
      `[lang]/legal/[...slug].astro`) renders only through `DocsLayout`
      / `LegalLayout` with no inline `<h*>` or `<p>` body. If T1
      surfaces an inline heading or paragraph on a page, wrap it in
      `<Text>` here (and add the page to the `MOD` list in
      `design.md` via a follow-up note in `runs/<ts>/inventory.md`).
      If every page is delegate-only — which the static survey
      indicates — log "no page-level changes required" in the
      inventory. Covers **S2**, **S6**.

## Refactor — apps/docs mirror

- [ ] **T9.** Mirror T3 into `apps/docs/src/layouts/DocsLayout.astro`.
      Covers **S4**, **S6**, **S12**.

- [ ] **T10.** Mirror T4 into `apps/docs/src/layouts/LegalLayout.astro`.
      Covers **S4**, **S6**, **S12**.

- [ ] **T11.** Mirror T5 into
      `apps/docs/src/components/docs/ComponentShowcase.astro`. Covers
      **S3**, **S6**, **S12**.

- [ ] **T12.** Mirror T6 into
      `apps/docs/src/components/docs/SidebarNav.astro` (note: the
      apps copy uses `groupLabel` instead of `group.group`; otherwise
      the substitution is line-for-line). Covers **S3**, **S6**,
      **S12**.

- [ ] **T13.** Mirror T7 into
      `apps/docs/src/components/legal/CookieBanner.astro`. Covers
      **S3**, **S6**, **S12**.

- [ ] **T14.** `apps/docs/src/components/blocks/not-found-state.astro`:
      replace `<h1 class="m-0 text-[clamp(40px,6vw,56px)] font-medium
tracking-[-0.045em] leading-none text-fg">{title}</h1>` with
      `<Text variant="h1">{title}</Text>` and
      `<p class="m-0 text-[15px] text-fg-muted leading-relaxed
max-w-[36ch]">{description}</p>` with
      `<Text variant="muted" class="max-w-[36ch]">{description}</Text>`
      (keep `max-w-[36ch]` — that's layout, not typography). If the
      block has an eyebrow `<span>`, wrap it as
      `<Text variant="eyebrow" class="mono">{code}</Text>`. Covers
      **S3**, **S6**, **S12**.

- [ ] **T15.** `apps/docs/src/pages/components/index.astro`: replace
      the page-frame typography (`cat__eyebrow`, `cat__title`,
      `cat__lede`, each `grp__lede`, each group `<h2>{group}</h2>`,
      and each per-component `<h3>{name}</h3>`) with `<Text>`
      equivalents (`eyebrow`, `h1`, `lead`, `lead`, `h2`, `h3`
      respectively). Keep the layout-only wrapper classes
      (`cat__eyebrow`, `cat__title`, etc.) on the `<Text>` `class`
      prop because the scoped `<style>` uses those classes for
      grid/spacing rules. Do NOT touch raw `<p>`/`<h*>` inside the
      live preview blocks — they demonstrate the atom contract (per
      § "Sweep rule for apps/docs marketing pages"). For any other
      pages under `apps/docs/src/pages/` that T1's inventory flagged
      as having page-frame body copy outside live previews
      (`design.astro`, `pages/blocks/index.astro`, `pages/blocks/
not-found-state.astro`, the per-component showcase pages with
      caption / "use it like:" paragraphs, and the `[lang]/`
      parallels), apply the same page-frame `<Text>` substitution.
      Covers **S2**, **S6**, **S12**.

## Verification

- [ ] **T16.** From the repo root run
      `grep -REn '<(h[1-6]|p)\b[^>]*class="[^"]*\b(text-\[|text-(lg|sm|xs|base|2xl|3xl|4xl|5xl|6xl)|leading-|font-(medium|semibold|bold|normal)|tracking-)[^"]*"' packages/templates/docs/src/`
      and confirm matches occur only inside
      `packages/templates/docs/src/components/ui/*` (atom sources).
      Then run the same `grep` against `apps/docs/src/` and confirm
      matches occur only inside `apps/docs/src/components/ui/*`,
      `apps/docs/src/pages/components/*.astro` live preview blocks
      (the demos), and any scoped-style components the inventory
      identified. Any other match is a bug — fix before continuing.
      Covers **S6**.

- [ ] **T17.** From the repo root run
      `node scripts/audit/tokens-only.mjs` and
      `node scripts/audit/tokens-only.mjs --layered`. Confirm the
      docs template introduces zero new I1/I4 violations beyond the
      pre-existing baseline (the `themeColor: '#fafafa'` hex literal
      in `packages/templates/docs/src/config/site.ts` predates this
      change — see `runs/<ts>/impl.md` for context, matching the
      starter precedent's T13). Covers **S7**, **S8**.

- [ ] **T18.** From the repo root run
      `node scripts/audit/no-react-in-atoms.mjs --named-only --registry --family-layout`
      and confirm it exits 0. Covers **S9**.

- [ ] **T19.** Run
      `pnpm audit:invariants --change docs-use-the-text-component-for-all-typo`
      and capture the output under
      `runs/<ts>/audit.md`. Covers **S10** (modulo any documented
      baseline).

- [ ] **T20.** Run `pnpm --filter @astro-ignite/template-docs typecheck`
      and `pnpm --filter @astro-ignite/docs typecheck` (the apps copy).
      Capture the result in `runs/<ts>/impl.md`. If the full-repo
      `pnpm typecheck` fails inside `apps/playground/` for a
      pre-existing reason (per the starter precedent's T16), document
      it as the same out-of-scope environmental issue.

- [ ] **T21.** Run `pnpm test`. Capture the result in
      `runs/<ts>/impl.md`. No new vitest tests are introduced by this
      change (the contract is enforced by the audit suite + the grep
      regression check at T16 + visual review).

- [ ] **T22.** Run
      `pnpm perf:budget --change docs-use-the-text-component-for-all-typo`
      and `pnpm scaffold:test`. Capture both reports in
      `runs/<ts>/perf.md`. If the sandbox lacks a Lighthouse / Chrome
      binary, document the environmental caveat (see the starter
      precedent at
      `openspec/changes/starter-use-the-text-component-for-all-t/runs/2026-05-18T09-59-13Z/perf.md`)
      and capture the non-Lighthouse signals (dep counts, build sizes).
      Covers **S11**.

- [ ] **T23.** Run `git diff --name-only main -- ':!openspec' ':!.changeset'`
      and confirm every changed file is under
      `packages/templates/docs/`, `apps/docs/`, or — only if T2c
      fired — `packages/registry/base/text.astro` and
      `packages/templates/starter/src/components/ui/text.astro`.
      No `apps/site/**`, no `apps/playground/**`, no other template's
      `src/**`. Covers **S13**.

- [ ] **T24.** Add `.changeset/docs-text-atom-typography.md` (patch
      level, scoping `astro-ignite` and `create-astro-ignite` — the
      docs template is `ignored` in `.changeset/config.json` the same
      way the starter is, so the version bump rides on the parent
      packages, matching the starter precedent at
      `.changeset/starter-text-atom-typography.md`).
