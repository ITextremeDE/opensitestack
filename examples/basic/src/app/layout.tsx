import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getCurrentSite } from "@/lib/current-site";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getCurrentSite();

  return {
    metadataBase: new URL(site.canonicalOrigin),
    title: site.metadata.title,
    description: site.metadata.description,
    alternates: { canonical: "/" },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const site = await getCurrentSite();

  return (
    <html lang={site.metadata.locale}>
      <body>{children}</body>
    </html>
  );
}
