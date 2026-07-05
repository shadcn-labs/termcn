import { Box } from "@/registry/bases/opentui/ui/box";

export default function ImageDemo() {
  return (
    <Box borderStyle="rounded" flexDirection="column" paddingX={1}>
      <text>
        <b>Image</b>
      </text>
      <text>Renders images in terminal via sixel/kitty/iterm protocols.</text>
      <text>
        <dim>Requires compatible terminal emulator.</dim>
      </text>
    </Box>
  );
}
