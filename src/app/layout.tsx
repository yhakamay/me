import type { Metadata, Viewport } from "next";
import { Newsreader } from "next/font/google";

import "./globals.css";
import { CommandPalette } from "@/components/command-palette";
import { site } from "@/lib/site";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

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
    { media: "(prefers-color-scheme: light)", color: "#f6f3ea" },
    { media: "(prefers-color-scheme: dark)", color: "#15140f" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={newsreader.variable}>
      <body className="antialiased">
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
