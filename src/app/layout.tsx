import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import "./globals.css";
import { CommandPalette } from "@/components/command-palette";
import { site } from "@/lib/site";

const description = site.intro;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s · ${site.handle}`,
  },
  description,
  keywords: [
    "yhakamay",
    "Yusuke Hakamaya",
    "Next.js",
    "Adobe",
    "AEM",
    "technical consultant",
    "Tokyo",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  openGraph: {
    title: site.name,
    description,
    type: "website",
    siteName: site.name,
    url: site.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description,
    creator: "@yhakamay",
  },
  alternates: { canonical: site.url },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c10" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        <div className="aurora" aria-hidden />
        <div className="noise" aria-hidden />
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
