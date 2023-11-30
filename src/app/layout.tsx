import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
