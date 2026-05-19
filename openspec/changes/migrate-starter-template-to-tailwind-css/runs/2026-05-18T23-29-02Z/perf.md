# Perf — migrate-starter-template-to-tailwind-css

Generated: 2026-05-19T00:43:23.891Z

## Findings
- ✅ packages/templates/starter dep count — 12 runtime deps
- ✅ packages/templates/docs dep count — 8 runtime deps
- ✅ Lighthouse binary — skipped — Lighthouse unavailable locally; CI workflow "Lighthouse CI (mobile)" is the authoritative gate
- ✅ Lighthouse budget — skipped — see binary note above; CI enforces the budget on every PR
- ✅ Lighthouse run — skipped — local runner not yet wired to a preview server; CI workflow "Lighthouse CI (mobile)" is the authoritative gate

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
