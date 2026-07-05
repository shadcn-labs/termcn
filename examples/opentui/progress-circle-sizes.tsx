import { Box } from "@/registry/bases/opentui/ui/box";
import { ProgressCircle } from "@/registry/bases/opentui/ui/progress-circle";

export default function ProgressCircleSizes() {
  return (
    <Box gap={2}>
      <ProgressCircle value={60} size="sm" />
      <ProgressCircle value={45} size="md" label="CPU" />
      <ProgressCircle value={88} size="lg" showPercent />
    </Box>
  );
}
