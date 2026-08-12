import type { ReactNode } from "react";

import {
  createThemeStyle,
  createWebsiteStructuredData,
  serializeStructuredData,
} from "opensitestack";
import { createNextMetadata } from "opensitestack/next";

import { getCurrentSite } from "@/lib/current-site";
import { themeRegistry } from "@/config/sites";

import "./globals.css";

export async function generateMetadata() {
  const site = await getCurrentSite();
  return createNextMetadata(site);
}

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const site = await getCurrentSite();
  const theme = themeRegistry.getThemeForSite(site);

  return (
    <html
      data-theme={theme.id}
      lang={site.metadata.locale}
      style={createThemeStyle(theme)}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeStructuredData(createWebsiteStructuredData(site)),
          }}
        />
        {children}
      </body>
    </html>
  );
}
