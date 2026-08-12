import type { ContentDocument } from "./content-schema";
import { createCanonicalUrl, type PublicationEntry } from "./publication";
import type { SiteDefinition } from "./types";

export type StructuredData = Readonly<Record<string, unknown>>;

export function createWebsiteStructuredData(
  site: SiteDefinition,
): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.canonicalOrigin}/#website`,
    url: `${site.canonicalOrigin}/`,
    name: site.name,
    description: site.metadata.description,
    inLanguage: site.metadata.locale,
  };
}

export function createWebPageStructuredData<T extends ContentDocument>(
  site: SiteDefinition,
  entry: PublicationEntry<T>,
): StructuredData {
  assertEntryBelongsToSite(site, entry);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${entry.canonicalUrl}#webpage`,
    url: entry.canonicalUrl,
    name: entry.content.title,
    description: entry.content.summary,
    datePublished: entry.content.publishedAt,
    ...(entry.content.updatedAt
      ? { dateModified: entry.content.updatedAt }
      : {}),
    inLanguage: site.metadata.locale,
    isPartOf: { "@id": `${site.canonicalOrigin}/#website` },
  };
}

export function serializeStructuredData(value: StructuredData): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function assertEntryBelongsToSite<T extends ContentDocument>(
  site: SiteDefinition,
  entry: PublicationEntry<T>,
): void {
  if (
    entry.siteId !== site.id ||
    entry.canonicalUrl !== createCanonicalUrl(site, entry.pathname)
  ) {
    throw new TypeError(
      `Publication entry ${entry.canonicalUrl} does not belong to site ${site.id}`,
    );
  }
}
