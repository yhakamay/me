import "./globals.css";

import { Inter } from "next/font/google";

export const metadata = {
  title: "yhakamay",
  description: "yhakamay.me",
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
