# Audit — docs-add-footer-chrome-parity-with-start

Generated: 2026-05-19T14:19:13.560Z
Change: openspec/changes/docs-add-footer-chrome-parity-with-start/

## Results
| Audit | Status | Notes |
|-------|--------|-------|
| `i18n-parallels` | ✅ PASS | scanned 2 template(s) |
| `internal-links-localized` | ❌ FAIL | 1 hardcoded internal link(s) |
| `tokens-only` | ❌ FAIL | 2 violation(s) |
| `tokens-only` | ✅ PASS | --layered: deprecated no-op |

## Failed audits
### internal-links-localized
```
❌ internal-links-localized FAIL — 1 hardcoded internal link(s)
 packages/templates/docs/src/components/docs/SidebarNav.astro:70 — <Brand href="/" variant="lockup" size={0.42} />
```

### tokens-only
```
❌ tokens-only FAIL — 2 violation(s)
 packages/templates/docs/src/config/site.ts:68 — themeColor: '#fafafa',
 packages/templates/starter/src/config/site.ts:107 — themeColor: '#0a0a0a',
```

