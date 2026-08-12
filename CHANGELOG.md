# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- Initial architecture, contribution, security, and release documentation.
