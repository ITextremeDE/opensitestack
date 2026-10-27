# Add rendered quality gates

The canonical reference is `examples/basic`. Its library contracts, rendered
pages and provider lifecycle are checked separately. Nothing in this workflow
adds a renderer or visual component library to the published core.

## Run the reference gates

Use Node.js 24 or 26 and pnpm 11.21.0. The default `.nvmrc` selects Node 26;
CI deliberately tests both supported majors on independent Linux runners.
Node 26 does not bundle Corepack: install the pinned pnpm version explicitly
if needed with `npm install --global pnpm@11.21.0`.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm check
pnpm test:browser
pnpm quality:budgets
```

`check` includes library tests, quality-policy/registration tests, content,
types, documentation links and production builds. Browser tests start the
built reference application, check axe on desktop/mobile, 320 CSS-pixel reflow,
keyboard dialog focus and the synthetic consent flow. They do not send forms
or contact an analytics service. Tests do not retry failed assertions.

## Configure the matrix

[quality/config.json](../../quality/config.json) contains unique page IDs,
loopback hosts, paths, the server port and per-page script/image/total transfer
limits. Add each site and representative interaction surface explicitly.
`OPENSITESTACK_QUALITY_CONFIG` can select another JSON configuration. The
collector and browser matrix consume the same file. Tests for the reference
consent fixture remain specific to that fixture.

The baseline goals are performance >=90, LCP <=2500 ms and CLS <=0.1. Every
page has exactly three runs; every metric uses its own median. A report error,
redirect, missing run/resource metric, unexpected Lighthouse version or altered
CPU/network setting fails the measurement. Lab goals and transfer limits are
configuration, not universal promises about a site or real users.

[quality/profile.json](../../quality/profile.json) pins Lighthouse 12.6.1,
mobile emulation and directly applied DevTools Slow-4G throttling: 562.5 ms
request latency, 1474.56 Kbit/s download, 675 Kbit/s upload and CPU factor 4.
The original RTT/throughput basis is 150 ms/1638.4 Kbit/s. Simulated and applied
throttling are different methods: never report their difference as an
application optimization. Tool/profile changes require a deliberate calibration.

Run `pnpm quality:measure` for calibration only. It writes measured values to
`var/quality/measurements.json` without granting a passing status. Derive
transfer budgets from observed reference values plus 25%, rounded up to 10 KiB;
use the higher observed transfer when supporting multiple build environments.
The initial synthetic measurements are retained in
[quality/baseline.json](../../quality/baseline.json); CI separately validates
the budgets on Linux with both Node majors. A zero image budget deliberately
requires review before adding images to these text-only reference pages.
Do not automatically increase limits in CI or copy another site's baseline.
Keep profiles, versions, architecture and platform with the raw evidence.

Only explicit performance/LCP/CLS exceptions are supported. Each needs a known
page/metric, finite limit, owner, reason, HTTPS tracking issue and ISO expiry.
Expired, duplicated or incomplete exceptions fail. Valid exceptions emit an
explicit warning when they cover a deviation. The reference uses none.
Accessibility failures have no blanket waiver.

## Keep evidence and measurements honest

Run quantitative audits sequentially after builds/browser tests. Avoid local
background workloads and concurrent audits against one server. Each CI matrix
job gets its own runner. The production server must be stopped before another
gate starts; port conflicts fail rather than silently using another app.

CI retains raw Lighthouse JSON/HTML, measurements, browser results and failing
traces for 14 days. The upload includes the explicitly selected hidden
`.lighthouseci` directory. Artifact visibility follows repository permissions:
this public repository uses only synthetic local reference content. Proprietary
consumers must use appropriately private storage. Never include production
cookies, credentials, personal input, internal URLs or copied client reports.
There is no public Lighthouse storage-server upload.

## Add manual and field acceptance

Automated checks do not certify WCAG compliance. Record tester, date, browser,
assistive client and result for keyboard order/focus, Escape/focus restoration,
200% text and 400% zoom/reflow, errors, alternative text, reduced motion and real
provider consent states. Distinguish static rule findings from transient
animation states and wait for finite animations before contrast checks.

Field Core Web Vitals require real-user p75 LCP/INP/CLS, separated by device.
Navigation Lighthouse does not measure representative field INP. Check whether
field data exists; missing data is not a pass. Activating a new collector needs
the consuming site's own data/privacy decision. A synthetic manager test does
not validate a real provider SDK or the full third-party performance cost.
