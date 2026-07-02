# i18n

Locale dictionaries + translation helpers. Pairs with the parallel-route
invariant in the root `AGENTS.md`.

## Files

- `en.json`, `es.json` — message dictionaries. `en` is the shape of
  record (`Dictionary` is `typeof en`); other locales must match its
  keys. Unlike the starter template's `['en']` default, apps/site ships
  `siteConfig.locales: ['en', 'es']` with `es` fully authored (real
  translated content under `content/blog/es/` and `content/legal/es/`)
  — Spanish is a live, actually-rendered locale here, not an example.
- `index.ts` — `useTranslations(locale)` returns a typed `t(key)`;
  `getLocalizedPath(path, locale)`; plus the `Locale`, `Dictionary`, and
  `TranslationKey` types (`TranslationKey` is a typed dotted path into
  the dictionary). Note: `localize()` is **absent** here — apps/site
  doesn't use localized siteConfig values; it lives in the starter
  template's `src/i18n/index.ts`.

## Rules

- For **links**, use Astro's `getRelativeLocaleUrl(lang, path)` (from
  `astro:i18n`) — `getLocalizedPath` is for internal path math, not a
  substitute for the locale-aware URL builder.
- Adding a locale: add `<locale>.json` with the **same keys as `en`**,
  add it to `siteConfig.locales`, and the `[lang]/` route tree +
  `{locale}/` content folders light up automatically.
- Never hardcode user-facing strings in components — read them via
  `useTranslations`.
