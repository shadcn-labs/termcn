import { Box } from "@/registry/bases/opentui/ui/box";

export default function DirectoryTreeDemo() {
  return (
    <Box borderStyle="round" flexDirection="column" paddingX={1}>
      <text>
        <b>DirectoryTree</b>
      </text>
      <text>Renders a filesystem tree with icons and colors.</text>
      <text>
        <dim>Requires Node.js filesystem access.</dim>
      </text>
    </Box>
  );
}
