import { Box } from "ink";

import { Area, AreaChart } from "@/registry/bases/ink/ui/dither-area-chart";
import type { ChartConfig } from "@/registry/bases/ink/ui/dither-area-chart";

const data = [
  { value: 18 },
  { value: 28 },
  { value: 24 },
  { value: 39 },
  { value: 34 },
  { value: 48 },
];

const config = {
  value: { color: "blue", label: "Sessions" },
} satisfies ChartConfig;

const variants = ["gradient", "dotted", "hatched", "solid"] as const;

export default function DitherAreaChartVariants() {
  return (
    <Box flexDirection="column" gap={1}>
      {[variants.slice(0, 2), variants.slice(2)].map((row, rowIndex) => (
        <Box gap={2} key={rowIndex}>
          {row.map((variant) => (
            <AreaChart
              animate={false}
              config={config}
              data={data}
              height={6}
              interactive={false}
              key={variant}
              title={variant}
              width={27}
            >
              <Area dataKey="value" variant={variant} />
            </AreaChart>
          ))}
        </Box>
      ))}
    </Box>
  );
}
