import { Text } from "ink";

import { Box } from "@/registry/bases/ink/ui/box";

export default function BoxDemo() {
  return (
    <Box border borderVariant="focus" padding={1}>
      <Text>Focused container</Text>
    </Box>
  );
}
