import * as React from "react";

import type {
  AreaVariant,
  ChartConfig,
  ChartMargins,
  ChartRow,
} from "@/registry/bases/ink/lib/dither-chart-utils";
import { renderDitherRadarChart } from "@/registry/bases/ink/lib/dither-radar-chart-utils";

import { DitherChart } from "./dither-chart";
import type {
  InteractionOptions,
  MotionOptions,
  TerminalChartOptions,
} from "./dither-chart";

export { Grid, Legend, Tooltip } from "./dither-chart";
export type {
  AreaVariant,
  BloomBlend,
  BloomConfig,
  BloomInput,
  ChartConfig,
  GridProps,
  LegendProps,
  Margins,
  TooltipProps,
  TooltipVariant,
} from "./dither-chart";

export interface RadarProps {
  dataKey: string;
  variant?: AreaVariant;
}

export type RadarChartProps<TData extends object> = TerminalChartOptions &
  InteractionOptions &
  MotionOptions & {
    children: React.ReactNode;
    config: ChartConfig;
    data: TData[];
    margins?: Partial<ChartMargins>;
    nameKey: string;
  };

export function Radar(_props: RadarProps): null {
  return null;
}
Radar.chartRole = "radar" as const;

export function RadarChart<TData extends object>(
  props: RadarChartProps<TData>
) {
  return (
    <DitherChart
      {...props}
      data={props.data as unknown as ChartRow[]}
      kind="radar"
      margins={props.margins}
      renderChart={renderDitherRadarChart}
    />
  );
}
