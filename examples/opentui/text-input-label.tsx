import { Box } from "@/registry/bases/opentui/ui/box";
import { TextInput } from "@/registry/bases/opentui/ui/text-input";

export default function TextInputLabel() {
  return (
    <Box flexDirection="column" gap={1}>
      <TextInput label="Name" placeholder="Enter your name" />
      <TextInput label="Email" placeholder="you@example.com" />
    </Box>
  );
}
