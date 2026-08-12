# ADR 0007: Consent managers may own script activation

- Status: Accepted
- Date: 2026-08-12

## Context

Some sites store consent in the application and load analytics after reading a
valid grant. Others use a dedicated consent manager that must load early and
activate scripts represented by vendor-specific inert markup. Forcing the first
model onto the second either duplicates consent state or bypasses the manager.
Embedding vendor markup in the platform core would couple OpenSiteStack to one
provider.

## Decision

Consent and analytics references select the same runtime. The default
`application` runtime retains versioned, fail-closed consent state and permits
only deferred external HTTPS analytics scripts after a matching grant.

The `consent-manager` runtime delegates durable consent state and script
activation to an external manager. One adapter returns validated HTTPS
bootstrap descriptors. Analytics adapters return validated inert descriptors:
an external HTTPS script or bounded inline code, a manager ID, and a
manager-owned group. The consuming application maps these descriptors to the
manager's documented HTML attributes.

Inline descriptor content is trusted adapter code. Content sources, CMS values,
and request input must never populate it. OpenSiteStack validates structure and
manager identity but does not execute, sanitize, or render the code.

## Consequences

- Existing application-managed consent remains the default and unchanged.
- Sites can integrate managers such as CCM19 without placing vendor-specific
  attributes or SDKs in the platform core.
- Consent and analytics runtimes cannot be mixed accidentally.
- The consuming repository owns the renderer and must test vendor-specific
  activation behavior.
- A compromised analytics adapter can supply executable code; adapters are a
  trusted application boundary and require normal dependency review.
