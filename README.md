# OpenSiteStack

OpenSiteStack is an open-source Next.js platform core for organizations that
operate several independent websites without rebuilding the same technical
foundation for every brand.

It standardizes host-based multisite routing, typed site and group
configuration, single-level shared-content inheritance, and Next.js request
integration. Each consuming repository keeps its own design, content,
components, deployment configuration, and credentials.

> Status: early development. The public API may change before 1.0.0.

## Principles

- one versioned platform core, separate website repositories
- configuration instead of copied applications
- site overrides before explicit group fallbacks
- no multi-level or cyclic content inheritance
- design and content remain owned by each website
- server-first Next.js integration with small, testable contracts

## Workspace

```text
packages/opensitestack/  Framework-neutral core and Next.js adapter
examples/basic/          Minimal host-based multisite application
docs/adr/                Architecture decisions
```

## Requirements

- Node.js 24
- pnpm 11

## Development

```bash
pnpm install
pnpm check
pnpm dev
```

The example resolves `localhost` to Alpha and `beta.localhost` to Beta. Alpha
uses group content; Beta demonstrates a complete site override.

Each site declares one normalized production domain, optional development
hosts, an HTTPS canonical origin, and typed title, description, and locale
metadata. Registry construction rejects invalid definitions and host collisions;
request lookup returns `null` for malformed or unknown hosts so the Next.js
adapter can respond with `notFound()` without selecting a fallback brand.

Content follows the same boundary: source adapters only load raw records;
OpenSiteStack validates them against an extensible schema before the application
uses them. The example's Markdown and MDX files are validated explicitly during
`pnpm check`, so invalid lifecycle values, metadata, duplicate IDs, or duplicate
slugs fail before a production build can be published.

## Planned scope

The initial releases will add typed Markdown/MDX content, SEO outputs, consent,
analytics and form adapters, theme and component extension points, and migration
guides for existing Next.js applications.

Operational planning lives in the private OpenProject project. Public technical
decisions and release-facing documentation live in this repository.

## License

OpenSiteStack is licensed under the [Mozilla Public License 2.0](LICENSE).
Changes to covered OpenSiteStack files remain open, while a larger work can keep
separate site-specific files under different terms.
