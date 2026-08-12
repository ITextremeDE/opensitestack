export type SiteMetadata = {
  readonly title: string;
  readonly description: string;
  readonly locale: string;
};

export type SiteRobotsDefinition = {
  readonly disallow?: readonly string[];
};

export type ContentInheritanceDefinition = {
  readonly groupId: string;
};

export type SiteContentAreasDefinition = Readonly<
  Record<string, ContentInheritanceDefinition>
>;

export type ConsentPurpose = "preferences" | "analytics" | "marketing";

export type ConsentRuntime = "application" | "consent-manager";

export type ConsentIntegrationDefinition = {
  readonly adapterId: string;
  readonly policyVersion: string;
  readonly purposes: readonly ConsentPurpose[];
  readonly runtime?: ConsentRuntime;
};

export type AnalyticsIntegrationDefinition = {
  readonly adapterId: string;
  readonly consentPurpose: ConsentPurpose;
  readonly runtime?: ConsentRuntime;
};

export type FormIntegrationDefinition = {
  readonly adapterId: string;
};

export type SiteIntegrationsDefinition = {
  readonly consent?: ConsentIntegrationDefinition;
  readonly analytics?: AnalyticsIntegrationDefinition;
  readonly forms?: Readonly<Record<string, FormIntegrationDefinition>>;
};

export type SiteDefinition = {
  readonly id: string;
  readonly name: string;
  readonly domain: string;
  readonly developmentHosts?: readonly string[];
  readonly canonicalOrigin: string;
  readonly metadata: SiteMetadata;
  readonly robots?: SiteRobotsDefinition;
  readonly contentAreas?: SiteContentAreasDefinition;
  readonly integrations?: SiteIntegrationsDefinition;
  readonly theme: string;
};

export type SiteGroupDefinition = {
  readonly id: string;
  readonly name: string;
  readonly siteIds: readonly string[];
};

export type SiteRegistryDefinition = {
  readonly sites: readonly SiteDefinition[];
  readonly groups?: readonly SiteGroupDefinition[];
};

export type SiteContentSource = {
  readonly kind: "site";
  readonly id: string;
};

export type GroupContentSource = {
  readonly kind: "group";
  readonly id: string;
};

export type ContentSource = SiteContentSource | GroupContentSource;

export type ResolvedContent<T> = {
  readonly value: T;
  readonly source: ContentSource;
};
