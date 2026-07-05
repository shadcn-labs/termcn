import { Box } from "@/registry/bases/opentui/ui/box";
import { TextInput } from "@/registry/bases/opentui/ui/text-input";

export default function TextInputCursor() {
  return (
    <Box flexDirection="column" gap={1}>
      <text fg="#666">← → move cursor · type / backspace at cursor</text>
      <TextInput
        autoFocus
        label="Editable"
        placeholder="Try arrows"
        showCursor
      />
    </Box>
  );
}
