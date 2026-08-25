# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/ITextremeDE/opensitestack/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/ITextremeDE/opensitestack/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/ITextremeDE/opensitestack/compare/v0.4.1...v1.0.0
[0.4.1]: https://github.com/ITextremeDE/opensitestack/releases/tag/v0.4.1
[0.4.0]: https://github.com/ITextremeDE/opensitestack/releases/tag/v0.4.0
[0.3.1]: https://github.com/ITextremeDE/opensitestack/releases/tag/v0.3.1
[0.3.0]: https://github.com/ITextremeDE/opensitestack/releases/tag/v0.3.0
