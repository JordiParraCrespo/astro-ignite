# Design: starter-use-the-text-component-for-all-t

## Files touched

The `committer --design` allow-list parses `MOD`/`NEW`/`DEL` prefixes from
this section. All paths below are relative to the repository root.

### Pages (default locale)

- MOD `packages/templates/starter/src/pages/index.astro` — features
  section `<h2>` → `<Text variant="h2">`; per-card `<h4>{title}</h4>` →
  `<Text variant="h4">`; per-card `<p>{body}</p>` →
  `<Text variant="muted">` (or `<Text variant="small" tone="subtle">`,
  whichever matches the current `text-fg-subtle` look). The numeric
  `index`/`tag` `<span>` chips are not body copy — they stay as
  `<span class="mono ...">` chrome.
- MOD `packages/templates/starter/src/pages/about.astro` — `.page-header
h1` → `<Text variant="h1">`; `.lede p` → `<Text variant="lead">`;
  hand-rolled `<p>` and `<h2>` inside `.prose` → `<Text variant="body">`
  and `<Text variant="h2">`. The scoped `<style>` block shrinks to layout
  rules only (`.page` width + padding); `.page-header h1` and `.lede`
  rules are removed.
- MOD `packages/templates/starter/src/pages/contact.astro` — page header
  → `<Text>`; the inline `.field-error` `<p>` becomes `<Text
variant="small" tone="default" class="field-error">` (the `.field-error`
  class still applies the danger color via the scoped `<style>` because
  it's an error-state semantic, not a typography variant).
- MOD `packages/templates/starter/src/pages/blog/index.astro` — page
  header → `<Text>`; empty-state `<p>` → `<Text variant="muted">`;
  post-card `<h2>` → `<Text variant="h3" as="h2">`; `.post-meta` and
  `.post-description` → `<Text variant="muted">` / `<Text
variant="small" tone="muted">`.
- MOD `packages/templates/starter/src/pages/projects/index.astro` —
  identical pattern to blog/index.

### Pages (`[lang]/` parallels)

- MOD `packages/templates/starter/src/pages/[lang]/index.astro` —
  mirrors `pages/index.astro`.
- MOD `packages/templates/starter/src/pages/[lang]/about.astro` —
  mirrors `pages/about.astro`.
- MOD `packages/templates/starter/src/pages/[lang]/contact.astro` —
  mirrors `pages/contact.astro`.
- MOD `packages/templates/starter/src/pages/[lang]/blog/index.astro` —
  mirrors `pages/blog/index.astro`.
- MOD `packages/templates/starter/src/pages/[lang]/projects/index.astro`
  — mirrors `pages/projects/index.astro`.

### Components

- MOD `packages/templates/starter/src/components/Footer.astro` — brand
  block `<p>` and tagline `<p>` → `<Text variant="body" weight="semibold">`
  and `<Text variant="muted">`; section `<h3>` (`Legal`, `Social`) →
  `<Text variant="h4" as="h3">`; copyright + built-with `<p>` →
  `<Text variant="small" tone="muted">`. Footer is below-the-fold per
  its own header comment, so this is the canonical refactor target.
- MOD `packages/templates/starter/src/components/blocks/not-found-state.astro`
  — `<span class="mono ...">{code}</span>` → `<Text variant="eyebrow"
class="mono">`; `<h1 class="...">{title}</h1>` → `<Text variant="h1">`;
  `<p class="...">{description}</p>` → `<Text variant="muted">`. This
  block is what the 404 page used to be before PR #31; aligning it with
  the new shape closes that loop.

### Layouts

- MOD `packages/templates/starter/src/layouts/ArticleLayout.astro` — the
  article header `<h1>{entry.data.title}</h1>` becomes `<Text
variant="h1">{entry.data.title}</Text>`; the `.article-meta` `<p>`
  becomes `<Text variant="muted" class="article-meta">` (the class
  retains the flex/gap layout). The MDX `<slot />` and the `.prose`
  global `<style is:global>` block stay untouched (out of scope —
  rendering MDX through Text requires a remark plugin).
- MOD `packages/templates/starter/src/layouts/ProjectLayout.astro` —
  project header h1 → `<Text variant="display">` (or `h1`, whichever
  matches the current clamp), summary `<p>` → `<Text variant="lead">`.
  The `<dl>` keeps its semantic markup.
- MOD `packages/templates/starter/src/layouts/LegalLayout.astro` — legal
  header h1 → `<Text variant="h1">`, `.legal-meta` `<p>` →
  `<Text variant="muted">`.

### Atom (only if needed)

- MOD `packages/registry/base/text.astro` — **only** if the refactor
  surfaces a typography pattern none of `display | h1 | h2 | h3 | h4 |
lead | body | small | muted | eyebrow | code` can express. Extending
  the variant set is the issue's required path (acceptance #4); using
  an inline class override on `<Text>` for a recurring pattern is the
  anti-pattern to avoid.
- MOD `packages/templates/starter/src/components/ui/text.astro` —
  mirrors any edit to the registry source so the starter ships pre-
  installed with the same atom. The two files MUST diff only in
  trivially template-mechanical ways (none today).

That is the full set. No new files (no new components, no new audit
script). No deletions.

## New signatures

No new public exports. The `Text` atom's existing signature is sufficient
for every case the issue calls out:

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

If a new `variant` value is added, it lands here (and in the starter
mirror) — see Atom note above. The expected first candidate, if any, is
something like `meta` for the `.article-meta` / `.legal-meta` byline (a
13px muted line with flex gap). The implementer may instead reuse
`muted` plus the `as` prop and a layout-only `class` — that's preferred
to growing the variant API.

## Invariants this change touches

This change touches two capabilities. Citations are by id from the
matching long-lived spec at `openspec/specs/<capability>/spec.md`.

### `templates-css-tokens`

- **I1** — "No raw zinc / hex in component files."
  Audit: `node scripts/audit/tokens-only.mjs`.
  Status: **preserved**. Today's starter already uses token utilities
  (`text-fg`, `text-fg-muted`, `text-fg-subtle`) on inline classes; no
  raw `bg-zinc-*` is introduced. The refactor in fact removes most of
  the inline `text-fg-*` mentions by routing them through `<Text>`'s
  variant defaults, which still resolve to the same token utilities.

- **I4** — "Above-the-fold uses scoped `<style>` (heuristic — flag
  overuse of Tailwind in `Hero.astro`, `Header.astro`)."
  Audit: `node scripts/audit/tokens-only.mjs --layered`.
  Status: **preserved**. The audit's hard-coded above-the-fold list is
  `Hero.astro`, `Header.astro`, `Nav.astro`. None of those three lose
  their `<style>` block (Hero is in the scope-out list; Nav is in the
  scope-out list; `Header.astro` does not exist in the starter). The
  scoped `<style>` blocks that the refactor _does_ remove are on
  ordinary pages (`about.astro`, `contact.astro`, `blog/index.astro`,
  `projects/index.astro`), which the audit does not consider
  above-the-fold.

