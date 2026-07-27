import { Box } from "@/registry/bases/opentui/ui/box";

export default function BoxDemo() {
  return (
    <Box border borderVariant="focus" padding={1}>
      <text>Focused container</text>
    </Box>
  );
}
