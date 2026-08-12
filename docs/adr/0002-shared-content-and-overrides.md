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

The inheritance decision is part of the validated site registry. A site maps a
content-area identifier to exactly one `groupId`, and may do so only when it is
an explicit member of that group. The resolver accepts the site and content
area, not an arbitrary source supplied at request time.

OpenSiteStack does not support field-level merging, inheritance from another
site, group-to-group inheritance, or recursive fallback chains. A site may use
a group source only when it is an explicit member of that group.

## Consequences

- The effective source is deterministic and can be reported to editors.
- Invalid group references and missing memberships fail during registry
  construction rather than during a request or publication.
- Cycles are impossible by construction.
- Overrides are intentionally complete rather than partially merged.
- Legal and editorial approval remains the responsibility of each consuming
  site; technical reuse does not imply shared legal applicability.
