# Perf — docs-add-404-page-with-i18n-locale-paral

Generated: 2026-05-19T03:04:02.789Z

## Findings

- ✅ packages/templates/starter dep count — 12 runtime deps
- ✅ packages/templates/docs dep count — 8 runtime deps
- ❌ lighthouse binary — lighthouse not installed (try `pnpm dlx lighthouse` or install Chrome for Testing). Skipping Lighthouse run; see scripts/doctor/chrome-installed.mjs
- ❌ Lighthouse budget — skipped — no lighthouse binary
- ❌ Lighthouse run — not yet wired to a preview server target; see AGENTS.md step 6

## Budget (canonical: openspec/specs/templates-perf/spec.md )

```json
{
  "$comment": "Canonical thresholds live in openspec/specs/templates-perf/spec.md scripts/doctor/perf-budget-baseline.mjs warns when these drift.",
  "lighthouse": {
    "mobile": {
      "scores": {
        "performance": 95,
        "accessibility": 95,
        "best-practices": 95,
        "seo": 95
      },
      "metrics": {
        "largest-contentful-paint": 2000,
        "interaction-to-next-paint": 200,
        "cumulative-layout-shift": 0.05,
        "total-blocking-time": 200
      }
    }
  },
  "transfer": {
    "home_kb_compressed_max": 150
  }
}
```
