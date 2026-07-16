import { Box } from "ink";

import { Radar, RadarChart } from "@/registry/bases/ink/ui/dither-radar-chart";
import type { ChartConfig } from "@/registry/bases/ink/ui/dither-radar-chart";

const data = [
  { metric: "Speed", value: 82 },
  { metric: "Quality", value: 74 },
  { metric: "Reach", value: 66 },
  { metric: "Trust", value: 91 },
  { metric: "Value", value: 78 },
];

const config = {
  value: { color: "pink", label: "Score" },
} satisfies ChartConfig;

const variants = ["gradient", "dotted", "hatched", "solid"] as const;

export default function DitherRadarChartVariants() {
  return (
    <Box flexDirection="column" gap={1}>
      {[variants.slice(0, 2), variants.slice(2)].map((row, rowIndex) => (
        <Box gap={2} key={rowIndex}>
          {row.map((variant) => (
            <RadarChart
              animate={false}
              config={config}
              data={data}
              height={11}
              interactive={false}
              key={variant}
              nameKey="metric"
              title={variant}
              width={27}
            >
              <Radar dataKey="value" variant={variant} />
            </RadarChart>
          ))}
        </Box>
      ))}
    </Box>
  );
}
