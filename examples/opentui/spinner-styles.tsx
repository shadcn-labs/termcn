import { Box } from "@/registry/bases/opentui/ui/box";
import { Spinner, spinnerNames } from "@/registry/bases/opentui/ui/spinner";

export default function SpinnerStyles() {
  return (
    <Box flexDirection="column" gap={1}>
      {spinnerNames.map((name) => (
        <Spinner key={name} label={name} type={name} />
      ))}
    </Box>
  );
}
