# Design: make-the-h1-contain-only-text

## Files touched

- MOD `apps/site/src/components/landing/HeroSection.astro` — collapse the
  two-part headline into a single `{t('landing.hero.headlineTail')}` text
  child of the `<h1>`. Remove the nested `<span class="text-fg-muted">`.
- MOD `apps/site/src/i18n/en.json` — delete the
  `landing.hero.headlineMuted` key.
- MOD `apps/site/src/i18n/es.json` — delete the
  `landing.hero.headlineMuted` key.

That is the full set. No new files, no deletions, no `packages/templates/*`
changes.

## Diff sketch

`HeroSection.astro` (lines 48–53):

```astro
-        <h1
-          class="m-0 hyphens-none break-normal text-[clamp(40px,5.6vw,80px)] font-medium leading-[0.95] tracking-[-0.05em] text-fg [overflow-wrap:normal] [text-wrap:balance]"
-        >
-          <span class="text-fg-muted">{t('landing.hero.headlineMuted')}</span>{' '}
-          {t('landing.hero.headlineTail')}
-        </h1>
+        <h1
+          class="m-0 hyphens-none break-normal text-[clamp(40px,5.6vw,80px)] font-medium leading-[0.95] tracking-[-0.05em] text-fg [overflow-wrap:normal] [text-wrap:balance]"
+        >
+          {t('landing.hero.headlineTail')}
+        </h1>
```

`en.json` and `es.json`: remove the `"headlineMuted": "..."` line from the
`landing.hero` object. Mind the trailing comma on the previous/following key.

## New signatures

None. No exported API changes. `TranslationKey` (the union type derived from
`typeof en`) loses one member; that is intentional and is the mechanism by
which a leftover `t('landing.hero.headlineMuted')` call would be caught at
typecheck.

## Invariants this change touches

The `templates-i18n` spec governs i18n behaviour for
`packages/templates/<kind>/`. Its audit table lists invariants
**I1–I6** (parallel routes, `getStaticPaths`, content collection layout,
`siteConfig.locales` default, `getRelativeLocaleUrl` for internal links,
`LocaleSwitcher` in chrome). **None of I1–I6 is touched by this change:**

- I1–I4: route/content-collection invariants — no pages or content
  collections move.
- I5: `getRelativeLocaleUrl` for internal links — no internal links
  change.
- I6: `LocaleSwitcher` presence — chrome is untouched.

The change is consistent with the spec's spirit (each locale dictionary
under `src/i18n/{locale}.json` stays in lockstep). The implicit "dictionary
parity across locales" property is enforced at the type level by
`Dictionary = typeof en` and `TranslationKey = Path<Dictionary>`
(`apps/site/src/i18n/index.ts:20,39`). Removing the key from `en.json`
narrows the type so any stray call site fails `pnpm typecheck`. Removing the
key from `es.json` keeps the dictionaries shape-aligned even though TS only
checks against `en`.

Audit commands relevant to this change (none should regress):

- `node scripts/audit/i18n-parallels.mjs` — runs against
  `packages/templates/*`, not `apps/site/`. Unaffected.
- `node scripts/audit/internal-links-localized.mjs` — unaffected; no
  link changes.
- `pnpm typecheck` — must stay green (this is the live guard).
- `pnpm build --filter @astro-ignite/site` — must stay green.

## Performance budget applicability

The feature's capability matches `/^templates-/`, so the harness rule
`require_perf_budget_to_close_when` applies. In practice the change
removes one inline `<span>` and reduces the dictionary by one short string
per locale:

- LCP: the `<h1>` is a likely LCP candidate. Its text content shrinks
  (no more "Astro sites," prefix), the font family does not change, and
  no images load. LCP should not regress; if it shifts at all it shifts
  smaller.
- CLS: no layout-affecting attributes change; `[text-wrap:balance]` is
  retained. The headline's flow box may end one line shorter on very
  narrow viewports — confirm CLS = 0 in the implementer's Lighthouse
  run.
- Bundle/CSS: removes one `text-fg-muted` utility from the critical
  path within the hero `<h1>`; the utility itself is still used
  elsewhere on the page, so the compiled CSS does not shrink. JS bundle
  is unchanged.

The implementer should run `pnpm perf:budget` (or the equivalent
Lighthouse-budget check for `apps/site`) and capture the report under
`runs/<ts>/perf.txt`.

## Rejected alternative

**Keep both keys but collapse the rendered output to a single string.**
We considered concatenating
`t('landing.hero.headlineMuted') + ' ' + t('landing.hero.headlineTail')`
into a single `<h1>` text node, leaving the dictionary keys intact. Rejected
because:

1. The issue explicitly requires both `en.json` and `es.json` to drop
   the `headlineMuted` key.
2. Dead keys rot. Without the rendering call site, neither typecheck
   nor any audit catches a stale translation.
3. The translations baked the comma punctuation into the muted half
   ("Astro sites,") and the leading capitalization into the tail
   ("built for AI Agents."). Splicing them produces "Astro sites, built
   for AI Agents." — which is what the tail already is on its own
   semantically, but with redundant words and locale-specific
   punctuation drift between English ("Astro sites, built for…") and
   Spanish ("Sitios Astro, hechos para…"). The cleaner read of the
   issue is "the tail _is_ the headline now"; the prefix is being
   discarded, not concatenated.
