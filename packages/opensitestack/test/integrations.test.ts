import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  hasConsent,
  resolveAnalyticsScripts,
  resolveConsent,
  resolveConsentManagerScripts,
  submitSiteForm,
  type AnalyticsAdapter,
  type ConsentAdapter,
  type ConsentManagerAdapter,
  type ConsentState,
  type ServerFormAdapter,
  type SiteDefinition,
} from "../src";

const metadata = {
  title: "Example",
  description: "Example site",
  locale: "en",
};

const integratedSite: SiteDefinition = {
  id: "alpha",
  name: "Alpha",
  domain: "alpha.example",
  canonicalOrigin: "https://alpha.example",
  metadata,
  integrations: {
    consent: {
      adapterId: "cookie-consent",
      policyVersion: "2026-08",
      purposes: ["analytics", "marketing"],
    },
    analytics: {
      adapterId: "site-analytics",
      consentPurpose: "analytics",
    },
    forms: {
      contact: { adapterId: "contact-delivery" },
    },
  },
  theme: "alpha",
};

const plainSite: SiteDefinition = {
  ...integratedSite,
  id: "beta",
  name: "Beta",
  domain: "beta.example",
  canonicalOrigin: "https://beta.example",
  integrations: undefined,
  theme: "beta",
};

const grantedConsent: ConsentState = {
  policyVersion: "2026-08",
  grantedPurposes: ["analytics"],
};

const managerSite: SiteDefinition = {
  ...integratedSite,
  integrations: {
    consent: {
      adapterId: "site-consent-manager",
      policyVersion: "2026-08",
      purposes: ["analytics"],
      runtime: "consent-manager",
    },
    analytics: {
      adapterId: "site-analytics",
      consentPurpose: "analytics",
      runtime: "consent-manager",
    },
  },
};

describe("consent adapters", () => {
  it("validates and deduplicates a current consent state", async () => {
    const adapter: ConsentAdapter<string> = {
      id: "cookie-consent",
      load: async ({ input }) => ({
        policyVersion: input,
        grantedPurposes: ["analytics", "analytics"],
      }),
    };

    await expect(
      resolveConsent({ site: integratedSite, adapter, input: "2026-08" }),
    ).resolves.toEqual(grantedConsent);
    expect(hasConsent(integratedSite, grantedConsent, "analytics")).toBe(true);
    expect(hasConsent(integratedSite, grantedConsent, "marketing")).toBe(false);
  });

  it("fails closed for invalid, stale, or undeclared consent", async () => {
    for (const value of [
      { policyVersion: "old", grantedPurposes: ["analytics"] },
      { policyVersion: "2026-08", grantedPurposes: ["preferences"] },
      { policyVersion: "2026-08", grantedPurposes: ["unknown"] },
    ]) {
      await expect(
        resolveConsent({
          site: integratedSite,
          adapter: { id: "cookie-consent", load: async () => value },
          input: null,
        }),
      ).resolves.toBeNull();
    }
  });

  it("does not call a consent adapter for a site without configuration", async () => {
    const load = vi.fn(async () => grantedConsent);
    await expect(
      resolveConsent({
        site: plainSite,
        adapter: { id: "cookie-consent", load },
        input: null,
      }),
    ).resolves.toBeNull();
    expect(load).not.toHaveBeenCalled();
  });

  it("leaves provider-managed consent state to the configured manager", async () => {
    const load = vi.fn(async () => grantedConsent);
    await expect(
      resolveConsent({
        site: managerSite,
        adapter: { id: "site-consent-manager", load },
        input: null,
      }),
    ).resolves.toBeNull();
    expect(load).not.toHaveBeenCalled();
    expect(hasConsent(managerSite, grantedConsent, "analytics")).toBe(false);
  });
});

describe("consent manager adapters", () => {
  function adapter(scripts: unknown): ConsentManagerAdapter & {
    scripts: ReturnType<typeof vi.fn>;
  } {
    return {
      id: "site-consent-manager",
      scripts: vi.fn(async () => scripts),
    };
  }

  it("loads controlled HTTPS bootstrap scripts for manager runtime sites", async () => {
    const manager = adapter([
      {
        id: "consent-manager",
        src: "https://consent.example/manager.js",
        referrerPolicy: "origin",
      },
    ]);

    await expect(
      resolveConsentManagerScripts({ site: managerSite, adapter: manager }),
    ).resolves.toEqual([
      {
        id: "consent-manager",
        src: "https://consent.example/manager.js",
        strategy: "beforeInteractive",
        referrerPolicy: "origin",
      },
    ]);
  });

  it("rejects insecure or duplicate manager scripts", async () => {
    await expect(
      resolveConsentManagerScripts({
        site: managerSite,
        adapter: adapter([
          { id: "manager", src: "http://consent.example/manager.js" },
        ]),
      }),
    ).rejects.toMatchObject({ code: "INVALID_CONSENT_MANAGER_OUTPUT" });

    await expect(
      resolveConsentManagerScripts({
        site: managerSite,
        adapter: adapter([
          { id: "manager", src: "https://consent.example/a.js" },
          { id: "manager", src: "https://consent.example/b.js" },
        ]),
      }),
    ).rejects.toMatchObject({ code: "DUPLICATE_CONSENT_MANAGER_SCRIPT" });
  });
});

