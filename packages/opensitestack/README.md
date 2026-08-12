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
status, publication timestamps, tags, and body. `defineContentSchema` adds
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
