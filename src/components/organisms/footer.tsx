"use client";

import { Box, Container, Text } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box as="footer">
      <Container maxW="5xl" py={4}>
        <Text as="small">© 2023 yhakamay</Text>
      </Container>
    </Box>
  );
}
