# ADR 0004: One publication pipeline for discovery outputs

- Status: Accepted
- Date: 2026-08-12

## Context

Metadata, canonicals, sitemaps, structured data, search indexes, and feeds can
easily apply different publication rules. In a host-based multisite application
that disagreement can expose drafts, publish future content early, or generate
URLs for the wrong brand.

## Decision

OpenSiteStack creates a site-bound `PublicationEntry` before content may enter a
discovery output. The shared publication gate accepts only documents whose
status is `published`, whose optional `publishedAt` timestamp is either absent
or due, and whose `indexable` flag is true. An absent timestamp represents
timeless content that is eligible immediately. It creates a canonical URL on
the resolved site's configured HTTPS origin and rejects duplicate URLs.

Metadata, sitemap rows, page structured data, search records, and feed records
consume these entries. Search and feed implementations remain provider-specific
projections. Site-wide metadata, robots rules, and website structured data use
the resolved site directly because they do not enumerate content. A site may
declare unique, root-relative `robots.disallow` paths for application-owned
routes such as APIs or previews; the Next.js adapter retains the common
allow-all default and the canonical sitemap and host declarations.

## Consequences

- Draft, review, archived, future, and non-indexable content cannot enter any
  content discovery output through the supported pipeline.
- Every content URL is bound to one site and canonical origin.
- Search and feed providers stay replaceable without duplicating publication
  policy.
- Rendering a preview remains possible outside the publication pipeline, but a
  preview must not be passed to discovery adapters.
- Application routes can be excluded from crawlers without replacing the
  shared robots adapter or weakening host-specific output.
