import { describe, expect, it } from "vitest";

import {
  createHostOnlyHstsHeader,
  HOST_ONLY_HSTS_VALUE,
} from "../src/security";

describe("host-only HSTS", () => {
  it("uses one year without domain-wide directives", () => {
    expect(HOST_ONLY_HSTS_VALUE).toBe("max-age=31536000");
    expect(HOST_ONLY_HSTS_VALUE).not.toContain("includeSubDomains");
    expect(HOST_ONLY_HSTS_VALUE).not.toContain("preload");
    expect(createHostOnlyHstsHeader()).toEqual({
      key: "Strict-Transport-Security",
      value: HOST_ONLY_HSTS_VALUE,
    });
  });

  it("returns a fresh header object for each consumer", () => {
    expect(createHostOnlyHstsHeader()).not.toBe(createHostOnlyHstsHeader());
  });
});
