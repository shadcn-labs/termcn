import {
  Legend,
  Pie,
  PieChart,
  Tooltip,
} from "@/registry/bases/ink/ui/dither-pie-chart";
import type { ChartConfig } from "@/registry/bases/ink/ui/dither-pie-chart";

const data = [
  { channel: "direct", value: 42 },
  { channel: "search", value: 31 },
  { channel: "social", value: 17 },
  { channel: "email", value: 10 },
];

const config = {
  direct: { color: "blue", label: "Direct" },
  email: { color: "orange", label: "Email" },
  search: { color: "green", label: "Search" },
  social: { color: "pink", label: "Social" },
} satisfies ChartConfig;

export default function DitherPieChartDemo() {
  return (
    <PieChart
      config={config}
      data={data}
      dataKey="value"
      height={14}
      innerRadius={0.42}
      markerIndex={1}
      nameKey="channel"
      width={46}
    >
      <Pie variant="gradient" />
      <Legend align="left" isClickable />
      <Tooltip variant="frosted-glass" />
    </PieChart>
  );
}
