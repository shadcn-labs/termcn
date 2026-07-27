import { Box } from "ink";

import { Badge } from "@/registry/bases/ink/ui/badge";

export default function BadgeDemo() {
  return (
    <Box gap={1}>
      <Badge variant="success">Active</Badge>
      <Badge variant="error">Failed</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="info">Note</Badge>
    </Box>
  );
}
