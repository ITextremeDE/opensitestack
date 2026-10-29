# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.4] - 2026-10-29

### Added

- Add a host-specific `llms.txt` reference route and discovery link, plus a
  publication-safe curation and maintenance guide using the existing public API.
- Add a configurable rendered reference matrix with axe, reflow and keyboard
  checks, three-run mobile Lighthouse medians, validated throttling, reviewed
  transfer limits and raw CI evidence.
- Add an example-owned synthetic consent manager and early/late registration,
  persisted choice and revocation tests without external analytics.
- Add provider-neutral consent and frontend-performance guides.

### Changed

- Test the source workspace/reference on Node 24 and 26; default development to
  Node 26.9.0 and document pnpm setup without assuming bundled Corepack.
- Keep the v1 public API stable; raise the package Zod dependency floor to
  `^4.6.7`. Repository-only quality tooling is not part of the npm tarball.

### Fixed

- Resolve the remaining dependency advisories with patched Zod, Vitest/Vite,
  brace expansion and source-map dependencies. Replace Lighthouse's browser
  dependency graph with the official Puppeteer 25.16.0 release while retaining
  Lighthouse 12.6.1, its measurement profile and existing budgets.
- Require Zod 4.6.7 for consumers and cover early rejection of oversized form
  collections without invoking the delivery provider.
- Update the workspace, library development dependency, and basic example to
  Next.js 16.4.1 with its matching runtime dependencies.
- Correct muted-text contrast in the Alpha reference theme.
- Correct version, API-entry-point and release-evidence documentation.

## [1.0.3] - 2026-08-25

### Fixed

- Add a dual ESM/CommonJS `opensitestack/security` entry point so Next.js can
  load the shared HSTS helper from `next.config.ts`.

## [1.0.2] - 2026-08-25

### Added

- Add a shared, regression-tested host-only HSTS helper with a fixed one-year
  policy and no `includeSubDomains` or `preload` directives.

## [1.0.1] - 2026-08-25

### Fixed

- Default external consent-manager bootstrap scripts to `afterInteractive` to
  prevent third-party DOM changes from racing React hydration.

## [1.0.0] - 2026-08-13

### Added

- Add provider-neutral Matrix server/client discovery builders and a shared
  `/.well-known` response helper with CORS, caching, HTTPS validation, and tests.
- Document the stable public API, supported runtime matrix, v1 migration path,
  release validation, and rollback procedure.

### Changed

- Declare the existing registry, content, inheritance, publication, SEO,
  integrations, theme, component, Markdown, and Next.js contracts stable under
  Semantic Versioning.
- Standardize development and CI on Node.js 24 and pnpm 11.21.
- Replace the unmaintained `gray-matter` parser with `yaml` while preserving the
  public Markdown adapter behavior and exposing `parseMarkdownDocument`.

## [0.4.1] - 2026-08-12

### Fixed

- Export pure Next.js SEO helpers from the package root so tests and tooling can
  use them without loading request-bound `next/headers` APIs.

## [0.4.0] - 2026-08-12

### Added

- Add validated site-level `robots.disallow` paths and project them through the
  shared Next.js robots adapter.

## [0.3.1] - 2026-08-12

### Fixed

- Allow metadata-only route documents with an empty body so component-driven
  pages do not need synthetic Markdown content.

## [0.3.0] - 2026-08-12

### Added

- Initial pnpm workspace with the `opensitestack` package and a Next.js example.
- Typed site registry, host resolution, and single-level content fallback.
- Strict site metadata and canonical-origin validation, normalized development
  hosts, stable registry error codes, and fail-closed unknown-host resolution.
- Extensible content schemas with an explicit lifecycle, validated adapter
  provenance, duplicate detection, and a symlink-safe local Markdown/MDX source.
- Build-time validation of the example application's local content collection.
- Registry-bound, single-level content-area inheritance with complete site
  overrides, explicit group membership checks, and deterministic provenance.
- A single publication gate for due, published, indexable content; same-origin
  canonicals; host-specific Next.js metadata, robots and sitemap adapters;
  safe JSON-LD helpers; and shared search/feed projection points.
- Provider-neutral, site-level consent, analytics, and server-form adapter
  contracts with versioned fail-closed consent, consent-gated HTTPS scripts,
  and Zod validation before form delivery.
- Optional consent-manager runtime with validated HTTPS bootstrap scripts and
  consent-managed external or inline analytics descriptors.
- Timeless published content without a required publication timestamp while
  retaining timestamp-based scheduling for dated content.
- Validated design-token themes, CSS Custom Property generation, typed
  component slots, and controlled MDX component allowlists without a shared
  visual design.
- A Diátaxis-oriented integration guide covering source installation, site and
  group configuration, content, themes, migration, upgrades, and the canonical
  minimal reference application.
- Automated validation of local Markdown links as part of `pnpm check`.
- Initial architecture, contribution, security, and release documentation.

[Unreleased]: https://github.com/ITextremeDE/opensitestack/compare/v1.0.4...HEAD
[1.0.4]: https://github.com/ITextremeDE/opensitestack/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/ITextremeDE/opensitestack/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/ITextremeDE/opensitestack/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/ITextremeDE/opensitestack/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/ITextremeDE/opensitestack/compare/v0.4.1...v1.0.0
[0.4.1]: https://github.com/ITextremeDE/opensitestack/releases/tag/v0.4.1
[0.4.0]: https://github.com/ITextremeDE/opensitestack/releases/tag/v0.4.0
[0.3.1]: https://github.com/ITextremeDE/opensitestack/releases/tag/v0.3.1
[0.3.0]: https://github.com/ITextremeDE/opensitestack/releases/tag/v0.3.0
