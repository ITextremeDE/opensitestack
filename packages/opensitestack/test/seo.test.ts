import { describe, expect, it } from "vitest";

import {
  createPublicationEntries,
  createWebPageStructuredData,
  createWebsiteStructuredData,
  serializeStructuredData,
  type ContentDocument,
  type SiteDefinition,
} from "../src";
import {
  createNextMetadata,
  createNextRobots,
  createNextSitemap,
} from "../src/next";

const alpha: SiteDefinition = {
  id: "alpha",
  name: "Alpha",
  domain: "alpha.example",
  canonicalOrigin: "https://alpha.example",
  metadata: { title: "Alpha", description: "Alpha site", locale: "en" },
  theme: "alpha",
};

const beta: SiteDefinition = {
  ...alpha,
  id: "beta",
  name: "Beta",
  domain: "beta.example",
  canonicalOrigin: "https://beta.example",
  metadata: { title: "Beta", description: "Beta site", locale: "de-DE" },
  theme: "beta",
};

const content: ContentDocument = {
  id: "welcome",
  slug: "welcome",
  title: "Welcome <script>",
  summary: "Published page",
  status: "published",
  indexable: true,
  publishedAt: "2026-08-11T10:00:00Z",
  updatedAt: "2026-08-12T10:00:00Z",
  tags: [],
  body: "Welcome",
};

function entry(site: SiteDefinition) {
  return createPublicationEntries({
    site,
    candidates: [{ content, pathname: "/welcome" }],
  })[0]!;
}

describe("SEO outputs", () => {
  it("creates host-specific metadata and canonicals", () => {
    expect(createNextMetadata(alpha, entry(alpha))).toMatchObject({
      title: "Welcome <script>",
      alternates: { canonical: "https://alpha.example/welcome" },
      openGraph: { url: "https://alpha.example/welcome", siteName: "Alpha" },
    });
    expect(createNextMetadata(beta)).toMatchObject({
      title: "Beta",
      alternates: { canonical: "https://beta.example/" },
    });
  });

  it("rejects content from another site", () => {
    expect(() => createNextMetadata(beta, entry(alpha))).toThrow(
      "does not belong to site beta",
    );
  });

  it("creates host-specific robots and sitemap outputs", () => {
    expect(createNextRobots(alpha)).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://alpha.example/sitemap.xml",
      host: "https://alpha.example",
    });
    expect(createNextSitemap(alpha, [entry(alpha)])).toEqual([
      {
        url: "https://alpha.example/welcome",
        lastModified: "2026-08-12T10:00:00Z",
      },
    ]);
  });

  it("preserves validated site-specific robots exclusions", () => {
    expect(
      createNextRobots({
        ...alpha,
        robots: { disallow: ["/api/", "/preview/"] },
      }),
    ).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/preview/"],
      },
      sitemap: "https://alpha.example/sitemap.xml",
      host: "https://alpha.example",
    });
  });

  it("creates site-bound structured data and escapes HTML delimiters", () => {
    expect(createWebsiteStructuredData(beta)).toMatchObject({
      "@type": "WebSite",
      url: "https://beta.example/",
      inLanguage: "de-DE",
    });

    const jsonLd = createWebPageStructuredData(alpha, entry(alpha));
    expect(jsonLd).toMatchObject({
      "@type": "WebPage",
      url: "https://alpha.example/welcome",
    });
    expect(serializeStructuredData(jsonLd)).not.toContain("<script>");
    expect(serializeStructuredData(jsonLd)).toContain("\\u003cscript>");
  });
});
