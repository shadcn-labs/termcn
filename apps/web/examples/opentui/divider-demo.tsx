import { Box } from "@/registry/bases/opentui/ui/box";
import { Divider } from "@/registry/bases/opentui/ui/divider";

export default function DividerDemo() {
  return (
    <Box flexDirection="column">
      <text>Above</text>
      <Divider label="Section" />
      <text>Below</text>
    </Box>
  );
}
