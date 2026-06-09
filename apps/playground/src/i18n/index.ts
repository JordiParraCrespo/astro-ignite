/**
 * i18n helpers — UI string translations.
 *
 * Page SEO copy and shared UI strings live in `./{locale}.json`. Per-content
 * translations (blog posts, project entries) live in their content collections,
 * not here.
 */

import en from './en.json';
import es from './es.json';

import { siteConfig } from '@/config/site';

export type Locale = string;

/**
 * Translation dictionary shape — derived from `en.json` so the English
 * dictionary is the source of truth for keys.
 */
export type Dictionary = typeof en;

const dictionaries: Record<string, Dictionary> = {
  en,
  es,
};

/**
 * All dot-paths into a nested dictionary, typed as a literal-string union.
 * E.g. `"nav.home" | "seo.home.title" | ...`. Gives autocomplete on `t()`.
 */
type Path<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends object
      ? Path<T[K], `${P}${K}.`>
      : never;
}[keyof T & string];

export type TranslationKey = Path<Dictionary>;

/**
 * Look up a value at a dot-path. Returns the path itself if missing — surfaces
 * untranslated keys visibly without breaking the page.
 */
function get(dict: unknown, path: string): string {
  const parts = path.split('.');
  let current: unknown = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

/**
 * Resolve a locale to an available dictionary. Falls back to the default
 * locale if the requested one is missing, then to English as a last resort.
 */
function resolveDictionary(locale: Locale | undefined): Dictionary {
  if (locale && dictionaries[locale]) return dictionaries[locale]!;
  if (dictionaries[siteConfig.defaultLocale]) return dictionaries[siteConfig.defaultLocale]!;
  return en;
}

/**
 * Curry a translator bound to a specific locale.
 *
 * Usage:
 *   const t = useTranslations(Astro.currentLocale);
 *   <h1>{t('seo.home.title')}</h1>
 *
 * For interpolation:
 *   t('blog.readingTime', { minutes: 7 })
 */
export function useTranslations(locale: Locale | undefined) {
  const dict = resolveDictionary(locale);
  return function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    let value = get(dict, key);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return value;
  };
}

/**
 * Resolve a localized value to a single string for `locale`, falling back to
 * the default locale. Accepts a plain string (already locale-agnostic — e.g. a
 * string `defaultOgImage`) or a `Record<locale, string>` map, which is the
 * shape `siteConfig` fields, OG images, and content `bio` use. Returns
 * `undefined` only when neither `locale` nor the default has an entry.
 */
export function localize(
  value: string | Record<string, string | undefined> | undefined,
  locale: Locale
): string | undefined {
  if (value == null || typeof value === 'string') return value ?? undefined;
  return value[locale] ?? value[siteConfig.defaultLocale];
}

/**
 * Best-effort path translation between locales.
 *
 * Astro's getRelativeLocaleUrl handles the locale prefix; this helper handles
 * cases where you want to know if a sibling translation exists for the
 * current path. Returns the URL unchanged if no mapping is needed.
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  const segments = path.split('/').filter(Boolean);
  // Strip existing locale prefix if present
  if (segments[0] && siteConfig.locales.includes(segments[0])) {
    segments.shift();
  }
  const prefix = locale === siteConfig.defaultLocale ? '' : `/${locale}`;
  return `${prefix}/${segments.join('/')}`.replace(/\/$/, '') || '/';
}
