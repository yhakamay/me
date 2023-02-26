"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import Header from "./components/organisms/header";
import Footer from "./components/organisms/footer";
import Main from "./components/organisms/main";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <CacheProvider>
          <ChakraProvider>
            <Header />
            <Main>{children}</Main>
            <Footer />
          </ChakraProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
