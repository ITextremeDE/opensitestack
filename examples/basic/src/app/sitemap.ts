import { createNextSitemap } from "opensitestack/next";

import { getExamplePublicationEntries } from "@/lib/example-content";
import { getCurrentSite } from "@/lib/current-site";

export default async function sitemap() {
  const site = await getCurrentSite();
  const entries = await getExamplePublicationEntries(site.id);
  return createNextSitemap(site, entries);
}
