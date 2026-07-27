import { BarChart } from "@/registry/bases/ink/ui/bar-chart";

const sampleData = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 18 },
  { label: "Wed", value: 9 },
  { label: "Thu", value: 24 },
];

export default function BarChartDemo() {
  return <BarChart data={sampleData} width={30} showValues title="Traffic" />;
}
