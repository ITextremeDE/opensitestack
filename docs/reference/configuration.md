# Configuration reference

This reference describes the public configuration and file contracts currently
implemented by OpenSiteStack. The API is pre-1.0 and may change between minor
versions.

## Site registry

Create one registry during application startup with `defineSiteRegistry`.

```ts
import { defineSiteRegistry } from "opensitestack";

export const siteRegistry = defineSiteRegistry({
  sites: [
    {
      id: "alpha",
      name: "Alpha",
      domain: "alpha.example",
      developmentHosts: ["localhost"],
      canonicalOrigin: "https://alpha.example",
      metadata: {
        title: "Alpha",
        description: "Alpha website",
        locale: "en",
      },
      contentAreas: { home: { groupId: "company" } },
      theme: "alpha",
    },
  ],
  groups: [{ id: "company", name: "Company", siteIds: ["alpha"] }],
});
```

### Site fields

| Field | Required | Contract |
| --- | --- | --- |
| `id` | yes | Unique kebab-case identifier. |
| `name` | yes | Human-readable site name. |
| `domain` | yes | Normalized production hostname without protocol, port, or path. |
| `developmentHosts` | no | Additional unique hosts used only for request resolution. |
| `canonicalOrigin` | yes | HTTPS origin whose hostname exactly matches `domain`; no port, path, query, or fragment. |
| `metadata` | yes | Non-empty `title`, `description`, and a locale such as `en` or `de-DE`. |
| `contentAreas` | no | Map from a kebab-case area ID to exactly one `groupId`. |
| `integrations` | no | Site-level consent, analytics, and form adapter references. |
| `theme` | yes | Kebab-case theme ID validated by the theme registry. |

Hosts and site IDs must be globally unique. Unknown or malformed request hosts
resolve to `null`; the Next.js resolver converts that result to `notFound()`.

## Groups and content inheritance

Each group has a unique `id`, a display `name`, and at least one explicit
`siteId`. A site's `contentAreas` entry may reference a group only when that
site is a member.

Resolution for one content area is deterministic:

1. Read a complete site value.
2. If it does not exist, read the configured group's complete value.
3. Otherwise return `null`.

OpenSiteStack never merges fields, follows group chains, or falls back from one
site to another. In the reference application the corresponding paths are:

```text
content/sites/<site-id>/<area>.mdx
content/groups/<group-id>/<area>.md
```

Those paths are an application convention passed to `resolveContent`, not a
hard-coded platform requirement.

## Content documents

`contentDocumentSchema` validates the following frontmatter plus a non-empty
Markdown or MDX body:

```yaml
---
id: alpha-home
slug: home
title: Alpha home
summary: Alpha home page.
status: published
indexable: true
publishedAt: "2026-08-12T12:00:00+02:00"
updatedAt: "2026-08-12T12:00:00+02:00"
tags:
  - example
---
Page body.
```

| Field | Required | Contract |
| --- | --- | --- |
| `id` | yes | Kebab-case identifier, unique within one validated source. |
| `slug` | yes | Lowercase route segments separated by `/`, unique within one source. |
| `title` | yes | Non-empty title. |
| `summary` | yes | Non-empty summary. |
| `status` | yes | `draft`, `review`, `published`, or `archived`. |
| `indexable` | no | Boolean, defaults to `true`. |
| `publishedAt` | for published content | ISO 8601 timestamp with offset. |
| `updatedAt` | no | ISO 8601 timestamp with offset. |
| `tags` | no | Array of kebab-case identifiers, defaults to an empty array. |
| `body` | yes | Non-empty document body supplied by the source adapter. |

`createPublicationEntries` publishes only due, `published`, indexable content.
Drafts, reviews, archived records, and future publication timestamps stay out of
page-level publication data, sitemaps, search, and feeds.

The Node-only `opensitestack/markdown` entry point recursively reads `.md` and
`.mdx` files and ignores symbolic links. `defineContentSchema` can add strict
site-owned fields but cannot replace platform fields.

## Next.js request and SEO adapters

Use `createCurrentSiteResolver` once in a server-only module:

```ts
import { createCurrentSiteResolver } from "opensitestack/next";

export const { getCurrentSite, getCurrentSiteOrNull } =
  createCurrentSiteResolver(siteRegistry);
```

`getCurrentSite` returns the host-bound site or calls `notFound()`.
`getCurrentSiteOrNull` exposes the nullable result when the application needs to
handle it itself. Both functions are request-cached.

The same resolved site feeds `createNextMetadata`, `createNextRobots`, and
`createNextSitemap`. Sitemap and content metadata entries must belong to that
site. `createWebsiteStructuredData`, `createWebPageStructuredData`, and
`serializeStructuredData` provide safely serialized JSON-LD helpers.

## Themes

Register all site-owned themes after the site registry:

```ts
import { defineThemeRegistry } from "opensitestack";

export const themeRegistry = defineThemeRegistry(
  {
    themes: [
      {
        id: "alpha",
        tokens: {
          "color-background": "#ffffff",
          "font-body": "system-ui, sans-serif",
          "content-width": "72rem",
        },
      },
    ],
  },
  siteRegistry.sites,
);
```

Theme IDs and token names use kebab-case. Values are non-empty strings or finite
numbers. Token names and meanings belong to the consuming repository;
OpenSiteStack defines no palette, spacing scale, typography, or Corporate
Design. `createThemeStyle(theme)` maps each token to a CSS Custom Property with
the same name prefixed by `--`.

## Component slots and MDX components

`defineComponentSlots` creates a typed set of default React components. A site
may replace a known slot but cannot add an undeclared one through the resolver.
Resolved components retain their identity and receive no wrapper or implicit
Client Component boundary.

```tsx
const slots = defineComponentSlots({ Home: DefaultHome });
const alphaComponents = slots.resolve();
const betaComponents = slots.resolve({ Home: BetaHome });
```

Resolve stable component maps at module scope. Do not create component types
inside a render function.

`defineMdxComponents` provides the same explicit allowlist for a map passed to
an MDX renderer. It does not sanitize MDX source or disable imports and
expressions. Treat untrusted MDX as code unless the consuming repository uses a
restricted compiler pipeline.

## Optional integrations

Sites reference provider-neutral adapter IDs rather than credentials or vendor
SDKs:

```ts
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
  forms: {
    contact: { adapterId: "contact-delivery" },
  },
}
```

Analytics requires consent configuration and a declared matching purpose.
Unconfigured sites emit no provider scripts. Form adapters validate untrusted
input with Zod before delivery. Provider packages, credentials, consent UI,
CSRF/origin checks, abuse controls, and rate limits remain server-side concerns
of the consuming repository.

## Validation failures

Registries and content validation fail during startup or build with stable error
types and codes. Do not catch those errors merely to continue with a default
site or theme: a configuration error should stop publication before content or
metadata can leak across sites.
