import { BigText } from "@/registry/bases/opentui/ui/big-text";
import { Box } from "@/registry/bases/opentui/ui/box";

export default function BigTextFonts() {
  return (
    <Box flexDirection="column" gap={1}>
      <BigText font="block">BLOCK</BigText>
      <BigText font="shade">SHADE</BigText>
      <BigText font="slim">SLIM</BigText>
    </Box>
  );
}
