import { Box } from "@/registry/bases/opentui/ui/box";

export default function ImageDemo() {
  return (
    <Box borderStyle="rounded" flexDirection="column" paddingX={1}>
      <text>
        <b>Image</b>
      </text>
      <text>Renders images in terminal via sixel/kitty/iterm protocols.</text>
      <text fg="#666">Requires compatible terminal emulator.</text>
    </Box>
  );
}
