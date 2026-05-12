/**
 * Site-wide configuration.
 *
 * Edit this file once after scaffold; values cascade through SEO, JSON-LD,
 * sitemap, manifest, RSS, and OG defaults. Per-page props always override.
 *
 * Locale-keyed records use the locale codes you declared at scaffold time.
 * Add a new locale:
 *   1. Add it to `locales` and (optionally) `hreflang`
 *   2. Add a translation entry in every locale-keyed object below
 *   3. Add `src/i18n/<locale>.json`
 *   4. Add corresponding content collection folders under `src/content/*\/`
 */

export interface OrganizationInfo {
  name: string;
  legalName?: string;
}

export interface SiteConfig {
  /** Canonical site URL (no trailing slash). */
  url: string;

  /** Default locale used for `prefixDefaultLocale: false`. */
  defaultLocale: string;

  /** All supported locales. First-locale convention: defaultLocale comes first. */
  locales: string[];

  /** Optional hreflang region overrides per locale (e.g. en → en-US). */
  hreflang: Record<string, string>;

  /** Site display name per locale — used in <title>, manifest, OG. */
  name: Record<string, string>;

  /** Tagline / description per locale — used as default meta description. */
  description: Record<string, string>;

  /** Organization identity per locale — used in JSON-LD Organization schema. */
  organization: Record<string, OrganizationInfo>;

  /** Social profile URLs — used in JSON-LD `sameAs`. Empty values dropped. */
  social: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    mastodon?: string;
    bluesky?: string;
  };

  /** Site logo (relative to /, used as Organization.logo). */
  logo: string;

  /** Default OG image — single URL or per-locale record. */
  defaultOgImage: string | Record<string, string>;

  /** Default Twitter card handle (e.g. `@you`). Optional. */
  twitterHandle?: string;

  /** Theme color used in manifest + meta tag. */
  themeColor: string;

  /** Background color used in manifest. */
  backgroundColor: string;
}

export const siteConfig: SiteConfig = {
  url: 'https://astroignite.dev',
  defaultLocale: 'en',
  locales: ['en', 'es'],

  hreflang: {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    pt: 'pt-PT',
    it: 'it-IT',
  },

  name: {
    en: 'astro-ignite',
    es: 'astro-ignite',
  },

  description: {
    en: 'Production-grade Astro sites in five prompts. SEO, i18n, perf, legal, and email — pre-wired with sane defaults you actually own.',
    es: 'Sitios Astro listos para producción en cinco prompts. SEO, i18n, rendimiento, páginas legales y email — preconfigurados con valores sensatos que tú posees.',
  },

  organization: {
    en: { name: 'astro-ignite' },
    es: { name: 'astro-ignite' },
  },

  social: {
    github: 'https://github.com/JordiParraCrespo/astro-ignite',
  },

  logo: '/favicon.svg',
  defaultOgImage: '/og/og-default.png',

  themeColor: '#0a0a0a',
  backgroundColor: '#ffffff',
};
