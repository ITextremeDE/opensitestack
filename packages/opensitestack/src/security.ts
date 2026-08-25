export const HOST_ONLY_HSTS_VALUE = "max-age=31536000" as const;

export type SecurityHeader = {
  key: string;
  value: string;
};

export function createHostOnlyHstsHeader(): SecurityHeader {
  return {
    key: "Strict-Transport-Security",
    value: HOST_ONLY_HSTS_VALUE,
  };
}
