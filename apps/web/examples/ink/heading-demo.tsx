import { Box } from "ink";

import { Heading } from "@/registry/bases/ink/ui/heading";

export default function HeadingDemo() {
  return (
    <Box flexDirection="column" gap={1}>
      <Heading level={1}>Getting Started</Heading>
      <Heading level={2}>Terminal UI Registry</Heading>
    </Box>
  );
}
