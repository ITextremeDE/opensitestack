import type { Metadata, MetadataRoute } from "next";

import type { ContentDocument } from "./content-schema";
import type { PublicationEntry } from "./publication";
import { assertEntryBelongsToSite } from "./seo";
import type { SiteDefinition } from "./types";

export function createNextMetadata<T extends ContentDocument>(
  site: SiteDefinition,
  entry?: PublicationEntry<T>,
): Metadata {
  if (entry) {
    assertEntryBelongsToSite(site, entry);
  }

  const title = entry?.content.title ?? site.metadata.title;
  const description = entry?.content.summary ?? site.metadata.description;
  const canonicalUrl = entry?.canonicalUrl ?? `${site.canonicalOrigin}/`;

  return {
    metadataBase: new URL(site.canonicalOrigin),
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title,
      description,
      siteName: site.name,
      locale: site.metadata.locale,
    },
  };
}

export function createNextRobots(site: SiteDefinition): MetadataRoute.Robots {
  const disallow = site.robots?.disallow;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      ...(disallow && disallow.length > 0 ? { disallow: [...disallow] } : {}),
    },
    sitemap: `${site.canonicalOrigin}/sitemap.xml`,
    host: site.canonicalOrigin,
  };
}

export function createNextSitemap<T extends ContentDocument>(
  site: SiteDefinition,
  entries: readonly PublicationEntry<T>[],
): MetadataRoute.Sitemap {
  return entries.map((entry) => {
    assertEntryBelongsToSite(site, entry);
    return {
      url: entry.canonicalUrl,
      lastModified: entry.content.updatedAt ?? entry.content.publishedAt,
    };
  });
}
