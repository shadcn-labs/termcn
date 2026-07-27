import { Box, Text } from "ink";

export default function DirectoryTreeDemo() {
  return (
    <Box borderStyle="round" flexDirection="column" paddingX={1}>
      <Text bold>DirectoryTree</Text>
      <Text>Renders a filesystem tree with icons and colors.</Text>
      <Text dimColor>Requires Node.js filesystem access.</Text>
    </Box>
  );
}
