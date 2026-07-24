import { LineChart } from "@/registry/bases/ink/ui/line-chart";

const sampleData = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 18 },
  { label: "Wed", value: 9 },
  { label: "Thu", value: 24 },
];

export default function LineChartDemo() {
  return <LineChart data={sampleData} width={40} height={10} title="Traffic" />;
}
