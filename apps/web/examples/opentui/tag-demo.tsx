import { Box } from "@/registry/bases/opentui/ui/box";
import { Tag } from "@/registry/bases/opentui/ui/tag";

export default function TagDemo() {
  return (
    <Box gap={1}>
      <Tag>typescript</Tag>
      <Tag>react</Tag>
      <Tag>ink</Tag>
    </Box>
  );
}
