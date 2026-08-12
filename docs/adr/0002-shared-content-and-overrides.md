# ADR 0002: Shared content and site overrides

- Status: Accepted
- Date: 2026-08-12

## Context

Related sites may share legal, regulatory, or editorial content. Free-form
template inheritance and copied files make ownership and effective output hard
to understand.

## Decision

Shared content uses explicit site groups and a typed content source. Resolution
checks a complete site override first and then, when configured, exactly one
group source.

OpenSiteStack does not support field-level merging, inheritance from another
site, group-to-group inheritance, or recursive fallback chains. A site may use
a group source only when it is an explicit member of that group.

## Consequences

- The effective source is deterministic and can be reported to editors.
- Cycles are impossible by construction.
- Overrides are intentionally complete rather than partially merged.
- Legal and editorial approval remains the responsibility of each consuming
  site; technical reuse does not imply shared legal applicability.
