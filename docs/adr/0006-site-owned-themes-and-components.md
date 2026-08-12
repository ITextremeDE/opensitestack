# ADR 0006: Presentation stays site-owned behind typed extension points

- Status: Accepted
- Date: 2026-08-12

## Context

The three websites need the same platform behavior but deliberately different
visual identities, layouts, and component variants. Sharing page components or
a prescribed token vocabulary would turn the platform core into a de facto
Corporate Design and make site-specific evolution harder.

## Decision

Sites reference a theme ID. A separate theme registry validates that every
referenced theme exists and stores arbitrary site-owned design tokens. The core
only converts validated token names to CSS Custom Properties; it defines no
token semantics, stylesheet, breakpoints, or visual defaults.

Shared application code defines typed component slots at module scope. A site
may replace known slots with its own components, but it cannot add ad hoc slots
through the resolver. Components are returned unchanged, without wrappers or a
new Client Component boundary.

MDX receives an explicitly registered component map using the same controlled
override model. This controls component availability, not source safety;
untrusted MDX must additionally prohibit arbitrary imports and expressions in
its compiler pipeline.

## Consequences

- Routing, content resolution, metadata, and publication behavior can remain
  shared while markup and visual design differ completely.
- A site repository owns the meaning and values of every design token.
- Server Components remain the default, and slot resolution adds no rendering
  wrapper or client-side bundle by itself.
- Theme and component changes can be tested independently from the platform
  logic they present.
- Consumers need an explicit MDX compilation policy in addition to the
  component allowlist when content is not fully trusted.
