import { createCurrentSiteResolver } from "opensitestack/next";

import { siteRegistry } from "@/config/sites";

export const { getCurrentSite, getCurrentSiteOrNull } =
  createCurrentSiteResolver(siteRegistry);
