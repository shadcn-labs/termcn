import { Sparkline } from "@/registry/bases/ink/ui/sparkline";

const sampleData = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 18 },
  { label: "Wed", value: 9 },
  { label: "Thu", value: 24 },
];

export default function SparklineDemo() {
  return (
    <Sparkline
      data={sampleData.map((d) => d.value)}
      width={20}
      label="Traffic"
    />
  );
}
