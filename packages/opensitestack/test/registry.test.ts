import { describe, expect, it } from "vitest";

import { defineSiteRegistry, normalizeHost } from "../src";

describe("normalizeHost", () => {
  it("normalizes ports, casing, proxy lists, and IPv6 hosts", () => {
    expect(normalizeHost("Example.COM:3000")).toBe("example.com");
    expect(normalizeHost("alpha.test, proxy.internal")).toBe("alpha.test");
    expect(normalizeHost("[::1]:3000")).toBe("[::1]");
  });
});

describe("SiteRegistry", () => {
  it("resolves production and development hosts", () => {
    const registry = defineSiteRegistry({
      sites: [
        {
          id: "alpha",
          name: "Alpha",
          domain: "alpha.example",
          developmentHosts: ["localhost"],
          theme: "alpha",
        },
      ],
    });

    expect(registry.getSiteByHost("alpha.example")?.id).toBe("alpha");
    expect(registry.getSiteByHost("localhost:3000")?.id).toBe("alpha");
    expect(registry.getSiteByHost("unknown.example")).toBeNull();
  });

  it("rejects duplicate hosts", () => {
    expect(() =>
      defineSiteRegistry({
        sites: [
          { id: "alpha", name: "Alpha", domain: "same.example", theme: "a" },
          { id: "beta", name: "Beta", domain: "same.example", theme: "b" },
        ],
      }),
    ).toThrow("assigned to both alpha and beta");
  });

  it("rejects unknown group members", () => {
    expect(() =>
      defineSiteRegistry({
        sites: [
          { id: "alpha", name: "Alpha", domain: "alpha.example", theme: "a" },
        ],
        groups: [{ id: "group", name: "Group", siteIds: ["missing"] }],
      }),
    ).toThrow("references unknown site missing");
  });
});
