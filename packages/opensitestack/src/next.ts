import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata, MetadataRoute } from "next";

import type { ContentDocument } from "./content-schema";
import type { PublicationEntry } from "./publication";
import { assertEntryBelongsToSite } from "./seo";
import type { SiteDefinition } from "./types";
import type { SiteRegistry } from "./registry";

export function createCurrentSiteResolver(registry: SiteRegistry): {
  getCurrentSite: () => Promise<SiteDefinition>;
  getCurrentSiteOrNull: () => Promise<SiteDefinition | null>;
} {
  const getCurrentSiteOrNull = cache(async () => {
    const requestHeaders = await headers();
    return registry.getSiteByHost(requestHeaders.get("host"));
  });

  const getCurrentSite = cache(async () => {
    const site = await getCurrentSiteOrNull();
    if (!site) {
      notFound();
    }
    return site;
  });

  return { getCurrentSite, getCurrentSiteOrNull };
}

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
  return {
    rules: { userAgent: "*", allow: "/" },
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