I2 (`global.css` defines `--color-*` tokens) and I3 (tri-state dark
mode wiring) are untouched.

The refactor is also consistent with the spec's "Components reference
tokens, never raw zinc" Requirement: the `Text` atom's `variantClasses`
table references token-mapped utilities (`text-fg-muted`,
`text-fg-subtle`, `bg-surface-2`, `border-border`) and the existing
zinc audit will continue to pass.

### `registry-atoms`

- **I1** — "No React / Vue / Svelte / Radix imports in `base/`."
  Audit: `node scripts/audit/no-react-in-atoms.mjs`.
  Status: **preserved**. No client framework imports are added.

- **I2** — "No default exports in atom source files."
  Audit: `node scripts/audit/no-react-in-atoms.mjs --named-only`.
  Status: **preserved**. The audit excludes `.astro` default exports
  by design (the component itself); `text.astro` keeps its existing
  shape.

- **I3** — "Every atom in `registry.json` has at least `cn` in
  `registryDependencies`."
  Audit: `node scripts/audit/no-react-in-atoms.mjs --registry`.
  Status: **preserved**. The `text` entry in `registry.json` already
  lists `["cn"]`; no manifest change is required unless a new file is
  added to the atom (it is not).

- **I4** — "Compound families live in `base/<family>/`."
  Audit: `node scripts/audit/no-react-in-atoms.mjs --family-layout`.
  Status: **preserved**. `text` is a single-file atom, not a family.

The implementer MUST run `pnpm audit:invariants --change
starter-use-the-text-component-for-all-t` and capture the output under
`openspec/changes/starter-use-the-text-component-for-all-t/runs/<ts>/audit.md`.

