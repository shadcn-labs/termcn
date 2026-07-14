import {
  ActiveDot,
  Dot,
  Grid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "@/registry/bases/ink/ui/dither-line-chart";
import type { ChartConfig } from "@/registry/bases/ink/ui/dither-line-chart";

const data = [
  { api: 32, month: "Jan", web: 44 },
  { api: 41, month: "Feb", web: 53 },
  { api: 38, month: "Mar", web: 49 },
  { api: 55, month: "Apr", web: 67 },
  { api: 63, month: "May", web: 72 },
  { api: 58, month: "Jun", web: 81 },
];

const config = {
  api: { color: "purple", label: "API" },
  web: { color: "orange", label: "Web" },
} satisfies ChartConfig;

export default function DitherLineChartDemo() {
  return (
    <LineChart
      config={config}
      data={data}
      height={12}
      markerIndex={4}
      width={58}
    >
      <Grid horizontal />
      <XAxis dataKey="month" />
      <YAxis tickCount={4} />
      <Line dataKey="web" isClickable>
        <Dot variant="border" />
        <ActiveDot variant="filled" />
      </Line>
      <Line dataKey="api" strokeVariant="dashed" />
      <Legend align="left" isClickable />
      <Tooltip labelKey="month" />
    </LineChart>
  );
}
