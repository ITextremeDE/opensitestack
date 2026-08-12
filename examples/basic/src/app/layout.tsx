import type { ReactNode } from "react";

import {
  createWebsiteStructuredData,
  serializeStructuredData,
} from "opensitestack";
import { createNextMetadata } from "opensitestack/next";

import { getCurrentSite } from "@/lib/current-site";

import "./globals.css";

export async function generateMetadata() {
  const site = await getCurrentSite();
  return createNextMetadata(site);
}

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const site = await getCurrentSite();

  return (
    <html lang={site.metadata.locale}>
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
