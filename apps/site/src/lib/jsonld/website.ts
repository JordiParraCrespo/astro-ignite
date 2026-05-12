import type { WebSite } from 'schema-dts';

import { siteConfig } from '@/config/site';

import { compact, entityId } from './types';

/**
 * Site-wide WebSite schema. Anchors the search action and disambiguates the
 * site name for sitelinks.
 */
export function websiteSchema(locale: string): WebSite {
  const name = siteConfig.name[locale] ?? siteConfig.name[siteConfig.defaultLocale]!;
  const description =
    siteConfig.description[locale] ?? siteConfig.description[siteConfig.defaultLocale]!;

  return compact({
    '@type': 'WebSite',
    '@id': entityId('website'),
    name,
    description,
    url: siteConfig.url,
    inLanguage: locale,
    publisher: { '@id': entityId('organization') },
  }) as WebSite;
}
