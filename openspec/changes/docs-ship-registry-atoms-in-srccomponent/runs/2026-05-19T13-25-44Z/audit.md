# Audit — docs-ship-registry-atoms-in-srccomponent

Generated: 2026-05-19T13:31:40.378Z
Change: openspec/changes/docs-ship-registry-atoms-in-srccomponent/

## Results

| Audit                              | Status  | Notes              |
| ---------------------------------- | ------- | ------------------ |
| `no-react-in-atoms`                | ✅ PASS | scanned 32 file(s) |
| `no-react-in-atoms`                | ✅ PASS | scanned 32 file(s) |
| `tokens-only`                      | ❌ FAIL | 2 violation(s)     |
| `node scripts/perf/run.mjs --deps` | ✅ PASS |                    |

## Failed audits

### tokens-only

```
❌ tokens-only FAIL — 2 violation(s)
 packages/templates/docs/src/config/site.ts:68 — themeColor: '#fafafa',
 packages/templates/starter/src/config/site.ts:107 — themeColor: '#0a0a0a',
```

## Pre-existing baseline exception

Both `tokens-only` hits are **pre-existing baseline failures** that
predate this change. `git log --oneline -- <file>` shows both
`themeColor: '#…'` literals first appear in `f02e323 chore: initial
commit — astro-ignite v0.1.0 scaffold`. They are:

- `packages/templates/docs/src/config/site.ts:68` —
  `themeColor: '#fafafa'`
- `packages/templates/starter/src/config/site.ts:107` —
  `themeColor: '#0a0a0a'`

Tasks.md T13 and design.md § "Invariants this change touches" both
explicitly call this out as out-of-scope and as the baseline the
reviewer should expect.

This change introduces **zero new `tokens-only` violations** — the 32
files the `no-react-in-atoms` audit walks (registry source) and the
30 new atom files under `packages/templates/docs/src/components/ui/`
are byte-mirrors of registry-clean source.

### Cross-checks (T11, T12, T13)

- T11 byte-equality: every starter atom `diff -q`s identical with the
  docs-template copy and with the registry source. 31 files compared,
  zero diffs.
- T12 `no-react-in-atoms` and `no-react-in-atoms --named-only --registry
--family-layout`: both PASS (32 files scanned).
- T13 `tokens-only`: only the two pre-existing baseline literals
  surface; no new violations in the atoms or in `lib/toast.ts`.
- `node scripts/perf/run.mjs --deps`: PASS (12 starter / 8 docs runtime
  deps — same as `main`).
