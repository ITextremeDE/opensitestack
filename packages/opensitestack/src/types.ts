export type SiteMetadata = {
  readonly title: string;
  readonly description: string;
  readonly locale: string;
};

export type SiteDefinition = {
  readonly id: string;
  readonly name: string;
  readonly domain: string;
  readonly developmentHosts?: readonly string[];
  readonly canonicalOrigin: string;
  readonly metadata: SiteMetadata;
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
