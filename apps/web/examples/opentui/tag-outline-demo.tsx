import { Box } from "@/registry/bases/opentui/ui/box";
import { Tag } from "@/registry/bases/opentui/ui/tag";

export default function TagOutlineDemo() {
  return (
    <Box gap={1}>
      <Tag variant="outline">typescript</Tag>
      <Tag variant="outline">react</Tag>
      <Tag variant="outline">ink</Tag>
    </Box>
  );
}
