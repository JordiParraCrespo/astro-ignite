# i18n

Locale dictionaries + translation helpers. Pairs with the parallel-route
invariant in the root `AGENTS.md`.

## Files

- `en.json`, `es.json` — message dictionaries. `en` is the shape of
  record (`Dictionary` is `typeof en`); other locales must match its
  keys. `es.json` ships as an example — locales actually rendered are
  controlled by `siteConfig.locales` (default `['en']`).
- `index.ts` — `useTranslations(locale)` returns a typed `t(key)`;
  `localize(value, locale)` resolves a localized value
  (`string | Record<locale, string>`) to one string, falling back to the
  default locale (used for `siteConfig` fields, OG images, content `bio`);
  `getLocalizedPath(path, locale)`; plus the `Locale`, `Dictionary`, and
  `TranslationKey` types (`TranslationKey` is a typed dotted path into
  the dictionary).

## Rules

- For **links**, use Astro's `getRelativeLocaleUrl(lang, path)` (from
  `astro:i18n`) — `getLocalizedPath` is for internal path math, not a
  substitute for the locale-aware URL builder.
- Adding a locale: add `<locale>.json` with the **same keys as `en`**,
  add it to `siteConfig.locales`, and the `[lang]/` route tree +
  `{locale}/` content folders light up automatically.
- Never hardcode user-facing strings in components — read them via
  `useTranslations`.
