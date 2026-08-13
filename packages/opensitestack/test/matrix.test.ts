import { describe, expect, it } from "vitest";

import {
  createMatrixClientDiscovery,
  createMatrixServerDiscovery,
  createMatrixWellKnownResponse,
} from "../src/matrix";

describe("Matrix discovery", () => {
  it("creates server and client discovery documents", () => {
    expect(createMatrixServerDiscovery("matrix.example:443")).toEqual({
      "m.server": "matrix.example:443",
    });
    expect(
      createMatrixClientDiscovery({
        homeserverUrl: "https://matrix.example",
        authentication: { issuer: "https://account.example/" },
      }),
    ).toEqual({
      "m.homeserver": { base_url: "https://matrix.example" },
      "org.matrix.msc2965.authentication": {
        issuer: "https://account.example/",
      },
    });
  });

  it("fails closed for insecure URLs and malformed server names", () => {
    expect(() => createMatrixServerDiscovery("matrix.example")).toThrow();
    expect(() =>
      createMatrixClientDiscovery({ homeserverUrl: "http://matrix.example" }),
    ).toThrow("must use HTTPS");
  });

  it("sets interoperable CORS and cache headers", async () => {
    const response = createMatrixWellKnownResponse(
      createMatrixServerDiscovery("matrix.example:443"),
    );

    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.headers.get("cache-control")).toBe("public, max-age=3600");
    await expect(response.json()).resolves.toEqual({
      "m.server": "matrix.example:443",
    });
  });
});
