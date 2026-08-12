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

## Documentation

- [Run the reference application](docs/tutorials/run-reference-application.md)
- [Configuration reference](docs/reference/configuration.md)
- [Migrate an existing Next.js website](docs/how-to/migrate-existing-nextjs.md)
- [Upgrade OpenSiteStack](docs/how-to/upgrade-opensitestack.md)
- [Basic reference application](examples/basic/README.md)

The example resolves `localhost` to Alpha and `beta.localhost` to Beta. Alpha
uses group content and an editorial layout; Beta demonstrates a complete site
override with separate design tokens and control-panel markup. Host resolution,
content loading, SEO, and publication logic remain shared.

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

Publication follows one additional shared gate: only due, `published`, and
indexable documents become canonical publication entries. Host-specific
metadata, `robots.txt`, `sitemap.xml`, and JSON-LD are derived from the resolved
site and those entries. Search and feed integrations project the same entries,
which prevents them from leaking drafts or disagreeing with the sitemap.

Optional consent, analytics, and form integrations follow validated site-level
adapter references. Analytics adapters are resolved only after a current grant
for the configured purpose; unconfigured sites emit no provider scripts. Form
adapters validate untrusted input on the server before provider submission.
Provider packages, credentials, consent UI, and abuse controls stay in each
consuming site repository.

Themes are site-owned token maps exposed as CSS Custom Properties. Typed
component slots can replace complete presentation components without wrapping
them or copying route logic, while controlled MDX component maps accept only
explicitly registered names. OpenSiteStack deliberately defines no shared
Corporate Design.

Group inheritance is declared per site and content area in that same validated
registry. A complete site value wins; otherwise the resolver reads one explicit
group value. There is no field merging, site-to-site fallback, group chaining,
or request-time selection of an arbitrary inheritance source.

Operational planning lives in the private OpenProject project. Public technical
decisions and release-facing documentation live in this repository.

## License

OpenSiteStack is licensed under the [Mozilla Public License 2.0](LICENSE).
Changes to covered OpenSiteStack files remain open, while a larger work can keep
separate site-specific files under different terms.
