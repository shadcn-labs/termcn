/* @jsxImportSource @opentui/react */

import { Pie, PieChart } from "@/registry/bases/opentui/ui/dither-pie-chart";
import type { ChartConfig } from "@/registry/bases/opentui/ui/dither-pie-chart";

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

const variants = ["gradient", "dotted", "hatched", "solid"] as const;

export default function DitherPieChartVariants() {
  return (
    <box flexDirection="column" gap={1}>
      {[variants.slice(0, 2), variants.slice(2)].map((row, rowIndex) => (
        <box gap={2} key={rowIndex}>
          {row.map((variant, index) => (
            <box key={variant}>
              <PieChart
                animate={false}
                config={config}
                data={data}
                dataKey="value"
                height={9}
                innerRadius={(rowIndex + index) % 2 === 0 ? 0 : 0.48}
                interactive={false}
                nameKey="channel"
                title={variant}
                width={27}
              >
                <Pie variant={variant} />
              </PieChart>
            </box>
          ))}
        </box>
      ))}
    </box>
  );
}
