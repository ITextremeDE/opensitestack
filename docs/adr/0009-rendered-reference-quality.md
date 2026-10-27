# ADR 0009: Rendered reference quality and two Node majors

- Status: Accepted
- Date: 2026-10-27

## Decision

Keep the v1 library API unchanged. Add rendered accessibility, reflow, consent
lifecycle and measured performance gates to the canonical `examples/basic`
reference and repository CI. Generic measurement tools consume one configurable
loopback matrix, an explicit throttling profile and reviewed transfer budgets.
Three independent samples per page, fail-closed report validation, raw evidence
and separate manual/field acceptance prevent a green build from overstating
what was verified.

Support Node.js 24 and 26 in the source workspace and independently check both
on Linux. `.nvmrc` selects the tested Node 26 development default. Keep Node 24
API types as the lowest supported baseline. Node 26 pnpm installation does not
assume bundled Corepack.

Consent-manager rendering remains example-/site-owned. A synthetic manager and
bridge exercise early/late readiness, registration, stored grants and revocation
without SDKs, real tracking or a new browser-runtime API in the core. Reusable
performance guidance remains independent of brand design and provider syntax.

## Consequences

New browser/performance failures block CI. Raw reports follow repository access
permissions and contain synthetic local data only. Consumers adapt their own
matrix, measured resource limits and real-provider/manual acceptance; they do
not inherit the reference site's data or claim universal WCAG/field compliance.
This repository tooling/reference change does not modify the npm tarball or
require a new core-package version or consumer rollout.
