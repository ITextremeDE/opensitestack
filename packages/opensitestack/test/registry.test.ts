import { describe, expect, it } from "vitest";

import {
  defineSiteRegistry,
  normalizeHost,
  SiteRegistryError,
} from "../src";

const metadata = {
  title: "Example",
  description: "Example site",
  locale: "en",
};

describe("normalizeHost", () => {
  it("normalizes ports, casing, trailing dots, and IPv6 hosts", () => {
    expect(normalizeHost("Example.COM:3000")).toBe("example.com");
    expect(normalizeHost("Example.COM.")).toBe("example.com");
    expect(normalizeHost("[::1]:3000")).toBe("[::1]");
  });

  it("rejects ambiguous or malformed host values", () => {
    expect(normalizeHost("alpha.test, proxy.internal")).toBeNull();
    expect(normalizeHost("https://alpha.test")).toBeNull();
    expect(normalizeHost("user@alpha.test")).toBeNull();
    expect(normalizeHost("bad host")).toBeNull();
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
          canonicalOrigin: "https://alpha.example",
          metadata,
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
          { id: "alpha", name: "Alpha", domain: "same.example", canonicalOrigin: "https://same.example", metadata, theme: "a" },
          { id: "beta", name: "Beta", domain: "same.example", canonicalOrigin: "https://same.example", metadata, theme: "b" },
        ],
      }),
    ).toThrow(expect.objectContaining({ code: "DUPLICATE_HOST" }));
  });

  it("rejects duplicate development hosts across sites", () => {
    expect(() =>
      defineSiteRegistry({
        sites: [
          { id: "alpha", name: "Alpha", domain: "alpha.example", developmentHosts: ["localhost"], canonicalOrigin: "https://alpha.example", metadata, theme: "a" },
          { id: "beta", name: "Beta", domain: "beta.example", developmentHosts: ["LOCALHOST:3000"], canonicalOrigin: "https://beta.example", metadata, theme: "b" },
        ],
      }),
    ).toThrow(expect.objectContaining({ code: "DUPLICATE_HOST" }));
  });

  it("requires an HTTPS canonical origin matching the production domain", () => {
    for (const canonicalOrigin of [
      "http://alpha.example",
      "https://other.example",
      "https://alpha.example:8443",
      "https://alpha.example/path",
    ]) {
      expect(() =>
        defineSiteRegistry({
          sites: [{ id: "alpha", name: "Alpha", domain: "alpha.example", canonicalOrigin, metadata, theme: "a" }],
        }),
      ).toThrow(expect.objectContaining({ code: "INVALID_CANONICAL_ORIGIN" }));
    }
  });

  it("reports invalid definitions with a stable error type and code", () => {
    expect(() =>
      defineSiteRegistry({
        sites: [{ id: "Alpha", name: "Alpha", domain: "bad host", canonicalOrigin: "not-a-url", metadata, theme: "a" }],
      }),
    ).toThrow(expect.objectContaining({
      name: "SiteRegistryError",
      code: "INVALID_DEFINITION",
    } satisfies Partial<SiteRegistryError>));
  });

  it("rejects unknown group members", () => {
    expect(() =>
      defineSiteRegistry({
        sites: [
          { id: "alpha", name: "Alpha", domain: "alpha.example", canonicalOrigin: "https://alpha.example", metadata, theme: "a" },
        ],
        groups: [{ id: "group", name: "Group", siteIds: ["missing"] }],
      }),
    ).toThrow("references unknown site missing");
  });
});
