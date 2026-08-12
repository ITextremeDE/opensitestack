# opensitestack

The `opensitestack` package provides the typed, site-neutral core and Next.js
request adapter used by OpenSiteStack applications.

The API is pre-1.0 and currently intended for development inside the
OpenSiteStack workspace.

## Site registry

`defineSiteRegistry` validates production domains, optional development hosts,
HTTPS canonical origins, and typed site metadata once at application startup.
Every normalized host must belong to exactly one site. Invalid definitions use
`SiteRegistryError` with stable error codes; malformed and unknown request hosts
resolve to `null`.

## Content sources

`contentDocumentSchema` defines IDs, route slugs, title, summary, lifecycle
status, indexability, publication timestamps, tags, and body. Content is
indexable by default and may opt out explicitly. `defineContentSchema` adds
project-specific fields without allowing replacement of those base fields.

A `ContentSourceAdapter` returns raw values plus stable source references.
`validateContentSource` validates every value, preserves provenance, and rejects
duplicate IDs or slugs. The Node-only `opensitestack/markdown` entry point
provides a recursive local Markdown/MDX adapter that ignores symbolic links.

## Group inheritance

A site may map a named `contentAreas` entry to one `groupId`. Registry creation
verifies that the group exists and that the site is an explicit member. The
resolver always returns a complete site value first, otherwise the one group
value, otherwise `null`; it never merges fields or follows another fallback.

```ts
const registry = defineSiteRegistry({
  sites: [
    {
      id: "alpha",
      name: "Alpha",
      domain: "alpha.example",
      canonicalOrigin: "https://alpha.example",
      metadata: {
        title: "Alpha",
        description: "Alpha website",
        locale: "en",
      },
      contentAreas: { legal: { groupId: "company-group" } },
      theme: "alpha",
    },
  ],
  groups: [
    { id: "company-group", name: "Company", siteIds: ["alpha"] },
  ],
});
```

## Publication and SEO

`createPublicationEntries` is the canonical publication gate. It accepts route
candidates for one resolved site and keeps only documents that are `published`,
indexable, and whose `publishedAt` timestamp is due. It creates same-origin
canonical URLs and rejects duplicate routes. Sitemap, search, feed, and
page-level structured-data adapters consume only these entries, so they cannot
silently disagree about publishability.

```ts
const entries = createPublicationEntries({
  site,
  candidates: documents.map((content) => ({
    content,
    pathname: `/articles/${content.slug}`,
  })),
});

const searchDocuments = projectPublicationEntries(entries, (entry) => ({
  id: entry.content.id,
  title: entry.content.title,
  url: entry.canonicalUrl,
}));
```

The `opensitestack/next` entry point exposes `createNextMetadata`,
`createNextRobots`, and `createNextSitemap`. All use the already resolved site;
content metadata and sitemap rows require a matching `PublicationEntry`.
`createWebsiteStructuredData` and `createWebPageStructuredData` provide
Schema.org objects, while `serializeStructuredData` escapes HTML delimiters
before rendering JSON-LD in a native `<script type="application/ld+json">`.

Search and feed providers remain application choices. They should use
`projectPublicationEntries` to transform the same filtered entries into their
provider-specific records instead of implementing another publication filter.
