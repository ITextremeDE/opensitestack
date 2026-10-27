# Validate a consent-manager renderer

The core validates descriptors. The consuming app owns vendor markup,
bootstrap timing, durable consent, cleanup and activation. See
[ADR 0007](../adr/0007-consent-manager-runtime.md).

Use `/consent-example` in the [basic reference](../../examples/basic/README.md)
to exercise a local synthetic manager. `/consent-example?ready=1` models a
manager already ready before the renderer subscribes. Both paths receive a
fixed inline counter descriptor through `resolveAnalyticsScripts`; it is
server-rendered as inert markup before the client manager initializes.
The example neither fetches an external SDK nor sends analytics data.

## Example-owned bridge

[registerOnceWhenReady](../../examples/basic/src/lib/consent-registration.ts)
subscribes before checking readiness, covering an early manager, a late manager
and readiness during subscription. Reentrant/repeated signals register once.
Disposal removes the subscription and ignores queued callbacks. Registration
failure remains visible and can be retried by a subsequent explicit signal.

This bridge is reference code, not a new published core API. Adapt it to the
provider's documented registration contract. Some providers observe inserted
inert nodes; others expose explicit registration. Do not assume identical
vendor attributes or reinsert arbitrary script elements. Rendering is not
permission to execute; the manager must still decide whether a grant applies.

The synthetic provider executes only the fixed trusted counter supplied by its
local adapter. Never populate inline descriptors from requests, CMS content or
untrusted input. Its script ID and activation set prevent duplicate execution.
The persisted choice is policy-versioned; malformed or stale grants fail closed.

## Acceptance sequence

1. Server-render the inert descriptor. Assert no execution before readiness or
   consent. Keep the settings action disabled until the manager can open it.
2. Announce readiness repeatedly. Assert one registration and zero execution.
3. Reject, reload and initialize again: the grant remains absent.
4. Open settings by keyboard, grant and assert one activation. Repeating
   readiness/grant signals must not start another copy.
5. Reload with a stored grant: register and activate once again in the new page.
6. Revoke and reload: block activation. A removal does not undo previously
   executed code or retract data already sent. A real manager must define SDK
   teardown, cookie handling and any required reload behavior.
7. Verify Escape, tab containment, focus return, responsive text and accessible
   labels in every consuming theme. Test the real provider separately with
   analytics endpoints blocked or an approved test destination.

Run `pnpm test:quality` and `pnpm test:browser` for the reference contract and
browser tests. The example intentionally exposes initialization controls for
integration testing; it is not a production consent UI or privacy policy.
