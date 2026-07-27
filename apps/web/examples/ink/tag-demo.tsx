import { Box } from "ink";

import { Tag } from "@/registry/bases/ink/ui/tag";

export default function TagDemo() {
  return (
    <Box gap={1}>
      <Tag>typescript</Tag>
      <Tag>react</Tag>
      <Tag>ink</Tag>
    </Box>
  );
}
