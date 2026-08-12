# ADR 0003: License and releases

- Status: Accepted
- Date: 2026-08-12

## Context

OpenSiteStack should be publicly reusable while improvements to the shared core
remain available to the community. Consuming websites still need freedom to
keep brand assets, content, and separate application files under their own
terms.

## Decision

OpenSiteStack uses the Mozilla Public License 2.0, matching Vault-OS. Releases
follow Semantic Versioning and Keep a Changelog. Architectural changes are
recorded as ADRs.

No package or release is published automatically from an unreviewed working
tree. Release automation may validate and prepare artifacts, but publication
requires an explicit reviewed release step.

## Consequences

- Modified covered files remain available under MPL-2.0.
- A larger consuming application can license separate files differently.
- Compatibility changes require deliberate versioning and migration notes.
