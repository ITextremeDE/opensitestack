import { describe, expect, it, vi } from "vitest";

import { defineSiteRegistry, resolveContent } from "../src";

const metadata = {
  title: "Example",
  description: "Example site",
  locale: "en",
};

const registry = defineSiteRegistry({
  sites: [
    {
      id: "alpha",
      name: "Alpha",
      domain: "alpha.example",
      canonicalOrigin: "https://alpha.example",
      metadata,
      contentAreas: { home: { groupId: "shared" } },
      theme: "alpha",
    },
    {
      id: "beta",
      name: "Beta",
      domain: "beta.example",
      canonicalOrigin: "https://beta.example",
      metadata,
      contentAreas: { home: { groupId: "shared" } },
      theme: "beta",
    },
    {
      id: "standalone",
      name: "Standalone",
      domain: "standalone.example",
      canonicalOrigin: "https://standalone.example",
      metadata,
      theme: "standalone",
    },
  ],
  groups: [
    { id: "shared", name: "Shared", siteIds: ["alpha", "beta"] },
  ],
});

describe("resolveContent", () => {
  it("prefers a complete site override without reading the group", async () => {
    const readGroup = vi.fn(async () => ({ title: "group", legal: "group" }));
    const result = await resolveContent({
      registry,
      siteId: "alpha",
      contentArea: "home",
      readSite: async () => ({ title: "site" }),
      readGroup,
    });

    expect(result).toEqual({
      value: { title: "site" },
      source: { kind: "site", id: "alpha" },
    });
    expect(readGroup).not.toHaveBeenCalled();
  });

  it("falls back to the one group configured for the content area", async () => {
    const readGroup = vi.fn(async () => "group");
    const result = await resolveContent({
      registry,
      siteId: "alpha",
      contentArea: "home",
      readSite: async () => null,
      readGroup,
    });

    expect(result).toEqual({
      value: "group",
      source: { kind: "group", id: "shared" },
    });
    expect(readGroup).toHaveBeenCalledExactlyOnceWith("shared");
  });

  it("returns null when the configured group has no value", async () => {
    await expect(
      resolveContent({
        registry,
        siteId: "beta",
        contentArea: "home",
        readSite: async () => null,
        readGroup: async () => null,
      }),
    ).resolves.toBeNull();
  });

  it("returns null without reading a group when no inheritance is configured", async () => {
    const readGroup = vi.fn(async () => "unexpected");
    await expect(
      resolveContent({
        registry,
        siteId: "standalone",
        contentArea: "home",
        readSite: async () => null,
        readGroup,
      }),
    ).resolves.toBeNull();
    expect(readGroup).not.toHaveBeenCalled();
  });

  it("rejects an unknown site before reading any source", async () => {
    const readSite = vi.fn(async () => null);
    await expect(
      resolveContent({
        registry,
        siteId: "missing",
        contentArea: "home",
        readSite,
        readGroup: async () => null,
      }),
    ).rejects.toMatchObject({ code: "UNKNOWN_SITE" });
    expect(readSite).not.toHaveBeenCalled();
  });
});
