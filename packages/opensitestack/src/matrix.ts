export type MatrixServerDiscovery = {
  readonly "m.server": string;
};

export type MatrixAuthenticationDiscovery = {
  readonly issuer: string;
  readonly account?: string;
};

export type MatrixRtcFocus = {
  readonly type: string;
  readonly livekit_service_url: string;
};

export type MatrixClientDiscovery = {
  readonly "m.homeserver": { readonly base_url: string };
  readonly "m.identity_server"?: { readonly base_url: string };
  readonly "org.matrix.msc2965.authentication"?: MatrixAuthenticationDiscovery;
  readonly "org.matrix.msc4143.rtc_foci"?: readonly MatrixRtcFocus[];
};

export type MatrixWellKnownResponseOptions = {
  readonly cacheControl?: string;
};

function assertHttpsUrl(value: string, label: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:") {
    throw new TypeError(`${label} must use HTTPS`);
  }
  return value;
}

export function createMatrixServerDiscovery(server: string): MatrixServerDiscovery {
  const value = server.trim();
  if (!/^[a-z0-9.-]+:\d{1,5}$/i.test(value)) {
    throw new TypeError("Matrix server must use the host:port format");
  }

  const port = Number(value.slice(value.lastIndexOf(":") + 1));
  if (port > 65_535) {
    throw new TypeError("Matrix server port must be between 1 and 65535");
  }
  return { "m.server": value };
}

export function createMatrixClientDiscovery(options: {
  readonly homeserverUrl: string;
  readonly identityServerUrl?: string;
  readonly authentication?: MatrixAuthenticationDiscovery;
  readonly rtcFoci?: readonly MatrixRtcFocus[];
}): MatrixClientDiscovery {
  return {
    "m.homeserver": {
      base_url: assertHttpsUrl(options.homeserverUrl, "Matrix homeserver URL"),
    },
    ...(options.identityServerUrl
      ? {
          "m.identity_server": {
            base_url: assertHttpsUrl(
              options.identityServerUrl,
              "Matrix identity server URL",
            ),
          },
        }
      : {}),
    ...(options.authentication
      ? {
          "org.matrix.msc2965.authentication": {
            issuer: assertHttpsUrl(
              options.authentication.issuer,
              "Matrix authentication issuer",
            ),
            ...(options.authentication.account
              ? {
                  account: assertHttpsUrl(
                    options.authentication.account,
                    "Matrix authentication account URL",
                  ),
                }
              : {}),
          },
        }
      : {}),
    ...(options.rtcFoci
      ? {
          "org.matrix.msc4143.rtc_foci": options.rtcFoci.map((focus) => ({
            type: focus.type,
            livekit_service_url: assertHttpsUrl(
              focus.livekit_service_url,
              "Matrix RTC focus URL",
            ),
          })),
        }
      : {}),
  };
}

export function createMatrixWellKnownResponse(
  discovery: MatrixServerDiscovery | MatrixClientDiscovery,
  options: MatrixWellKnownResponseOptions = {},
): Response {
  return Response.json(discovery, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": options.cacheControl ?? "public, max-age=3600",
    },
  });
}
