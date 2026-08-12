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

  it("resolves one explicit content group for a site area", () => {
    const registry = defineSiteRegistry({
      sites: [
        {
          id: "alpha",
          name: "Alpha",
          domain: "alpha.example",
          canonicalOrigin: "https://alpha.example",
          metadata,
          contentAreas: { legal: { groupId: "shared" } },
          theme: "a",
        },
      ],
      groups: [{ id: "shared", name: "Shared", siteIds: ["alpha"] }],
    });

    expect(registry.getContentGroup("alpha", "legal")?.id).toBe("shared");
    expect(registry.getContentGroup("alpha", "news")).toBeNull();
  });

  it("rejects a content source that references an unknown group", () => {
    expect(() =>
      defineSiteRegistry({
        sites: [
          {
            id: "alpha",
            name: "Alpha",
            domain: "alpha.example",
            canonicalOrigin: "https://alpha.example",
            metadata,
            contentAreas: { legal: { groupId: "missing" } },
            theme: "a",
          },
        ],
      }),
    ).toThrow(expect.objectContaining({ code: "UNKNOWN_CONTENT_GROUP" }));
  });

  it("rejects content inheritance without explicit group membership", () => {
    expect(() =>
      defineSiteRegistry({
        sites: [
          {
            id: "alpha",
            name: "Alpha",
            domain: "alpha.example",
            canonicalOrigin: "https://alpha.example",
            metadata,
            contentAreas: { legal: { groupId: "beta-group" } },
            theme: "a",
          },
          {
            id: "beta",
            name: "Beta",
            domain: "beta.example",
            canonicalOrigin: "https://beta.example",
            metadata,
            theme: "b",
          },
        ],
        groups: [{ id: "beta-group", name: "Beta", siteIds: ["beta"] }],
      }),
    ).toThrow(expect.objectContaining({ code: "CONTENT_GROUP_MEMBERSHIP" }));
  });

  it("rejects multiple or site-to-site sources by schema", () => {
    for (const invalidSource of [
      { groupIds: ["one", "two"] },
      { groupId: "one", fallbackGroupId: "two" },
      { siteId: "another-site" },
    ]) {
      expect(() =>
        defineSiteRegistry({
          sites: [
            {
              id: "alpha",
              name: "Alpha",
              domain: "alpha.example",
              canonicalOrigin: "https://alpha.example",
              metadata,
              contentAreas: { legal: invalidSource } as never,
              theme: "a",
            },
          ],
        }),
      ).toThrow(expect.objectContaining({ code: "INVALID_DEFINITION" }));
    }
  });

  it("accepts provider-neutral site integration references", () => {
    const registry = defineSiteRegistry({
      sites: [
        {
          id: "alpha",
          name: "Alpha",
          domain: "alpha.example",
          canonicalOrigin: "https://alpha.example",
          metadata,
          integrations: {
            consent: {
              adapterId: "site-consent",
              policyVersion: "2026-08",
              purposes: ["analytics"],
            },
            analytics: {
              adapterId: "site-analytics",
              consentPurpose: "analytics",
            },
            forms: { contact: { adapterId: "contact-delivery" } },
          },
          theme: "a",
        },
      ],
    });

    expect(registry.getSite("alpha")?.integrations).toMatchObject({
      analytics: { adapterId: "site-analytics" },
      forms: { contact: { adapterId: "contact-delivery" } },
    });
  });

  it("rejects analytics without a declared matching consent purpose", () => {
    for (const integrations of [
      {
        analytics: {
          adapterId: "site-analytics",
          consentPurpose: "analytics",
        },
      },
      {
        consent: {
          adapterId: "site-consent",
          policyVersion: "2026-08",
          purposes: ["marketing"],
        },
        analytics: {
          adapterId: "site-analytics",
          consentPurpose: "analytics",
        },
      },
    ]) {
      expect(() =>
        defineSiteRegistry({
          sites: [
            {
              id: "alpha",
              name: "Alpha",
              domain: "alpha.example",
              canonicalOrigin: "https://alpha.example",
              metadata,
              integrations: integrations as never,
              theme: "a",
            },
          ],
        }),
      ).toThrow(expect.objectContaining({ code: "INVALID_DEFINITION" }));
    }
  });

  it("rejects duplicate consent purposes and malformed adapter ids", () => {
    for (const integrations of [
      {
        consent: {
          adapterId: "site-consent",
          policyVersion: "2026-08",
          purposes: ["analytics", "analytics"],
        },
      },
      { forms: { contact: { adapterId: "Provider Name" } } },
    ]) {
      expect(() =>
        defineSiteRegistry({
          sites: [
            {
              id: "alpha",
              name: "Alpha",
              domain: "alpha.example",
              canonicalOrigin: "https://alpha.example",
              metadata,
              integrations: integrations as never,
              theme: "a",
            },
          ],
        }),
      ).toThrow(expect.objectContaining({ code: "INVALID_DEFINITION" }));
    }
  });
});
