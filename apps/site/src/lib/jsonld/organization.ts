import type { Organization } from 'schema-dts';

import { siteConfig } from '@/config/site';

import { absoluteUrl, compact, entityId } from './types';

/**
 * Site-wide Organization schema. Identifies the site publisher in SERPs and
 * provides the canonical reference target for `BlogPosting.publisher` etc.
 */
export function organizationSchema(locale: string): Organization {
  const org = siteConfig.organization[locale] ?? siteConfig.organization[siteConfig.defaultLocale]!;
  const sameAs = Object.values(siteConfig.social).filter(
    (v): v is string => typeof v === 'string' && v.length > 0
  );

  return compact({
    '@type': 'Organization',
    '@id': entityId('organization'),
    name: org.name,
    legalName: org.legalName,
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(siteConfig.logo),
    },
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  }) as Organization;
}
