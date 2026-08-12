import { describe, expect, it } from "vitest";

import {
  createCanonicalUrl,
  createPublicationEntries,
  projectPublicationEntries,
  type ContentDocument,
  type SiteDefinition,
} from "../src";

const site: SiteDefinition = {
  id: "alpha",
  name: "Alpha",
  domain: "alpha.example",
  canonicalOrigin: "https://alpha.example",
  metadata: {
    title: "Alpha",
    description: "Alpha site",
    locale: "en",
  },
  theme: "alpha",
};

function document(
  overrides: Partial<ContentDocument> = {},
): ContentDocument {
  return {
    id: "article",
    slug: "articles/article",
    title: "Article",
    summary: "A published article.",
    status: "published",
    indexable: true,
    publishedAt: "2026-08-11T10:00:00Z",
    tags: [],
    body: "Article body",
    ...overrides,
  };
}

describe("publication entries", () => {
  it("keeps only content that is published, due and indexable", () => {
    const entries = createPublicationEntries({
      site,
      now: new Date("2026-08-12T12:00:00Z"),
      candidates: [
        { content: document(), pathname: "/articles/article" },
        {
          content: document({ id: "draft", status: "draft" }),
          pathname: "/draft",
        },
        {
          content: document({ id: "private", indexable: false }),
          pathname: "/private",
        },
        {
          content: document({
            id: "future",
            publishedAt: "2026-08-13T10:00:00Z",
          }),
          pathname: "/future",
        },
      ],
    });

    expect(entries).toEqual([
      {
        content: document(),
        pathname: "/articles/article",
        siteId: "alpha",
        canonicalUrl: "https://alpha.example/articles/article",
      },
    ]);
  });

  it("builds canonicals on the selected site and rejects unsafe paths", () => {
    expect(createCanonicalUrl(site, "/about")).toBe(
      "https://alpha.example/about",
    );
    expect(() => createCanonicalUrl(site, "https://other.example/about")).toThrow();
    expect(() => createCanonicalUrl(site, "//other.example/about")).toThrow();
    expect(() => createCanonicalUrl(site, "/about?preview=1")).toThrow();
  });

  it("rejects duplicate canonical URLs", () => {
    expect(() =>
      createPublicationEntries({
        site,
        candidates: [
          { content: document({ id: "one" }), pathname: "/same" },
          { content: document({ id: "two" }), pathname: "/same" },
        ],
      }),
    ).toThrow("Duplicate publication URL");
  });

  it("projects the filtered collection for search and feed adapters", () => {
    const entries = createPublicationEntries({
      site,
      candidates: [{ content: document(), pathname: "/article" }],
    });

    expect(
      projectPublicationEntries(entries, (entry) => ({
        id: entry.content.id,
        url: entry.canonicalUrl,
      })),
    ).toEqual([{ id: "article", url: "https://alpha.example/article" }]);
  });
});
