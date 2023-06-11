import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";

import Footer from "@/components/organisms/footer";

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
      <body className={inter.className}>
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
