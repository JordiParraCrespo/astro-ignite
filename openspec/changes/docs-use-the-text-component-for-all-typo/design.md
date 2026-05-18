# Design: docs-use-the-text-component-for-all-typo

## Files touched

The `committer --design` allow-list parses `MOD` / `NEW` / `DEL`
prefixes from this section. All paths below are relative to the
repository root.

### Atom (template — new file, mirrors the registry)

- NEW `packages/templates/docs/src/components/ui/text.astro` — copy of
  `packages/registry/base/text.astro` with the same `cn` import path
  rewrite the starter mirror uses (`@/lib/cn` resolves to the
  template's local `src/lib/cn.ts`, see
  `packages/templates/docs/src/lib/cn.ts`). The variant union,
  `defaultTag`, `variantClasses`, `toneClasses`, `weightClasses`, and
  the `Props` shape are byte-for-byte equal to the registry source.
  This is the docs equivalent of the starter mirror that already lives
  at `packages/templates/starter/src/components/ui/text.astro`.

### Atom (registry — only if a variant has to be added)

- MOD `packages/registry/base/text.astro` — **only** if the docs sweep
  surfaces a typography pattern none of `display | h1 | h2 | h3 | h4 |
lead | body | small | muted | eyebrow | code` can express. Same
  conditional as the starter spec (Acceptance rule from #29 / PR #33).
- MOD `packages/templates/starter/src/components/ui/text.astro` — only
  fired if the registry atom is extended. Mirrors the change exactly
  so the starter and docs mirrors stay in lockstep with the source.
  Confirm with `diff -u packages/registry/base/text.astro
packages/templates/starter/src/components/ui/text.astro` and the
  equivalent diff against the new docs mirror — only the `cn` import
  path may differ.

### Layouts

- MOD `packages/templates/docs/src/layouts/DocsLayout.astro` — the
  article header `<h1>{title}</h1>` becomes
  `<Text variant="h1">{title}</Text>`; the
  `<p class="docs-lede">{description}</p>` becomes
  `<Text variant="lead" class="docs-lede">{description}</Text>` (the
  class is retained because the surrounding scoped rule constrains
  `max-width` and `margin`; the typography rule itself moves into the
  atom, so the now-unused scoped rules
  `.docs-header h1 { font-size … }`, `.docs-lede { font-size … }` are
  reduced to the layout-only properties — see § Scoped style rules
  removed below). The MDX `<slot />` body inside `.docs-prose` and the
  `<style is:global>.docs-prose …</style>` block stay untouched (MDX
  rendering is out of scope).
- MOD `packages/templates/docs/src/layouts/LegalLayout.astro` — the
  legal header `<h1>{entry.data.title}</h1>` becomes
  `<Text variant="h1">{entry.data.title}</Text>`; the
  `<p class="legal-meta">…</p>` becomes
  `<Text variant="muted" class="legal-meta">…</Text>` (the class is
  retained for the flex/gap layout). The `<style is:global>.legal-prose
…</style>` block (here `.legal-prose :global(blockquote) { … }`) stays.

### Components — docs

- MOD `packages/templates/docs/src/components/docs/ComponentShowcase.astro`
  — `<h1 class="showcase__title">{name}</h1>` →
  `<Text variant="h1" class="showcase__title">{name}</Text>`. The
  `.showcase__title` class still applies the mono cased / lowercased
  rule via the scoped `<style>`; the typography size/weight comes
  from the atom. `<p class="showcase__desc">{description}</p>` →
  `<Text variant="lead" class="showcase__desc">{description}</Text>`.
  The "Install" `<span class="showcase__install-label">` and back-link
  are chrome and stay as-is.
- MOD `packages/templates/docs/src/components/docs/SidebarNav.astro` —
  `<h2 class="sidebar-group-title mono">{group.group}</h2>` →
  `<Text variant="eyebrow" as="h2" class="sidebar-group-title">{group.group}</Text>`.
  The `mono` font-family stays on a wrapper class because the eyebrow
  variant in the atom does not include `font-mono` (`font-mono` is the
  `code` variant only). The scoped rule
  `.sidebar-group-title { font-size: 10px; … }` collapses to layout-only
  (`padding`, `margin`) since the atom owns the typography.

### Components — legal

- MOD `packages/templates/docs/src/components/legal/CookieBanner.astro`
  — `<h2 id="cookie-banner-title">{t('cookies.banner.title')}</h2>` →
  `<Text variant="h4" as="h2" id="cookie-banner-title">{…}</Text>`
  (the banner title is ~16px / 600-weight per the scoped block, which
  matches the atom's `h4` variant: `text-base font-semibold
tracking-[-0.015em] leading-[1.35]`). `<p id="cookie-banner-description">{…}</p>`
  → `<Text variant="muted" id="cookie-banner-description">{…}</Text>`
  (the scoped block applies `color: var(--color-fg-muted)`; the atom's
  `muted` variant resolves to the same token via `text-fg-muted`). The
  scoped `.cookie-banner h2 { font-size: 1rem; font-weight: 600; }` and
  `.cookie-banner p { color: var(--color-fg-muted); }` rules become
  redundant and are removed (the atom owns both); the layout rules
  (`margin`, `padding`, positioning) stay.

### Pages (docs template — sweep is a no-op assertion)

- MOD `packages/templates/docs/src/pages/index.astro` —
  delegate-only page. Confirm no inline `<h*>`/`<p>` is added during
  T1. If the file is unchanged, list it in the inventory but skip the
  `MOD` here. (Inventory result will determine whether the file is
  actually modified or merely audited.)
- MOD `packages/templates/docs/src/pages/[...slug].astro`,
  `packages/templates/docs/src/pages/legal/[...slug].astro`,
  `packages/templates/docs/src/pages/[lang]/index.astro`,
  `packages/templates/docs/src/pages/[lang]/[...slug].astro`,
  `packages/templates/docs/src/pages/[lang]/legal/[...slug].astro` —
  same delegate-only pattern; same audit-only assertion. Listed as
  `MOD` candidates so the committer doesn't reject a defensive edit
  if T1 surfaces something the static survey missed; if unchanged
  after T1, the inventory documents the no-op.

### Apps mirror (`apps/docs/`)

- NEW `apps/docs/src/components/ui/text.astro` — same content as the
  docs template's new atom mirror. The `ui/` directory already exists
  in `apps/docs/src/components/` (see `dialog-title.astro`,
  `card-description.astro`, `dialog-description.astro`), so this is a
  new sibling file, not a new directory.
- MOD `apps/docs/src/layouts/DocsLayout.astro` — mirrors
  `packages/templates/docs/src/layouts/DocsLayout.astro`.
- MOD `apps/docs/src/layouts/LegalLayout.astro` — mirrors the template
  layout.
- MOD `apps/docs/src/components/docs/ComponentShowcase.astro` —
  mirrors the template component.
- MOD `apps/docs/src/components/docs/SidebarNav.astro` — mirrors the
  template component. The apps copy has `groupLabel` instead of
  `group.group` but the typography surface is the same.
- MOD `apps/docs/src/components/legal/CookieBanner.astro` — mirrors
  the template component.
- MOD `apps/docs/src/components/blocks/not-found-state.astro` — the
  apps-specific 404 block. The `<h1 class="m-0 text-[clamp(40px,6vw,…)]
font-medium tracking-[-0.045em] leading-none text-fg">{title}</h1>` →
  `<Text variant="h1">{title}</Text>`; the
  `<p class="m-0 text-[15px] text-fg-muted leading-relaxed
max-w-[36ch]">{description}</p>` →
  `<Text variant="muted" class="max-w-[36ch]">{description}</Text>`
  (the `max-w-[36ch]` is layout, not typography). Optional eyebrow
  `<span>{code}</span>` (if present) → `<Text variant="eyebrow" class="mono">{code}</Text>`.
- MOD `apps/docs/src/pages/components/index.astro` — the marketing
  catalogue page. `<p class="cat__eyebrow mono">` →
  `<Text variant="eyebrow" class="cat__eyebrow mono">`;
  `<h1 class="cat__title">` → `<Text variant="h1" class="cat__title">`;
  `<p class="cat__lede">` → `<Text variant="lead" class="cat__lede">`;
  per-group `<h2>{group}</h2>` → `<Text variant="h2">`;
  `<p class="grp__lede">` → `<Text variant="lead" class="grp__lede">`;
  per-component `<h3>{name}</h3>` → `<Text variant="h3">`. The
  `<span class="comp__file mono">` chips and `<p style="margin:0;">`
  / `<p class="small-muted">` inline strings inside the live previews
  stay as-is when they're _inside_ a live atom showcase block (those
  are the atoms demoing themselves — touching them would muddy the
  reference; the safer move is to keep them as the raw HTML they
  demonstrate). The page-frame typography (eyebrow / title / lede /
  group titles) moves to `<Text>`; the per-component demo HTML stays
  raw.
- MOD `apps/docs/src/pages/components/<atom>.astro` for each per-atom
  showcase page (e.g. `apps/docs/src/pages/components/button.astro`,
  `apps/docs/src/pages/components/card.astro`, …). Each page wraps
  `ComponentShowcase` plus a few raw demo elements (`<p>{t('…')}</p>`,
  `<h3>{title}</h3>`). The page-frame text — what `ComponentShowcase`
  emits — already moves via the showcase change above. The raw demo
  elements _inside_ live previews stay raw if they're demonstrating
  what the atom does (e.g. the typography reference inside
  `apps/docs/src/pages/components/text.astro` is intentionally
  authored with the atom under test — that's already the case
  upstream). For non-demo body copy (e.g. captions, "use it like this:"
  paragraphs above a live preview), wrap in `<Text>`. The inventory at
  T1 enumerates which of the 20-ish pages have non-demo body copy that
  needs `<Text>` — most likely a small handful (`text.astro`,
  `kbd.astro` based on the grep result already gathered).
- MOD `apps/docs/src/pages/blocks/index.astro`,
  `apps/docs/src/pages/blocks/not-found-state.astro`,
  `apps/docs/src/pages/components/index.astro`,
  `apps/docs/src/pages/[lang]/components/index.astro`, etc. — same
  page-frame typography rule. The `[lang]/` parallels mirror the
  default-locale pages line for line.
- MOD `apps/docs/src/pages/design.astro` — if it emits page-frame
  typography. T1 enumerates.
- MOD `apps/docs/src/pages/index.astro`,
  `apps/docs/src/pages/[...slug].astro`,
  `apps/docs/src/pages/legal/[...slug].astro`,
  `apps/docs/src/pages/[lang]/index.astro`,
  `apps/docs/src/pages/[lang]/[...slug].astro`,
  `apps/docs/src/pages/[lang]/legal/[...slug].astro` — same
  delegate-only assertion as the template pages; modifications
  determined by T1.

> **Sweep rule for apps/docs marketing pages:** typography on the page
> frame (eyebrow, h1/title, lede, group h2/h3) moves to `<Text>`. The
> raw HTML inside live preview blocks — which exists to _demonstrate_
> the registry — stays raw unless that raw HTML itself violates the
> docs-template invariants (in which case the violation predates this
> change and is out of scope).

### Scoped style rules removed

The refactor _removes_ the typography portions of these scoped style
blocks because the atom now owns them. Layout / positioning rules in
the same blocks stay:

- `DocsLayout.astro` — `.docs-header h1 { font-size … font-weight …
letter-spacing … line-height … color … }` → reduced to `margin: 0 0
12px;` (the `color` flows from token utilities in the atom). `.docs-lede
{ font-size … line-height … color … max-width … margin … }` → reduced to
  `max-width: 60ch; margin: 0 0 16px;`.
- `LegalLayout.astro` — `.legal-header h1 { font-size … font-weight …
line-height … letter-spacing … margin … color … }` → reduced to
  `margin: 0 0 0.5rem;` (color flows from the atom). `.legal-meta {
color … font-size … margin … display: flex; flex-wrap: wrap; gap …; }` →
  reduced to `margin: 0; display: flex; flex-wrap: wrap; gap: 0.5rem;`.
- `ComponentShowcase.astro` — `.showcase__title { font-size … font-weight
… letter-spacing … line-height … text-transform … font-family … color …}`
  → reduced to `text-transform: lowercase; font-family: var(--font-mono,
monospace); margin: 0 0 12px;`. `.showcase__desc { color … font-size …
line-height … margin … max-width …}` → reduced to `max-width: 60ch;
margin: 0 0 16px;`.
- `SidebarNav.astro` — `.sidebar-group-title { font-size … color …
letter-spacing … text-transform … padding … margin … }` → reduced to
  `padding: 4px 8px; margin: 0 0 2px;`.
- `CookieBanner.astro` — `.cookie-banner h2 { margin: 0 0 0.25rem;
font-size: 1rem; font-weight: 600; }` → reduced to `margin: 0 0 0.25rem;`.
  `.cookie-banner p { margin: 0 0 0.875rem; color: var(--color-fg-muted);
}` → reduced to `margin: 0 0 0.875rem;`.

The intent is the same as the starter precedent: typography rules
migrate to the atom; layout, spacing, and bespoke decoration stay
scoped where the wrapper owns them.

### Harness paperwork

The implementer touches these as part of the protocol (run log, audit
captures, tasks/progress markers, changeset). The committer's
`--design` validator parses them out of the backticked list below.

- MOD `openspec/changes/docs-use-the-text-component-for-all-typo/`
  (covers `tasks.md` close-out plus everything written under
  `runs/<ts>/`: `inventory.md`, `impl.md`, `audit.md`, `perf.md`).
- MOD `openspec/progress/current.md` — pointer to the active run dir
  (implementer protocol step 1).
- NEW `.changeset/` — the patch-level changeset required by
  `feature_list.json` rule `require_changeset_to_close`. The
  starter precedent landed at
  `.changeset/starter-text-atom-typography.md`; pick a parallel name
  like `.changeset/docs-text-atom-typography.md` and scope the same
  workspace packages (`astro-ignite` / `create-astro-ignite`; the
  docs template is `ignored` in `.changeset/config.json` the same way
  the starter is, so the version bump rides on the parent packages).

That is the full set. No new audit script. No deletions other than
the redundant scoped CSS rules described above (which are in-place
edits, not file deletions).

## New signatures

No new public exports. The `Text` atom's existing signature covers
every case the issue calls out:

```ts
export type Props = HTMLAttributes<'p'> & {
  variant?:
    | 'display'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'lead'
    | 'body'
    | 'small'
    | 'muted'
    | 'eyebrow'
    | 'code';
  as?: HTMLTag;
  tone?: 'default' | 'muted' | 'subtle';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  class?: string;
};
```

If a new `variant` value is added, it lands in `packages/registry/base/
text.astro`, the starter mirror, AND the new docs mirror (S5). The
docs sweep is not expected to need an extension — every typography
surface enumerated above maps cleanly to an existing variant.

## Invariants this change touches

This change touches two capabilities. Citations are by id from the
matching long-lived spec at `openspec/specs/<capability>/spec.md`.

### `templates-css-tokens`

- **I1** — "No raw zinc / hex in component files."
  Audit: `node scripts/audit/tokens-only.mjs`.
  Status: **preserved**. The docs template already uses token
  utilities (`text-fg`, `text-fg-muted`, `var(--color-fg)`,
  `var(--color-fg-muted)`) in every scoped block touched by the
  refactor; no raw `bg-zinc-*` / `text-zinc-*` is introduced. The
  starter spec's note about an existing baseline `themeColor:
'#0a0a0a'` / `themeColor: '#fafafa'` in
  `packages/templates/starter/src/config/site.ts` /
  `packages/templates/docs/src/config/site.ts` predates this change
  and remains out of scope (initial commit `f02e323`).

- **I4** — "Above-the-fold uses scoped `<style>` (heuristic — flag
  overuse of Tailwind in `Hero.astro`, `Header.astro`)."
  Audit: `node scripts/audit/tokens-only.mjs --layered`.
  Status: **preserved**. The audit's hard-coded above-the-fold list is
  `Hero.astro`, `Header.astro`, `Nav.astro`. The docs template has
  none of those three files; its above-the-fold chrome is
  `SidebarNav.astro`, which is **not** in the audit's allow-list,
  meaning the audit has no opinion about whether `SidebarNav` uses a
  scoped block. The refactor keeps `SidebarNav`'s `<style>` block
  (only the typography rules collapse — the layout, sticky
  positioning, sidebar geometry stay scoped). `ComponentShowcase`,
  `DocsLayout`, `LegalLayout`, and `CookieBanner` are below-the-fold
  on most pages and are not in the audit's allow-list anyway.

I2 (`global.css` defines `--color-*` tokens) and I3 (tri-state dark
mode wiring) are untouched.

### `registry-atoms`

- **I1** — "No React / Vue / Svelte / Radix imports in `base/`."
  Audit: `node scripts/audit/no-react-in-atoms.mjs`.
  Status: **preserved**. The new docs-template atom mirror is a copy
  of the existing `packages/registry/base/text.astro`; no framework
  imports added. If S5 fires and the registry atom grows a variant,
  no client framework import is introduced either (variant changes
  edit the class string only).

- **I2** — "No default exports in atom source files."
  Audit: `node scripts/audit/no-react-in-atoms.mjs --named-only`.
  Status: **preserved**. The new docs mirror keeps the same named
  `Props` export; the `.astro` default export is the component
  itself (the audit excludes `.astro` default exports by design).

- **I3** — "Every atom in `registry.json` has at least `cn` in
  `registryDependencies`."
  Audit: `node scripts/audit/no-react-in-atoms.mjs --registry`.
  Status: **preserved**. The `text` entry in `registry.json` already
  lists `["cn"]` and already targets `src/components/ui/text.astro`.
  No manifest change is required; the registry continues to point at
  the same source file and the same scaffold target. The docs
  template now happens to contain that target file too.

- **I4** — "Compound families live in `base/<family>/`."
  Audit: `node scripts/audit/no-react-in-atoms.mjs --family-layout`.
  Status: **preserved**. `text` is a single-file atom; no family is
  introduced.

Audit commands (parseable by `scripts/audit/run-all.mjs --change`):

- audit: `node scripts/audit/tokens-only.mjs`
- audit: `node scripts/audit/tokens-only.mjs --layered`
- audit: `node scripts/audit/no-react-in-atoms.mjs --named-only --registry --family-layout`

The implementer MUST run `pnpm audit:invariants --change docs-use-the-text-component-for-all-typo`
and capture the output under
`openspec/changes/docs-use-the-text-component-for-all-typo/runs/<ts>/audit.md`.

No new invariant is proposed by this change — the long-lived
`templates-css-tokens` and `registry-atoms` specs are not modified.
The "use `<Text>` for body copy and headings" guarantee in the docs
template is a one-time refactor, not a long-lived audited rule. This
matches the precedent already set by the starter (see the
`Notes` section in the starter spec deltas).

## Performance budget applicability

The feature's capabilities (`templates-css-tokens`, `registry-atoms`)
both match `/^(templates|registry)-/`, so the `feature_list.json` rule
`require_perf_budget_to_close_when` applies. The implementer MUST run
the perf budget check (typically `pnpm perf:budget`, or whatever the
harness dispatches) and capture the report under
`openspec/changes/docs-use-the-text-component-for-all-typo/runs/<ts>/perf.md`.

Expected perf shape:

- **LCP**: docs pages render through `DocsLayout` / `LegalLayout`, both
  of which currently set the header `h1` font-size via a scoped
  `<style>` block. After the refactor, the same font size is applied
  by the atom's Tailwind utilities (`text-[clamp(32px,4.4vw,56px)]
font-medium tracking-[-0.045em] leading-[1.05] text-balance` for the
  `h1` variant). Beasties extracts critical CSS at build time and
  should pick the header utilities. If Beasties misses them, LCP
  regresses by the time it takes to download the deferred stylesheet
  (negligible on the static budget). Confirm via `pnpm perf:budget`.

- **CLS**: `<Text>` renders `m-0` by default and applies the variant's
  `leading-` value. The previous scoped rules set `margin: 0 0 12px`
  on `.docs-header h1`; with `<Text>` we keep the surrounding
  `<header class="docs-header">` so the spacing is now driven by an
  outer wrapper rule. There is no per-character or per-line layout
  shift; CLS should stay at 0.

- **JS / bundle**: no JS added. The atom is template-only Astro
  markup. No new dependencies in either `packages/templates/docs/
package.json` or `apps/docs/package.json`.

- **CSS**: the inline scoped rules removed on `.docs-header h1` /
  `.docs-lede` / `.legal-header h1` / `.legal-meta` /
  `.showcase__title` / `.showcase__desc` / `.sidebar-group-title` /
  `.cookie-banner h2` / `.cookie-banner p` are replaced by Tailwind
  utility classes referenced in the atom. Tailwind v4 de-dupes; net
  CSS size should drop slightly because the same utilities are now
  reused across docs surfaces instead of each component repeating
  its own scoped rules.

If LCP / CLS / TBT cross the budget, the implementer should:

1. Confirm Beasties is picking the header utilities (look at the
   generated `<style>` blob in the built HTML).
2. If not, restore a scoped `<style>` block on that specific layout
   and document the exception in `runs/<ts>/perf.md`. Refactor stays
   everywhere else.

The starter precedent's perf-run (`runs/2026-05-18T09-59-13Z/perf.md`)
documented an environmental caveat — the sandbox had no Lighthouse /
Chrome binary, so the Lighthouse step failed for an environment
reason only. The same caveat may apply to this run; capture the
non-Lighthouse signals (`pnpm perf:budget --change … dep-count`) and
note the environmental limitation if present.

## Rejected alternative

**Add a new long-lived audit (`scripts/audit/use-text-atom.mjs`) that
enforces "no raw `<h1>`–`<h6>` or `<p>` with typography utilities in
the docs template (and starter)".** Rejected for the same reasons as
the starter spec's matching rejected alternative:

1. The audit needs a maintained allow-list (atoms in `src/components/ui/*`,
   above-the-fold chrome with scoped style, any future scoped-style
   component) and a "body vs chrome" heuristic. Both are noisy.
2. The refactor is a one-time alignment — every reasonable surface is
   enumerated in § Files touched. Reviewers (human + the audit suite +
   visual check during `pnpm scaffold:test`) catch regressions on new
   code at low cost. Encoding a fuzzy rule into a script trades cheap
   human judgement for false-positive maintenance.
3. Precedent: `templates-i18n` I6 (`LocaleSwitcher` presence — "manual
   (no static audit yet)") and the starter spec's identical rejection.

**Route the MDX `<slot />` body through `<Text>` via a remark/rehype
plugin or `mdx: { components }` mapping.** Rejected because:

1. Transforming `# Heading` to `<Text variant="h1">` would require a
   custom remark plugin or component-mapping the docs Content Collection
   compiles against. That's an architectural change the issue does not
   call out and that the starter spec also rejected.
2. The `.docs-prose` and `.legal-prose` `<style is:global>` stylesheets
   already centralise MDX typography in one place per layout — moving
   each `<p>` and `<h2>` into `<Text>` would scatter rules across many
   runtime calls without an ownership benefit (the prose styles ship
   in the template; users own them already).
3. If the user later wants MDX-through-Text, that's a separate change
   with a separate spec.

**Split the change into two PRs: docs template first, apps mirror
second.** Rejected because:

1. The locked practice in `CLAUDE.md` is that `apps/*` mirror templates
   manually — they do not auto-update. Splitting the mirror into a
   later PR risks visible drift between scaffolds and the marketing
   site that demonstrates them. The starter precedent kept its scope
   intentionally narrow (`apps/site` was deferred), but the docs
   template's marketing presence (`apps/docs`) is _the docs site_, not
   a marketing landing — drift there confuses doc readers immediately.
2. The boundary scenario S13 enforces "only docs template + apps/docs
   touched"; treating both as one wave keeps the change reviewable
   without inflating scope.

**Use the atom for every `<p>` and `<h*>` inside the live previews on
the per-component showcase pages (`apps/docs/src/pages/components/*.astro`).**
Rejected because:

1. Those raw HTML blocks exist to _demonstrate_ what the atom produces
   (or, for non-atom showcases, what raw HTML produces vs the atom).
   Wrapping the demos in `<Text>` would hide the reference behaviour
   they're meant to show.
2. The Acceptance line in the issue body says "If the rendered MDX
   needs to flow through `<Text>`, that's a separate rehype-plugin
   issue" — by analogy, the per-component demo blocks are also a
   separate concern; they are documentation of the atom's contract,
   not consumer code.
