import "./globals.css";

import { Inter } from "next/font/google";

export const metadata = {
  title: "yhakamay",
  description:
    "yhakamay is ex-42 student, technical consultant, and Next.js lover.",
  og: {
    title: "yhakamay",
    type: "website",
    url: "https://yhakamay.me",
    image: "https://yhakamay.me/logo.png",
    description:
      "yhakamay is ex-42 student, technical consultant, and Next.js lover.",
    site_name: "yhakamay",
  },
  twitter: {
    card: "summary_large_image",
    site: "@yhakamay",
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
