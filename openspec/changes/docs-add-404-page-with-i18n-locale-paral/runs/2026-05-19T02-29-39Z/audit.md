# Audit — docs-add-404-page-with-i18n-locale-paral

Generated: 2026-05-19T03:03:30.308Z
Change: openspec/changes/docs-add-404-page-with-i18n-locale-paral/

## Results
| Audit | Status | Notes |
|-------|--------|-------|
| `i18n-parallels` | ✅ PASS | scanned 2 template(s) |
| `i18n-parallels` | ✅ PASS | scanned 2 template(s) |
| `internal-links-localized` | ❌ FAIL | 1 hardcoded internal link(s) |
| `tokens-only` | ❌ FAIL | 2 violation(s) |
| `tokens-only` | ❌ FAIL | 2 violation(s) |
| `jsonld-graph` | ✅ PASS | JSON-LD graph clean |
| `jsonld-graph` | ✅ PASS | JSON-LD graph clean |
| `jsonld-graph` | ✅ PASS | JSON-LD graph clean |

## Failed audits
### internal-links-localized
```
❌ internal-links-localized FAIL — 1 hardcoded internal link(s)
 packages/templates/docs/src/components/docs/SidebarNav.astro:64 — <Brand href="/" variant="lockup" size={0.42} />
```

### tokens-only
```
❌ tokens-only FAIL — 2 violation(s)
 packages/templates/docs/src/config/site.ts:68 — themeColor: '#fafafa',
 packages/templates/starter/src/config/site.ts:107 — themeColor: '#0a0a0a',
```

### tokens-only
```
❌ tokens-only FAIL — 2 violation(s)
 packages/templates/docs/src/config/site.ts:68 — themeColor: '#fafafa',
 packages/templates/starter/src/config/site.ts:107 — themeColor: '#0a0a0a',
```

