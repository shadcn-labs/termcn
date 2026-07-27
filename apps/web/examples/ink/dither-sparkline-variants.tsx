import { Box } from "ink";

import { Sparkline } from "@/registry/bases/ink/ui/dither-sparkline";

const data = [18, 26, 23, 41, 37, 52, 49, 63];
const variants = ["gradient", "dotted", "hatched", "solid"] as const;

export default function DitherSparklineVariants() {
  return (
    <Box flexDirection="column" gap={1}>
      {[variants.slice(0, 2), variants.slice(2)].map((row, rowIndex) => (
        <Box gap={2} key={rowIndex}>
          {row.map((variant, index) => (
            <Sparkline
              color={rowIndex === 0 ? "blue" : "green"}
              data={data}
              height={4}
              key={variant}
              markerIndex={(rowIndex + index) % 2 === 0 ? 5 : null}
              title={variant}
              variant={variant}
              width={27}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}
