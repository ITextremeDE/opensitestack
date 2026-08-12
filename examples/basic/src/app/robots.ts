import { createNextRobots } from "opensitestack/next";

import { getCurrentSite } from "@/lib/current-site";

export default async function robots() {
  return createNextRobots(await getCurrentSite());
}
