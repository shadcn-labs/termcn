import { Box } from "@/registry/bases/opentui/ui/box";

export default function FilePickerDemo() {
  return (
    <Box borderStyle="rounded" flexDirection="column" paddingX={1}>
      <text>
        <b>FilePicker</b>
      </text>
      <text>Interactive file browser with directory navigation.</text>
      <text>
        <dim>Requires Node.js filesystem access.</dim>
      </text>
    </Box>
  );
}
