/* @jsxImportSource @opentui/react */

import {
  ActiveDot,
  Dot,
  Line,
  LineChart,
} from "@/registry/bases/opentui/ui/dither-line-chart";
import type { ChartConfig } from "@/registry/bases/opentui/ui/dither-line-chart";

const data = [
  { value: 14 },
  { value: 26 },
  { value: 21 },
  { value: 38 },
  { value: 33 },
  { value: 45 },
];

const config = {
  value: { color: "purple", label: "Latency" },
} satisfies ChartConfig;

export default function DitherLineChartVariants() {
  return (
    <box gap={2}>
      {(["solid", "dashed"] as const).map((strokeVariant) => (
        <box key={strokeVariant}>
          <LineChart
            animate={false}
            config={config}
            data={data}
            height={7}
            interactive={false}
            markerIndex={3}
            title={strokeVariant}
            width={29}
          >
            <Line dataKey="value" strokeVariant={strokeVariant}>
              <Dot variant="colored-border" />
              <ActiveDot variant="filled" />
            </Line>
          </LineChart>
        </box>
      ))}
    </box>
  );
}
