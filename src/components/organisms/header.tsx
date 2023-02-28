import { Link } from "@chakra-ui/next-js";
import { Heading, Box, Container } from "@chakra-ui/react";

export default function Header() {
  return (
    <Box as="header">
      <Container py={4}>
        <Heading size="lg">
          <Link href="/">yhakamay</Link>
        </Heading>
      </Container>
    </Box>
  );
}
