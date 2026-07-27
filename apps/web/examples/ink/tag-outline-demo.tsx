import { Box } from "ink";

import { Tag } from "@/registry/bases/ink/ui/tag";

export default function TagOutlineDemo() {
  return (
    <Box gap={1}>
      <Tag variant="outline">typescript</Tag>
      <Tag variant="outline">react</Tag>
      <Tag variant="outline">ink</Tag>
    </Box>
  );
}
