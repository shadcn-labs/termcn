import { Box } from "ink";

import { Spinner } from "@/registry/bases/ink/ui/spinner";

export default function SpinnerDemo() {
  return (
    <Box flexDirection="column" gap={1}>
      <Spinner label="Loading components..." />
      <Spinner type="arc" label="Building registry..." />
    </Box>
  );
}
