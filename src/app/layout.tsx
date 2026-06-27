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
        {/* Refraction filter for .glass surfaces — warps the backdrop at
            the edges. Turbulence → blur → displace; kept lightweight. */}
        <svg
          aria-hidden
          width="0"
          height="0"
          className="pointer-events-none absolute"
          style={{ position: "absolute", width: 0, height: 0 }}
        >
          <defs>
            <filter
              id="glass-distortion"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              filterUnits="objectBoundingBox"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.02 0.02"
                numOctaves={2}
                seed={5}
                result="turbulence"
              />
              <feGaussianBlur in="turbulence" stdDeviation="1.5" result="softMap" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="softMap"
                scale={160}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      </body>
    </html>
  );
}
