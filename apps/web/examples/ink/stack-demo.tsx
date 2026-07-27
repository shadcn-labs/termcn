import { Text } from "ink";

import { Stack } from "@/registry/bases/ink/ui/stack";

export default function StackDemo() {
  return (
    <Stack direction="vertical" gap={1}>
      <Text>First</Text>
      <Text>Second</Text>
      <Text>Third</Text>
    </Stack>
  );
}
