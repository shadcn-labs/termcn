import { Box } from "@/registry/bases/opentui/ui/box";
import { Gradient } from "@/registry/bases/opentui/ui/gradient";

export default function GradientPresets() {
  return (
    <Box flexDirection="column" gap={0}>
      <Gradient name="rainbow" bold>
        rainbow
      </Gradient>
      <Gradient name="teen">teen</Gradient>
      <Gradient name="cristal">cristal</Gradient>
    </Box>
  );
}
