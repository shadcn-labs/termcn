import { HeatMap } from "@/registry/bases/ink/ui/heat-map";

const sampleData = [
  [1, 4, 7, 2],
  [3, 8, 5, 1],
  [6, 2, 9, 4],
];

export default function HeatMapDemo() {
  return (
    <HeatMap
      data={sampleData}
      rowLabels={["Mon", "Tue", "Wed"]}
      colLabels={["Q1", "Q2", "Q3", "Q4"]}
      showValues
    />
  );
}
