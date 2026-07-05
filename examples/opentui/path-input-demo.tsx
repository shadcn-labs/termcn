import { Box } from "@/registry/bases/opentui/ui/box";

export default function PathInputDemo() {
  return (
    <Box borderStyle="rounded" flexDirection="column" paddingX={1}>
      <text>
        <b>PathInput</b>
      </text>
      <text>Interactive file path input with autocomplete.</text>
      <text>
        <dim>Requires Node.js filesystem access.</dim>
      </text>
    </Box>
  );
}
