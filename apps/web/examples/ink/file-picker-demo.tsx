import { Box, Text } from "ink";

export default function FilePickerDemo() {
  return (
    <Box borderStyle="round" flexDirection="column" paddingX={1}>
      <Text bold>FilePicker</Text>
      <Text>Interactive file browser with directory navigation.</Text>
      <Text dimColor>Requires Node.js filesystem access.</Text>
    </Box>
  );
}
