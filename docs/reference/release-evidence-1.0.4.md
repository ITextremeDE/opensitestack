# OpenSiteStack 1.0.4 release evidence

- Status: package and candidate-consumer gates passed; publication and rollout pending
- Date: 2026-10-29
- Package: `opensitestack-1.0.4.tgz`
- Candidate SHA-256: `2281ba4fc8d53620c77545ed9f72e95148fdf55bce1872cd7b394f68c71bfccc`
- Package manager: pnpm 11.21.0

## Package scope and gate

The public v1 API and four entry points remain stable. The package raises its
Zod dependency floor from `^4.4.3` to `^4.6.7`. Repository tooling additionally
updates Next.js, Vitest and browser dependencies. Lighthouse 12.6.1, measurement
profiles and transfer/performance limits remain unchanged.

The release chain passed on Node 24.22.2 and 26.9.0: lint, 75 library tests,
eight quality/vendor tests, five consent-registration tests, 27 documentation
files, content validation, types, package and production reference builds,
and audit with zero known vulnerabilities. The actual npm tarball dry-run
contains 20 files: public dist output, package manifest, README and license.
Production dependency licenses were recognized; no unknown license was reported.

The release dry-run now invokes `npm pack --dry-run` from the package directory,
so validation does not create an unintended release archive in the checkout.
The candidate archive was packed separately and inspected before acceptance.

## Candidate-consumer gate

Each reference application installed the exact archive above. Its complete
`pnpm check` and separate low-threshold audit passed using Node 26.9.0 and
pnpm 11.21.0. Consumer source baselines and acceptance results:

| Consumer | Baseline commit | Result |
| --- | --- | --- |
| AVAL | `d373c32e93457de510e9474333df7fb0d21bf765` | Content/assets/373 URL rows, 17 Python tests, 179 unit tests, lint, types, production build, 86 browser tests and audit passed |
| ITextreme | `9466d9ccef8934426154014edaa8db65d0148d66` | Generated content, 10 unit tests, lint, types, 168-page build, 11 browser tests and audit passed |
| Jürgen Schadek/JARON | `3f2b9beebceba7d494714730aab4ee1ad750f14b` | Four unit tests, lint, types, 27-page build, seven browser tests and audit passed |

These baselines were tested with the candidate dependency patches, not as
unchanged historical checkouts. Required consumer updates align Next.js to
16.4.1, use patched test/build dependencies and preserve the exact official
shadcn 4.17.0 support CSS with its license while removing the unused CLI graph.
ITextreme also uses the upstream MDX frontmatter parser without the obsolete
TOML dependency. Its accessibility checks await the finite page-entry animation;
all Axe tags, assertions and visual baselines remain intact.

Candidate acceptance does not prove registry publication, registry-consumer
acceptance or production deployment. Those results are recorded below only
after their respective checks complete.

## Publication and rollout

Pending.
