import type { NextConfig } from "next";
import { createHostOnlyHstsHeader } from "opensitestack";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        headers: [createHostOnlyHstsHeader()],
        source: "/:path*",
      },
    ];
  },
  typedRoutes: true,
};

export default nextConfig;
