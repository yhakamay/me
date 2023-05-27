import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";

import Footer from "@/components/organisms/footer";
import Header from "@/components/organisms/header";

const title = "yhakamay";
const description =
  "yhakamay is ex-42 student, technical consultant, and Next.js lover.";

export const metadata = {
  title: title,
  description: description,
  openGraph: {
    title: title,
    type: "website",
    description: description,
    siteName: title,
    url: "https://yhakamay.me",
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    creator: "@yhakamay",
  },
};

const inter = Inter({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body
        className={`${inter.className} bg-white dark:bg-gradient-to-b from-slate-950 from-50% via-slate-900 via-80% to-rose-950`}
      >
        <Header />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
