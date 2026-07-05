import { Stack } from "@/registry/bases/opentui/ui/stack";

export default function StackDemo() {
  return (
    <Stack direction="vertical" gap={1}>
      <text>First</text>
      <text>Second</text>
      <text>Third</text>
    </Stack>
  );
}
