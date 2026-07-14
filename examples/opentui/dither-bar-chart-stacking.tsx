/* @jsxImportSource @opentui/react */

import { Bar, BarChart } from "@/registry/bases/opentui/ui/dither-bar-chart";
import type { ChartConfig } from "@/registry/bases/opentui/ui/dither-bar-chart";

const data = [
  { direct: 24, search: 18 },
  { direct: 35, search: 22 },
  { direct: 31, search: 28 },
  { direct: 46, search: 25 },
];

const config = {
  direct: { color: "green", label: "Direct" },
  search: { color: "purple", label: "Search" },
} satisfies ChartConfig;

export default function DitherBarChartStacking() {
  return (
    <box gap={2}>
      {(["stacked", "percent"] as const).map((stackType) => (
        <box key={stackType}>
          <BarChart
            animate={false}
            config={config}
            data={data}
            height={7}
            interactive={false}
            stackType={stackType}
            title={stackType}
            width={29}
          >
            <Bar dataKey="direct" variant="gradient" />
            <Bar dataKey="search" variant="hatched" />
          </BarChart>
        </box>
      ))}
    </box>
  );
}
