import { Box, Text } from "ink";

export default function ImageDemo() {
  return (
    <Box borderStyle="round" flexDirection="column" paddingX={1}>
      <Text bold>Image</Text>
      <Text>Renders images in terminal via sixel/kitty/iterm protocols.</Text>
      <Text dimColor>Requires compatible terminal emulator.</Text>
    </Box>
  );
}
