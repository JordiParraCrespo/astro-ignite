# Audit — restructure-starter-template-component-o

Generated: 2026-05-18T16:25:36.216Z
Change: openspec/changes/restructure-starter-template-component-o/

## Results
| Audit | Status | Notes |
|-------|--------|-------|
| `i18n-parallels` | ✅ PASS | scanned 2 template(s) |
| `i18n-parallels` | ✅ PASS | scanned 2 template(s) |
| `i18n-parallels` | ✅ PASS | scanned 2 template(s) |
| `i18n-parallels` | ✅ PASS | scanned 2 template(s) |
| `internal-links-localized` | ❌ FAIL | 1 hardcoded internal link(s) |
| `tokens-only` | ❌ FAIL | 2 violation(s) |
| `tokens-only` | ❌ FAIL | 2 violation(s) |
| `jsonld-graph` | ✅ PASS | JSON-LD graph clean |
| `consent-gated-analytics` | ✅ PASS | consent + banner + policy + boundary all clean |
| `consent-gated-analytics` | ❌ FAIL | 1 violation(s) |
| `consent-gated-analytics` | ❌ FAIL | 2 violation(s) |
| `consent-gated-analytics` | ✅ PASS | consent + banner + policy + boundary all clean |
| `no-react-in-atoms` | ✅ PASS | scanned 32 file(s) |

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

