import { defineSiteRegistry } from "opensitestack";

export const siteRegistry = defineSiteRegistry({
  sites: [
    {
      id: "alpha",
      name: "Alpha Example",
      domain: "alpha.example",
      developmentHosts: ["localhost", "127.0.0.1", "[::1]"],
      canonicalOrigin: "https://alpha.example",
      metadata: {
        title: "Alpha Example",
        description: "Alpha uses the shared example-group content.",
        locale: "en",
      },
      theme: "alpha",
    },
    {
      id: "beta",
      name: "Beta Example",
      domain: "beta.example",
      developmentHosts: ["beta.localhost"],
      canonicalOrigin: "https://beta.example",
      metadata: {
        title: "Beta Example",
        description: "Beta overrides the shared example-group content.",
        locale: "en",
      },
      theme: "beta",
    },
  ],
  groups: [
    {
      id: "example-group",
      name: "Example Group",
      siteIds: ["alpha", "beta"],
    },
  ],
});
