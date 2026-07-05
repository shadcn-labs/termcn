import { Alert } from "@/registry/bases/opentui/ui/alert";
import { Box } from "@/registry/bases/opentui/ui/box";

export default function AlertDemo() {
  return (
    <Box flexDirection="column" gap={1}>
      <Alert variant="success" title="Build complete">
        Everything is ready to publish.
      </Alert>
      <Alert variant="info" title="New feature available">
        Dark mode support has been added to the theme provider.
      </Alert>
    </Box>
  );
}
