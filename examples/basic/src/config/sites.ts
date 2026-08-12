import { defineSiteRegistry } from "opensitestack";

export const siteRegistry = defineSiteRegistry({
  sites: [
    {
      id: "alpha",
      name: "Alpha Example",
      domain: "alpha.example",
      developmentHosts: ["localhost", "127.0.0.1", "[::1]"],
      theme: "alpha",
    },
    {
      id: "beta",
      name: "Beta Example",
      domain: "beta.example",
      developmentHosts: ["beta.localhost"],
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