No new invariant is proposed by this change — see
`specs/templates-css-tokens/spec.md` and `specs/registry-atoms/spec.md`
in this change folder. The "use `<Text>` for body copy and headings"
guarantee is a _one-time refactor_, not a long-lived audited rule.
Encoding it as an audit would require a heuristic that can distinguish
"body copy" from "chrome label" — and the precedent for hard cases is
`templates-i18n` I6 ("`LocaleSwitcher` present in chrome, hides
unlocalized items — manual (no static audit yet)"). The reviewer's
visual sweep is the live guard.

## Performance budget applicability

The feature's capabilities (`templates-css-tokens`, `registry-atoms`)
both match `/^(templates|registry)-/`, so the `feature_list.json` rule
`require_perf_budget_to_close_when` applies. The implementer MUST run
the perf budget check (typically `pnpm perf:budget`, or whatever the
harness dispatches) and capture the report under
`openspec/changes/starter-use-the-text-component-for-all-t/runs/<ts>/perf.txt`.

Expected perf shape:

- **LCP**: page headers across about/contact/blog/projects move from
  scoped `<style>` to Tailwind utilities (via the `Text` atom's
  `variantClasses`). Tailwind v4 utilities are bundled in the page's
  CSS layer; Beasties inlines critical CSS at build time. The hero
  page (`index.astro`) keeps `Hero.astro` with its scoped style, so
  the LCP candidate (the hero title) is unchanged. Non-hero page
  headers may shift LCP slightly: their text content is now rendered
  by an atom whose classes are below-the-fold-style Tailwind. Beasties
  should still pick the page header's classes as critical because they
  appear at the top of the document; if it does not, LCP regresses by
  the time it takes to download the deferred stylesheet (typically
  negligible on the static budget). Confirm via `pnpm perf:budget`.

- **CLS**: `<Text>` renders `m-0` by default and applies the variant's
  `leading-` value; no layout-affecting attribute changes between the
  raw heading and the atomized heading. Hero text-wrap and balance stay
  on Hero (out of scope). Page headers were already `margin: 0 0
0.75rem` / `margin: 0` via scoped styles — the atom's `m-0` plus a
  wrapper `mb-*` is equivalent. CLS should stay 0.

- **JS / bundle**: no JS added. The atom is template-only Astro markup.

- **CSS**: the inline scoped styles deleted on `.page-header h1` /
  `.lede` / `.post-card-body h2` / etc. are replaced by Tailwind
  utility classes referenced in the atom. Tailwind v4 de-dupes; net
  CSS size should drop slightly because the same utilities are now
  reused across pages instead of each page repeating its own scoped
  rules.

If LCP / CLS / TBT cross the budget, the implementer should:

1. Confirm Beasties is picking the page header utilities (look at the
   generated `<style>` blob in the built HTML).
2. If not, move the page header back to a scoped `<style>` block on
   that specific page and document the exception in
   `runs/<ts>/perf.txt`. Refactor stays everywhere else.

## Rejected alternative

**Add a new long-lived audit (`scripts/audit/use-text-atom.mjs`) that
enforces "no raw `<h1>`–`<h6>` or `<p>` with typography utilities in
the starter".** Rejected because:

1. The audit needs a maintained allow-list (Hero, Nav, CookieBanner,
   any future scoped-style component) and a "body vs chrome" heuristic.
   Both are noisy and high-touch.
2. The issue is a one-time alignment — every reasonable place to use
   `<Text>` is enumerated in `## Files touched`. After the refactor,
   reviewers (human + the existing audit suite + visual check during
   `pnpm scaffold:test`) catch the regression on new code with low
   cost. Encoding a fuzzy rule into a script trades cheap human
   judgement for false-positive maintenance.
3. The precedent for "policy that isn't statically auditable" is
   `templates-i18n` I6 (manual until automated). We can revisit if
   regressions accumulate.

**Move the MDX `<slot />` body of articles / legal pages into `<Text>`
via a remark/rehype plugin.** Rejected because:

1. The MDX pipeline transforming `# Heading` to `<Text variant="h1">`
   would require a custom remark plugin or component-mapping (`MDX
components` prop). That's an architectural change the issue does not
   call out.
2. The `.prose` global stylesheet already centralises MDX typography in
   one place (in two layouts) — moving each `<p>` and `<h2>` into
   `<Text>` would scatter rules across many runtime calls without an
   ownership benefit (the prose styles ship in the template; users own
   them already).
3. If the user later wants MDX-through-Text, they can add an `mdx:
{components: ...}` mapping. That's a separate change with a separate
   spec.
