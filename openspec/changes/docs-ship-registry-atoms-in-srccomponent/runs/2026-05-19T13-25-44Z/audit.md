# Audit — docs-ship-registry-atoms-in-srccomponent

Generated: 2026-05-19T13:40:04.533Z
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
