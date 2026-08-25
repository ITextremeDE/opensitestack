# ADR 0008: Host-only HSTS by default

- Status: Accepted
- Date: 2026-08-25

## Context

OpenSiteStack consumers can serve one site, multiple independent domains, or a
website on a domain whose sibling subdomains belong to infrastructure, mail, or
other independently operated services. An application-level
`includeSubDomains` or `preload` directive would let one website impose a
browser policy on hosts outside its ownership boundary.

## Decision

OpenSiteStack exposes `createHostOnlyHstsHeader()`. It returns exactly:

```http
Strict-Transport-Security: max-age=31536000
```

The shared policy deliberately excludes `includeSubDomains` and `preload`.
Each concrete HTTPS website host, including redirect-only aliases, must deliver
and validate its own HSTS policy.

Domain-wide HSTS remains an infrastructure decision. A consumer may depart
from the shared default only after the operator responsible for the complete
domain namespace explicitly approves and validates every affected subdomain.

## Consequences

- Website deployments cannot accidentally force HTTPS on sibling subdomains.
- Every canonical host and redirect alias needs a separate HTTPS and header
  check.
- Consumers share one one-year policy and one regression-tested helper.
- HSTS preload is not part of the default platform contract.
