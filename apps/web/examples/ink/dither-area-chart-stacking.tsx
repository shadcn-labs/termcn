import { Box } from "ink";

import { Area, AreaChart } from "@/registry/bases/ink/ui/dither-area-chart";
import type { ChartConfig } from "@/registry/bases/ink/ui/dither-area-chart";

const data = [
  { direct: 24, search: 18 },
  { direct: 35, search: 22 },
  { direct: 31, search: 28 },
  { direct: 46, search: 25 },
  { direct: 41, search: 34 },
];

const config = {
  direct: { color: "blue", label: "Direct" },
  search: { color: "green", label: "Search" },
} satisfies ChartConfig;

export default function DitherAreaChartStacking() {
  return (
    <Box gap={2}>
      {(["stacked", "percent"] as const).map((stackType) => (
        <AreaChart
          animate={false}
          config={config}
          data={data}
          height={7}
          interactive={false}
          key={stackType}
          stackType={stackType}
          title={stackType}
          width={29}
        >
          <Area dataKey="direct" variant="gradient" />
          <Area dataKey="search" variant="dotted" />
        </AreaChart>
      ))}
    </Box>
  );
}
