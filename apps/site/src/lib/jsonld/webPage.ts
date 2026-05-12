import type { AboutPage, CollectionPage, ContactPage, WebPage } from 'schema-dts';

import { absoluteUrl, compact, entityId } from './types';

export interface WebPageInput {
  url: string;
  title: string;
  description: string;
  inLanguage: string;
  image?: string;
  datePublished?: Date;
  dateModified?: Date;
}

type PageKind = 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';

function pageBase(input: WebPageInput, kind: PageKind) {
  const url = absoluteUrl(input.url);
  return compact({
    '@type': kind,
    '@id': `${url}#webpage`,
    name: input.title,
    description: input.description,
    url,
    inLanguage: input.inLanguage,
    isPartOf: { '@id': entityId('website') },
    primaryImageOfPage: input.image
      ? { '@type': 'ImageObject', url: absoluteUrl(input.image) }
      : undefined,
    datePublished: input.datePublished?.toISOString(),
    dateModified: input.dateModified?.toISOString(),
  });
}

export const webPageSchema = (input: WebPageInput): WebPage =>
  pageBase(input, 'WebPage') as WebPage;

export const aboutPageSchema = (input: WebPageInput): AboutPage =>
  pageBase(input, 'AboutPage') as AboutPage;

export const contactPageSchema = (input: WebPageInput): ContactPage =>
  pageBase(input, 'ContactPage') as ContactPage;

export const collectionPageSchema = (input: WebPageInput): CollectionPage =>
  pageBase(input, 'CollectionPage') as CollectionPage;
