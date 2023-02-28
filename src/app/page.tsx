"use client";

import Repos from "@/components/molecules/repos";
import { Link } from "@chakra-ui/next-js";
import { Box, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import { BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";

export default function Home() {
  return (
    <>
      <VStack align={"start"}>
        <HStack>
          <Text>
            yhakamay is ex-42 student, technical consultant, and Next.js lover.
          </Text>
          <Box w={12} />
          <Image
            src="/yhakamay.png"
            width={80}
            height={80}
            alt={""}
            style={{ borderRadius: "20%" }}
          />
        </HStack>
        <Heading size={"sm"} pt={4}>
          Repositories
        </Heading>
        <Repos />
        <Heading size={"sm"} pt={8} pb={2}>
          Contacts
        </Heading>
        <HStack spacing={6}>
          <Link
            href="https://twitter.com/yhakamay"
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            <BsTwitter size={24} />
          </Link>
          <Link
            href="https://www.instagram.com/yhakamay/"
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            <BsInstagram size={24} />
          </Link>
          <Link
            href="https://www.linkedin.com/in/yusuke-hakamaya/"
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            <BsLinkedin size={24} />
          </Link>
        </HStack>
      </VStack>
    </>
  );
}
