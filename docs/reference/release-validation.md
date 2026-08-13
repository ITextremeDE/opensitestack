# Release validation

Run the reproducible package gate from a clean checkout with Node.js 24 and the
repository-declared pnpm version:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm release:check
```

The gate runs lint, unit tests, documentation-link validation, package and
reference-application builds, type checks, the dependency audit, and a dry-run
of the public tarball. Review the printed tarball contents before publishing.

For a major release, validate the packed tarball in each reference consumer
before publication. Each consumer must run its complete `pnpm check` and
`pnpm audit --audit-level=low`. Record intentional Next.js minor differences
against the [compatibility matrix](compatibility.md); do not add test aliases or
private package entry points to hide them.

Review production dependency licenses with `pnpm licenses list --prod` and
investigate any package without a recognized license before release.

## Publish

1. Confirm versions and changelog date.
2. Commit and push the validated source.
3. Publish `packages/opensitestack` with public access.
4. Create the matching signed or annotated Git tag and GitHub release.
5. Install the registry version in each consumer and rerun its checks.

## Roll back

npm versions and Git tags are immutable. If publication is defective, restore
consumers to their previous lockfiles and publish a corrected patch version; do
not overwrite or silently retag the release.
