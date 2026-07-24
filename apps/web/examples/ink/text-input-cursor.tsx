import { Box, Text } from "ink";

import { TextInput } from "@/registry/bases/ink/ui/text-input";

export default function TextInputCursor() {
  return (
    <Box flexDirection="column" gap={1}>
      <Text dimColor>← → move cursor · type / backspace at cursor</Text>
      <TextInput
        autoFocus
        label="Editable"
        placeholder="Try arrows"
        showCursor
      />
    </Box>
  );
}
