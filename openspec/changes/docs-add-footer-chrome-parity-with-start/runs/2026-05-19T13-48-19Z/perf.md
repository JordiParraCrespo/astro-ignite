# Perf — docs-add-footer-chrome-parity-with-start

Generated: 2026-05-19T14:19:46.180Z

## Findings
- ✅ packages/templates/starter dep count — 12 runtime deps
- ✅ packages/templates/docs dep count — 8 runtime deps
- ✅ Lighthouse run — skipped — chrome not installed; run scripts/doctor/install-chrome.mjs

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
