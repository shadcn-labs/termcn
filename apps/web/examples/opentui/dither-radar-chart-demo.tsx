import {
  Grid,
  Legend,
  Radar,
  RadarChart,
  Tooltip,
} from "@/registry/bases/opentui/ui/dither-radar-chart";
import type { ChartConfig } from "@/registry/bases/opentui/ui/dither-radar-chart";

const data = [
  { desktop: 82, metric: "Speed", mobile: 68 },
  { desktop: 74, metric: "Quality", mobile: 79 },
  { desktop: 66, metric: "Reach", mobile: 88 },
  { desktop: 91, metric: "Trust", mobile: 72 },
  { desktop: 78, metric: "Value", mobile: 83 },
];

const config = {
  desktop: { color: "blue", label: "Desktop" },
  mobile: { color: "pink", label: "Mobile" },
} satisfies ChartConfig;

export default function DitherRadarChartDemo() {
  return (
    <RadarChart
      config={config}
      data={data}
      height={15}
      nameKey="metric"
      width={50}
    >
      <Grid horizontal />
      <Radar dataKey="desktop" variant="gradient" />
      <Radar dataKey="mobile" variant="dotted" />
      <Legend align="left" />
      <Tooltip labelKey="metric" />
    </RadarChart>
  );
}
