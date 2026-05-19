# Audit — migrate-docs-template-to-tailwind-css

Generated: 2026-05-19T01:17:40.303Z
Change: openspec/changes/migrate-docs-template-to-tailwind-css/

## Results
| Audit | Status | Notes |
|-------|--------|-------|
| `tokens-only` | ❌ FAIL | 2 violation(s) |
| `tokens-only` | ❌ FAIL | 2 violation(s) |
| `tokens-only` | ❌ FAIL | 2 violation(s) |
| `tokens-only` | ❌ FAIL | 2 violation(s) |
| `i18n-parallels` | ✅ PASS | scanned 2 template(s) |
| `i18n-parallels` | ✅ PASS | scanned 2 template(s) |
| `i18n-parallels` | ✅ PASS | scanned 2 template(s) |
| `i18n-parallels` | ✅ PASS | scanned 2 template(s) |
| `internal-links-localized` | ❌ FAIL | 1 hardcoded internal link(s) |
| `consent-gated-analytics` | ✅ PASS | consent + banner + policy + boundary all clean |
| `consent-gated-analytics` | ❌ FAIL | 1 violation(s) |
| `consent-gated-analytics` | ❌ FAIL | 2 violation(s) |
| `consent-gated-analytics` | ✅ PASS | consent + banner + policy + boundary all clean |
| `jsonld-graph` | ✅ PASS | JSON-LD graph clean |

## Failed audits
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

### internal-links-localized
```
❌ internal-links-localized FAIL — 1 hardcoded internal link(s)
 packages/templates/docs/src/components/docs/SidebarNav.astro:69 — <Brand href="/" variant="lockup" size={0.42} />
```

### consent-gated-analytics
```
❌ consent-gated-analytics FAIL — 1 violation(s)
 packages/templates/starter/src/layouts/ArticleLayout.astro — base layout does not render CookieBanner
```

### consent-gated-analytics
```
❌ consent-gated-analytics FAIL — 2 violation(s)
 packages/templates/docs/src/components/legal/CookieBanner.astro — CookieBanner present but no /legal/cookies(.astro|.mdx) page
 packages/templates/starter/src/components/legal/CookieBanner.astro — CookieBanner present but no /legal/cookies(.astro|.mdx) page
```

