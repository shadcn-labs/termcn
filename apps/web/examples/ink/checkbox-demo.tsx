import { Box } from "ink";

import { Checkbox } from "@/registry/bases/ink/ui/checkbox";

export default function CheckboxDemo() {
  return (
    <Box flexDirection="column" gap={1}>
      <Checkbox checked label="Enable telemetry" />
      <Checkbox label="Send crash reports" />
      <Checkbox label="Select all" indeterminate />
    </Box>
  );
}
