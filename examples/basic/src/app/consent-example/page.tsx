import {
  resolveAnalyticsScripts,
  type AnalyticsAdapter,
  type SiteDefinition,
} from "opensitestack";
import { ConsentExample } from "@/components/consent-example";

// Trusted example configuration, deliberately separate from the host registry.
const site: SiteDefinition = {
  id: "consent-example",
  name: "Consent example",
  domain: "consent.example",
  canonicalOrigin: "https://consent.example",
  metadata: {
    title: "Consent example",
    description: "Local integration lifecycle fixture",
    locale: "en",
  },
  theme: "alpha",
  integrations: {
    consent: {
      adapterId: "example-manager",
      policyVersion: "example-1",
      purposes: ["analytics"],
      runtime: "consent-manager",
    },
    analytics: {
      adapterId: "example-analytics",
      consentPurpose: "analytics",
      runtime: "consent-manager",
    },
  },
};
const adapter: AnalyticsAdapter = {
  id: "example-analytics",
  scripts: async () => [
    {
      id: "example-analytics-counter",
      kind: "inline",
      runtime: "consent-manager",
      managerId: "example-manager",
      group: "analytics",
      content:
        "document.documentElement.dataset.exampleAnalyticsStarts = String(Number(document.documentElement.dataset.exampleAnalyticsStarts || 0) + 1);",
    },
  ],
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ready?: string }>;
}) {
  const scripts = await resolveAnalyticsScripts({
    site,
    adapter,
    consent: null,
  });
  const query = await searchParams;
  return (
    <ConsentExample initiallyReady={query.ready === "1"}>
      {scripts.map((script) =>
        "kind" in script && script.kind === "inline" ? (
          <script
            key={script.id}
            id={script.id}
            type="application/x-example-consent"
            data-example-consent-group={script.group}
            dangerouslySetInnerHTML={{
              __html: script.content.replace(/<\/script/gi, "<\\/script"),
            }}
          />
        ) : null,
      )}
    </ConsentExample>
  );
}
