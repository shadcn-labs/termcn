import { PieChart } from "@/registry/bases/ink/ui/pie-chart";

const sampleData = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 18 },
  { label: "Wed", value: 9 },
  { label: "Thu", value: 24 },
];

export default function PieChartDemo() {
  return <PieChart data={sampleData} radius={5} />;
}
