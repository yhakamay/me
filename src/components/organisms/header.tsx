import { Link } from "@chakra-ui/next-js";
import { Heading, Box, Container, HStack } from "@chakra-ui/react";
import Image from "next/image";

export default function Header() {
  return (
    <Box as="header">
      <Container py={4}>
        <HStack>
          <Image src="/logo.png" width={24} height={24} alt={""} />
          <Heading size="md">
            <Link href="/">yhakamay</Link>
          </Heading>
        </HStack>
      </Container>
    </Box>
  );
}
