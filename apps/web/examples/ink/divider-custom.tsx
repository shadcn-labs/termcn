import { Box, Text } from "ink";

import { Divider } from "@/registry/bases/ink/ui/divider";

export default function DividerCustom() {
  return (
    <Box flexDirection="column" gap={1}>
      <Text dimColor>Vertical dividerChar</Text>
      <Box flexDirection="row" gap={1}>
        <Divider orientation="vertical" dividerChar=":" height={5} />
        <Text>Beside rule</Text>
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
