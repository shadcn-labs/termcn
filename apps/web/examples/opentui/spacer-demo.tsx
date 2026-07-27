import { Box } from "@/registry/bases/opentui/ui/box";
import { Spacer } from "@/registry/bases/opentui/ui/spacer";

export default function SpacerDemo() {
  return (
    <Box flexDirection="row">
      <text>Left</text>
      <Spacer />
      <text>Right</text>
    </Box>
  );
}
