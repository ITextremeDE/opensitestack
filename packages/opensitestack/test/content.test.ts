import { describe, expect, it, vi } from "vitest";

import { defineSiteRegistry, resolveContent } from "../src";

const registry = defineSiteRegistry({
  sites: [
    { id: "alpha", name: "Alpha", domain: "alpha.example", theme: "alpha" },
    { id: "beta", name: "Beta", domain: "beta.example", theme: "beta" },
  ],
  groups: [
    { id: "shared", name: "Shared", siteIds: ["alpha", "beta"] },
  ],
});

describe("resolveContent", () => {
  it("prefers a complete site override", async () => {
    const readGroup = vi.fn(async () => "group");
    const result = await resolveContent({
      registry,
      siteId: "alpha",
      source: { kind: "group", id: "shared" },
      readSite: async () => "site",
      readGroup,
    });

    expect(result).toEqual({
      value: "site",
      source: { kind: "site", id: "alpha" },
    });
    expect(readGroup).not.toHaveBeenCalled();
  });

  it("falls back to exactly one explicit group source", async () => {
    const result = await resolveContent({
      registry,
      siteId: "alpha",
      source: { kind: "group", id: "shared" },
      readSite: async () => null,
      readGroup: async () => "group",
    });

    expect(result).toEqual({
      value: "group",
      source: { kind: "group", id: "shared" },
    });
  });

  it("rejects inheritance from another site", async () => {
    await expect(
      resolveContent({
        registry,
        siteId: "alpha",
        source: { kind: "site", id: "beta" },
        readSite: async () => null,
        readGroup: async () => null,
      }),
    ).rejects.toThrow("cannot inherit content from site beta");
  });

  it("rejects a group source outside the site's membership", async () => {
    const isolatedRegistry = defineSiteRegistry({
      sites: [
        { id: "alpha", name: "Alpha", domain: "alpha.example", theme: "a" },
        { id: "beta", name: "Beta", domain: "beta.example", theme: "b" },
      ],
      groups: [{ id: "alpha-group", name: "Alpha", siteIds: ["alpha"] }],
    });

    await expect(
      resolveContent({
        registry: isolatedRegistry,
        siteId: "beta",
        source: { kind: "group", id: "alpha-group" },
        readSite: async () => null,
        readGroup: async () => "group",
      }),
    ).rejects.toThrow("is not a member of group alpha-group");
  });
});
