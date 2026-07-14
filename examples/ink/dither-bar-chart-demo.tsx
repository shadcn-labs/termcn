import {
  Bar,
  BarChart,
  Grid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "@/registry/bases/ink/ui/dither-bar-chart";
import type { ChartConfig } from "@/registry/bases/ink/ui/dither-bar-chart";

const data = [
  { direct: 34, month: "Jan", referral: 18 },
  { direct: 47, month: "Feb", referral: 24 },
  { direct: 42, month: "Mar", referral: 29 },
  { direct: 58, month: "Apr", referral: 31 },
  { direct: 64, month: "May", referral: 36 },
];

const config = {
  direct: { color: "green", label: "Direct" },
  referral: { color: "purple", label: "Referral" },
} satisfies ChartConfig;

export default function DitherBarChartDemo() {
  return (
    <BarChart
      config={config}
      data={data}
      height={12}
      stackType="stacked"
      width={58}
    >
      <Grid horizontal />
      <XAxis dataKey="month" />
      <YAxis tickCount={4} />
      <Bar dataKey="direct" isClickable variant="gradient" />
      <Bar dataKey="referral" isClickable variant="hatched" />
      <Legend align="left" isClickable />
      <Tooltip labelKey="month" />
    </BarChart>
  );
}
