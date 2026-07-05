import { Box } from "@/registry/bases/opentui/ui/box";
import { Divider } from "@/registry/bases/opentui/ui/divider";

export default function DividerCustom() {
  return (
    <Box flexDirection="column" gap={1}>
      <text>
        <dim>Vertical dividerChar</dim>
      </text>
      <Box flexDirection="row" gap={1}>
        <Divider orientation="vertical" dividerChar=":" height={5} />
        <text>Beside rule</text>
      </Box>
      <Divider
        label="Labeled"
        titlePadding={2}
        labelColor="cyan"
        color="gray"
      />
    </Box>
  );
}
