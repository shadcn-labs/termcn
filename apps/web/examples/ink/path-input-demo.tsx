import { Box, Text } from "ink";

export default function PathInputDemo() {
  return (
    <Box borderStyle="round" flexDirection="column" paddingX={1}>
      <Text bold>PathInput</Text>
      <Text>Interactive file path input with autocomplete.</Text>
      <Text dimColor>Requires Node.js filesystem access.</Text>
    </Box>
  );
}
