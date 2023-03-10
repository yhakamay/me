import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";

import Main from "@/components/atoms/main";
import Footer from "@/components/organisms/footer";
import Header from "@/components/organisms/header";

export const metadata = {
  title: "yhakamay",
  description:
    "yhakamay is ex-42 student, technical consultant, and Next.js lover.",
  openGraph: {
    title: "yhakamay",
    type: "website",
    description:
      "yhakamay is ex-42 student, technical consultant, and Next.js lover.",
    siteName: "yhakamay",
    url: "https://yhakamay.me",
    images: [
      {
        url: "https://yhakamay.me/og.png",
        width: 512,
        height: 512,
        alt: "yhakamay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "yhakamay",
    description:
      "yhakamay is ex-42 student, technical consultant, and Next.js lover.",
    creator: "@yhakamay",
    images: ["https://yhakamay.me/og.png"],
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
        <Header />
        <Main>{children}</Main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
