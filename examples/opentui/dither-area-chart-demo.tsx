import {
  ActiveDot,
  Area,
  AreaChart,
  Dot,
  Grid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "@/registry/bases/opentui/ui/dither-area-chart";
import type { ChartConfig } from "@/registry/bases/opentui/ui/dither-area-chart";

const data = [
  { desktop: 38, mobile: 22, month: "Jan" },
  { desktop: 52, mobile: 31, month: "Feb" },
  { desktop: 47, mobile: 35, month: "Mar" },
  { desktop: 68, mobile: 42, month: "Apr" },
  { desktop: 61, mobile: 48, month: "May" },
  { desktop: 83, mobile: 55, month: "Jun" },
  { desktop: 76, mobile: 64, month: "Jul" },
];

const config = {
  desktop: { color: "blue", label: "Desktop" },
  mobile: { color: "pink", label: "Mobile" },
} satisfies ChartConfig;

export default function DitherAreaChartDemo() {
  return (
    <AreaChart
      bloom="low"
      bloomOnHover
      config={config}
      data={data}
      height={13}
      markerIndex={4}
      title="Monthly sessions"
      width={58}
    >
      <Grid horizontal vertical />
      <XAxis dataKey="month" maxTicks={7} />
      <YAxis tickCount={4} />
      <Area dataKey="desktop" isClickable variant="gradient">
        <Dot variant="colored-border" />
        <ActiveDot variant="filled" />
      </Area>
      <Area dataKey="mobile" isClickable variant="dotted">
        <ActiveDot />
      </Area>
      <Legend align="left" isClickable />
      <Tooltip labelKey="month" variant="frosted-glass" />
    </AreaChart>
  );
}
