/* @jsxImportSource @opentui/react */

import { Bar, BarChart } from "@/registry/bases/opentui/ui/dither-bar-chart";
import type { ChartConfig } from "@/registry/bases/opentui/ui/dither-bar-chart";

const data = [{ value: 18 }, { value: 32 }, { value: 26 }, { value: 43 }];

const config = {
  value: { color: "orange", label: "Deploys" },
} satisfies ChartConfig;

const variants = ["gradient", "dotted", "hatched", "solid"] as const;

export default function DitherBarChartVariants() {
  return (
    <box flexDirection="column" gap={1}>
      {[variants.slice(0, 2), variants.slice(2)].map((row, rowIndex) => (
        <box gap={2} key={rowIndex}>
          {row.map((variant) => (
            <box key={variant}>
              <BarChart
                animate={false}
                config={config}
                data={data}
                height={6}
                interactive={false}
                title={variant}
                width={27}
              >
                <Bar dataKey="value" variant={variant} />
              </BarChart>
            </box>
          ))}
        </box>
      ))}
    </box>
  );
}
