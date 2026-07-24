import { Box, Text } from "ink";

import { Divider } from "@/registry/bases/ink/ui/divider";

export default function DividerDemo() {
  return (
    <Box flexDirection="column">
      <Text>Above</Text>
      <Divider label="Section" />
      <Text>Below</Text>
    </Box>
  );
}
