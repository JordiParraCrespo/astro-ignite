# Audit — docs-match-starter-perf-sitemap-config

Generated: 2026-05-19T03:36:09.219Z
Change: openspec/changes/docs-match-starter-perf-sitemap-config/

## Results
| Audit | Status | Notes |
|-------|--------|-------|
| `node scripts/perf/run.mjs --critical-css` | ✅ PASS |  |
| `node scripts/perf/run.mjs --deps` | ✅ PASS |  |
| `node scripts/perf/run.mjs --transfer` | ❌ FAIL |  |
| `node scripts/perf/run.mjs --page /` | ❌ FAIL |  |
| `node scripts/perf/run.mjs --page /quick-start` | ❌ FAIL |  |
| `jsonld-graph` | ✅ PASS | JSON-LD graph clean |
| `tokens-only` | ❌ FAIL | 2 violation(s) |
| `sitemap-priority` | ✅ PASS | scanned 2 template(s) |

## Failed audits
### node scripts/perf/run.mjs --transfer
```
❌ Total transfer — not yet wired; run after Lighthouse integration lands
```

### node scripts/perf/run.mjs --page /
```
❌ lighthouse binary — lighthouse not installed (try `pnpm dlx lighthouse` or install Chrome for Testing). Skipping Lighthouse run; see scripts/doctor/chrome-installed.mjs
❌ Lighthouse budget — skipped — no lighthouse binary
```

### node scripts/perf/run.mjs --page /quick-start
```
❌ lighthouse binary — lighthouse not installed (try `pnpm dlx lighthouse` or install Chrome for Testing). Skipping Lighthouse run; see scripts/doctor/chrome-installed.mjs
❌ Lighthouse budget — skipped — no lighthouse binary
```

### tokens-only
```
❌ tokens-only FAIL — 2 violation(s)
 packages/templates/docs/src/config/site.ts:68 — themeColor: '#fafafa',
 packages/templates/starter/src/config/site.ts:107 — themeColor: '#0a0a0a',
```

