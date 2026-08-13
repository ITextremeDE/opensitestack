# Public API reference

OpenSiteStack 1.x exposes three supported entry points.

## `opensitestack`

The package root is browser-neutral and contains:

- site and group registry validation and host resolution;
- site-first, single-group content inheritance;
- content schemas, source validation, publication filtering, and projections;
- canonical URLs, metadata, robots, sitemap, and structured-data helpers;
- consent, analytics, form, Matrix discovery, theme, and component contracts.

Pure SEO and Matrix helpers belong here. Importing them does not load
request-bound Next.js modules.

## `opensitestack/markdown`

This Node.js-only entry point exports `createMarkdownContentSource` and
`parseMarkdownDocument`. The source adapter reads `.md` and `.mdx` recursively,
does not follow symbolic links, and returns normalized source references. The
parser accepts YAML mapping frontmatter and rejects arrays or scalar values.

## `opensitestack/next`

This server-only entry point exports `createCurrentSiteResolver`. It reads the
request host through Next.js and returns the matching validated site or invokes
`notFound()`. Use it only in request-bound App Router code.

The SEO helpers are re-exported for compatibility, but new code should import
them from the package root.

## Stability boundary

Exported functions, types, validation behavior, error codes, entry points, and
documented configuration fields form the v1 public API. Internal files, build
output layout below `dist`, error message prose, and example styling do not.

Provider implementations, application routes, design components, content,
credentials, and deployment configuration remain application-owned.
