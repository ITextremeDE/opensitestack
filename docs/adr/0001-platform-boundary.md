# ADR 0001: Platform boundary

- Status: Accepted
- Date: 2026-08-12

## Context

Several independent Next.js websites need the same technical capabilities but
must keep separate repositories, brands, content, and release decisions.
Copying a boilerplate once would align the initial state but would immediately
create several independently drifting platform implementations.

## Decision

OpenSiteStack is a versioned public package with a small reference application.
Consuming websites remain independent Next.js applications and import the
shared platform contracts.

The core owns site discovery, shared content resolution, common publication
behavior, and provider-neutral integration contracts. A consuming repository
owns its configuration, themes, assets, content, site-specific components,
credentials, infrastructure, and deployment.

## Consequences

- Common fixes can be released once and adopted deliberately by every site.
- Sites can upgrade and roll back independently.
- Public APIs need compatibility discipline and Semantic Versioning.
- Brand-specific convenience code must not leak into the core.
