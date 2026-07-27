import { Box } from "@/registry/bases/opentui/ui/box";
import { StatusMessage } from "@/registry/bases/opentui/ui/status-message";

export default function StatusMessageVariants() {
  return (
    <Box flexDirection="column" gap={1}>
      <StatusMessage variant="success">Build passed.</StatusMessage>
      <StatusMessage variant="error">Connection failed.</StatusMessage>
      <StatusMessage variant="warning">Rate limit at 80%.</StatusMessage>
      <StatusMessage variant="loading">Fetching config...</StatusMessage>
    </Box>
  );
}
