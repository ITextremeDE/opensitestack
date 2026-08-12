import { resolveContent } from "opensitestack";

import { siteRegistry } from "@/config/sites";

const groupContent = new Map([
  ["example-group", "Shared once, rendered for every group site."],
]);

const siteContent = new Map([
  ["beta", "A complete Beta override. The group source stays unchanged."],
]);

export async function getExampleContent(siteId: string) {
  return resolveContent({
    registry: siteRegistry,
    siteId,
    source: { kind: "group", id: "example-group" },
    readSite: async (id) => siteContent.get(id) ?? null,
    readGroup: async (id) => groupContent.get(id) ?? null,
  });
}
