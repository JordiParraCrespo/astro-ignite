/**
 * Site-wide configuration for the docs template.
 *
 * Edit this once after scaffold; values cascade through SEO, JSON-LD, sitemap.
 * The CLI replaces `url`, `defaultLocale`, and `locales` at scaffold time.
 */

export interface SiteConfig {
  url: string;
  defaultLocale: string;
  locales: string[];
  hreflang: Record<string, string>;
  name: Record<string, string>;
  description: Record<string, string>;
  organization: Record<string, { name: string; legalName?: string }>;
  social: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    mastodon?: string;
    bluesky?: string;
  };
  logo: string;
  defaultOgImage: string | Record<string, string>;
  /** Optional Twitter card handle (e.g. `@you`). */
  twitterHandle?: string;
  themeColor: string;
  /** Default theme on first visit when user has no stored preference. */
  defaultTheme: 'light' | 'dark' | 'system';
  /** Path that "/" redirects to — usually the first doc page. */
  homePath: string;
}

export const siteConfig: SiteConfig = {
  url: 'https://astro-ignite.dev',
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
    en: 'astro-ignite docs',
    es: 'astro-ignite docs',
  },

  description: {
    en: 'Documentation for astro-ignite — a shadcn-style CLI for Astro.',
    es: 'Documentación de astro-ignite — un CLI estilo shadcn para Astro.',
  },

  organization: {
    en: { name: 'Docs' },
    es: { name: 'Docs' },
  },

  social: {},

  logo: '/favicon.svg',
  defaultOgImage: '/og/og-default.png',

  themeColor: '#fafafa',
  // Docs sites read better in light by default — but the toggle still works.
  defaultTheme: 'light',
  homePath: '/introduction',
};
