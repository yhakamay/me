import { Link } from "@chakra-ui/next-js";
import { Flex, Heading, Box } from "@chakra-ui/react";

export default function Header() {
  return (
    <Box as="header">
      <Flex minH={"60px"} py={{ base: 2 }} px={{ base: 4 }} align="center">
        <Flex flex={1} justify="space-between" maxW="5xl" mx="auto">
          <Heading size="lg">
            <Link href="/">yhakamay</Link>
          </Heading>
        </Flex>
      </Flex>
    </Box>
  );
}