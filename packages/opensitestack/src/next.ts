import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

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
