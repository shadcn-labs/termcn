import { Box } from "ink";

import { Spinner, spinnerNames } from "@/registry/bases/ink/ui/spinner";

export default function SpinnerStyles() {
  return (
    <Box flexDirection="column" gap={1}>
      {spinnerNames.map((name) => (
        <Spinner key={name} label={name} type={name} />
      ))}
    </Box>
  );
}
