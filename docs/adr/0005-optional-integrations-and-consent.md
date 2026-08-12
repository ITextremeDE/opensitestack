# ADR 0005: Optional integrations are site-bound and fail closed

- Status: Accepted
- Date: 2026-08-12

## Context

The websites need consent management, analytics, and forms without forcing one
commercial provider or sending provider code from every brand. Consent records
can also outlive the policy under which they were collected, while form input
and adapter output cross trust boundaries.

## Decision

Each site declares only provider-neutral adapter IDs. Provider implementations,
credentials, and UI stay in the consuming repository. Consent configurations
name a policy version and allowed optional purposes. Invalid states, grants from
another policy version, and undeclared purposes are treated as no consent.

Analytics must reference one declared consent purpose. Its adapter is not
invoked until that purpose is granted. Adapter output is restricted to external
HTTPS script descriptors with deferred Next.js loading strategies; inline code
is not part of the contract.

Forms map a site-owned form ID to one server adapter. The adapter supplies a Zod
schema, and OpenSiteStack calls the provider only after the untrusted input has
passed that schema. Authentication, authorization, origin checks, rate limits,
abuse prevention, provider credentials, and operational retries remain duties
of the consuming application.

## Consequences

- A site without an integration configuration invokes no adapter and emits no
  third-party script through the supported path.
- Old or corrupt consent records do not activate optional code.
- Sites can choose or replace providers independently without changing the
  platform core.
- Provider-specific configuration cannot be placed in the public site registry;
  adapter code owns it and reads credentials only on the server where needed.
- Consent UI and durable storage are extension implementations rather than a
  platform-owned design.
