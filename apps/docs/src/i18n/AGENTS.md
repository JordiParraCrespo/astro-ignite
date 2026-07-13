# i18n

Locale dictionaries + translation helpers. Pairs with the parallel-route
invariant in the root `AGENTS.md`.

## Files

- `en.json`, `es.json` — message dictionaries. `en` defines the shape
  (`Dictionary` is `typeof en`); other locales must match its keys.
  Unlike the docs template's `['en']` default, apps/docs ships
  `siteConfig.locales: ['en', 'es']` with `es` fully authored — every
  doc and legal page has a real Spanish counterpart, and the
  `LocaleSwitcher` genuinely serves it.
- `index.ts` — `useTranslations(locale)` → typed `t(key)`;
  `getLocalizedPath(path, locale)`; plus `Locale`, `Dictionary`, and
  `TranslationKey` (a typed dotted path into the dictionary).

## Rules

- For **links**, use Astro's `getRelativeLocaleUrl(lang, path)` (from
  `astro:i18n`); `getLocalizedPath` is for internal path math only.
- Adding a locale: add `<locale>.json` with the **same keys as `en`**,
  add it to `siteConfig.locales`, and the `[lang]/` routes +
  `content/docs/{locale}/` folders light up automatically.
- Never hardcode user-facing strings — read them via `useTranslations`.
