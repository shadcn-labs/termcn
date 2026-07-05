import { Box } from "@/registry/bases/opentui/ui/box";
import { Spinner } from "@/registry/bases/opentui/ui/spinner";

export default function SpinnerDemo() {
  return (
    <Box flexDirection="column" gap={1}>
      <Spinner label="Loading components..." />
      <Spinner type="arc" label="Building registry..." />
    </Box>
  );
}
