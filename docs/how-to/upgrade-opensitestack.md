# Upgrade OpenSiteStack

Upgrade each consuming website repository separately. Keeping repositories
independent is a platform boundary, not an excuse to let their core versions
drift invisibly.

## 1. Read the release information

Review the target release in `CHANGELOG.md` and any linked ADRs or migration
notes. OpenSiteStack follows Semantic Versioning, but its public API is pre-1.0:
minor releases may contain breaking changes.

Check the target package's Node.js, Next.js, React, and package-manager ranges
before changing the lockfile.

## 2. Create a reversible upgrade branch

Start from a clean, current default branch. Record the deployed version and keep
the current lockfile available as the rollback point.

Update to one deliberate version:

```bash
corepack pnpm update opensitestack@<target-version>
```

Do not combine the platform upgrade with design work, content migration, or an
unrelated dependency sweep.

## 3. Apply documented migrations

Update site and theme registries first so configuration validation gives useful
failures. Then adjust content adapters, publication/SEO integration, component
slots, and optional integrations in that order.

Keep provider credentials and site-owned components outside the package. If an
upgrade appears to require moving them into OpenSiteStack, stop: the platform
boundary is being violated.

## 4. Validate the consuming repository

Run its documented checks. At minimum verify:

- lint and TypeScript;
- unit/integration tests;
- content validation and production build;
- one request per configured host plus an unknown host;
- canonical metadata, robots, sitemap, and JSON-LD;
- group fallback and a site override;
- each distinct theme and component override;
- consent-gated analytics and server-side form validation when configured.

Compare representative screenshots when the release touches themes,
components, CSS variables, rendering, or Next.js integration.

## 5. Release repositories independently

Merge and deploy one consuming repository at a time. Observe it before rolling
the same version into the next repository. Record the adopted OpenSiteStack
version in each repository's lockfile and release notes.

## Roll back

If validation or production behavior fails, redeploy the previous application
commit and lockfile. Do not downgrade only the package inside an otherwise
changed deployment. Preserve failure evidence and open a focused issue before
retrying the upgrade.
