/* @jsxImportSource @opentui/react */

import { Area, AreaChart } from "@/registry/bases/opentui/ui/dither-area-chart";
import type { ChartConfig } from "@/registry/bases/opentui/ui/dither-area-chart";

const data = [
  { value: 18 },
  { value: 28 },
  { value: 24 },
  { value: 39 },
  { value: 34 },
  { value: 48 },
];

const config = {
  value: { color: "blue", label: "Sessions" },
} satisfies ChartConfig;

const variants = ["gradient", "dotted", "hatched", "solid"] as const;

export default function DitherAreaChartVariants() {
  return (
    <box flexDirection="column" gap={1}>
      {[variants.slice(0, 2), variants.slice(2)].map((row, rowIndex) => (
        <box gap={2} key={rowIndex}>
          {row.map((variant) => (
            <box key={variant}>
              <AreaChart
                animate={false}
                config={config}
                data={data}
                height={6}
                interactive={false}
                title={variant}
                width={27}
              >
                <Area dataKey="value" variant={variant} />
              </AreaChart>
            </box>
          ))}
        </box>
      ))}
    </box>
  );
}