describe("analytics adapters", () => {
  function adapter(scripts: unknown): AnalyticsAdapter & { scripts: ReturnType<typeof vi.fn> } {
    return {
      id: "site-analytics",
      scripts: vi.fn(async () => scripts),
    };
  }

  it("loads HTTPS scripts only after the configured consent", async () => {
    const analytics = adapter([
      { id: "analytics", src: "https://analytics.example/client.js" },
    ]);

    await expect(
      resolveAnalyticsScripts({
        site: integratedSite,
        consent: grantedConsent,
        adapter: analytics,
      }),
    ).resolves.toEqual([
      {
        id: "analytics",
        src: "https://analytics.example/client.js",
        strategy: "lazyOnload",
      },
    ]);
    expect(analytics.scripts).toHaveBeenCalledExactlyOnceWith({
      site: integratedSite,
    });
  });

  it("does not resolve provider code without configuration or consent", async () => {
    const analytics = adapter([
      { id: "analytics", src: "https://analytics.example/client.js" },
    ]);

    await expect(
      resolveAnalyticsScripts({
        site: plainSite,
        consent: grantedConsent,
        adapter: analytics,
      }),
    ).resolves.toEqual([]);
    await expect(
      resolveAnalyticsScripts({
        site: integratedSite,
        consent: null,
        adapter: analytics,
      }),
    ).resolves.toEqual([]);
    expect(analytics.scripts).not.toHaveBeenCalled();
  });

  it("rejects insecure, malformed, or duplicate script output", async () => {
    await expect(
      resolveAnalyticsScripts({
        site: integratedSite,
        consent: grantedConsent,
        adapter: adapter([{ id: "analytics", src: "http://example.test/a.js" }]),
      }),
    ).rejects.toMatchObject({ code: "INVALID_ANALYTICS_OUTPUT" });

    await expect(
      resolveAnalyticsScripts({
        site: integratedSite,
        consent: grantedConsent,
        adapter: adapter([
          { id: "same", src: "https://example.test/a.js" },
          { id: "same", src: "https://example.test/b.js" },
        ]),
      }),
    ).rejects.toMatchObject({ code: "DUPLICATE_ANALYTICS_SCRIPT" });
  });

  it("returns controlled external and inline scripts for a consent manager", async () => {
    const analytics = adapter([
      {
        id: "analytics-library",
        runtime: "consent-manager",
        kind: "external",
        managerId: "site-consent-manager",
        group: "analytics",
        src: "https://analytics.example/client.js",
      },
      {
        id: "analytics-initialization",
        runtime: "consent-manager",
        kind: "inline",
        managerId: "site-consent-manager",
        group: "analytics",
        content: "window.analyticsQueue = window.analyticsQueue || [];",
      },
    ]);

    await expect(
      resolveAnalyticsScripts({
        site: managerSite,
        consent: null,
        adapter: analytics,
      }),
    ).resolves.toEqual([
      {
        id: "analytics-library",
        runtime: "consent-manager",
        kind: "external",
        managerId: "site-consent-manager",
        group: "analytics",
        src: "https://analytics.example/client.js",
        async: true,
      },
      {
        id: "analytics-initialization",
        runtime: "consent-manager",
        kind: "inline",
        managerId: "site-consent-manager",
        group: "analytics",
        content: "window.analyticsQueue = window.analyticsQueue || [];",
      },
    ]);
  });

  it("rejects scripts assigned to another consent manager", async () => {
    await expect(
      resolveAnalyticsScripts({
        site: managerSite,
        consent: null,
        adapter: adapter([
          {
            id: "analytics",
            runtime: "consent-manager",
            kind: "external",
            managerId: "another-manager",
            group: "analytics",
            src: "https://analytics.example/client.js",
          },
        ]),
      }),
    ).rejects.toMatchObject({ code: "INVALID_ANALYTICS_OUTPUT" });
  });
});

describe("server form adapters", () => {
  const schema = z.object({
    email: z.email(),
    message: z.string().trim().min(3).max(500),
  }).strict();

  function adapter() {
    const submit = vi.fn(async ({ value }: { value: z.infer<typeof schema> }) => ({
      accepted: value.email,
    }));
    const formAdapter: ServerFormAdapter<z.infer<typeof schema>, { accepted: string }> = {
      id: "contact-delivery",
      schema,
      submit,
    };
    return { formAdapter, submit };
  }

  it("validates untrusted input before calling the provider", async () => {
    const { formAdapter, submit } = adapter();
    const result = await submitSiteForm({
      site: integratedSite,
      formId: "contact",
      adapter: formAdapter,
      input: { email: "not-an-email", message: "x", injected: "value" },
    });

    expect(result).toMatchObject({ ok: false });
    expect(submit).not.toHaveBeenCalled();
  });

  it("submits only parsed values for a configured site form", async () => {
    const { formAdapter, submit } = adapter();
    await expect(
      submitSiteForm({
        site: integratedSite,
        formId: "contact",
        adapter: formAdapter,
        input: { email: "hello@example.test", message: "Hello" },
      }),
    ).resolves.toEqual({
      ok: true,
      value: { accepted: "hello@example.test" },
    });
    expect(submit).toHaveBeenCalledExactlyOnceWith({
      site: integratedSite,
      formId: "contact",
      value: { email: "hello@example.test", message: "Hello" },
    });
  });

  it("rejects unconfigured forms and mismatched adapters", async () => {
    const { formAdapter } = adapter();
    await expect(
      submitSiteForm({
        site: plainSite,
        formId: "contact",
        adapter: formAdapter,
        input: {},
      }),
    ).rejects.toMatchObject({ code: "FORM_NOT_CONFIGURED" });
    await expect(
      submitSiteForm({
        site: integratedSite,
        formId: "contact",
        adapter: { ...formAdapter, id: "wrong-adapter" },
        input: {},
      }),
    ).rejects.toMatchObject({ code: "FORM_ADAPTER_MISMATCH" });
  });
});
