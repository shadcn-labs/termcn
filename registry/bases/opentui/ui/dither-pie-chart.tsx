/* @jsxImportSource @opentui/react */

import * as React from "react";

import type {
  AreaVariant,
  ChartConfig,
  ChartMargins,
  ChartRow,
} from "@/registry/bases/opentui/lib/dither-chart-utils";
import { renderDitherPieChart } from "@/registry/bases/opentui/lib/dither-pie-chart-utils";

import { DitherChart } from "./dither-chart";
import type {
  InteractionOptions,
  MotionOptions,
  TerminalChartOptions,
} from "./dither-chart";

export { Legend, Tooltip } from "./dither-chart";
export type {
  AreaVariant,
  BloomBlend,
  BloomConfig,
  BloomInput,
  ChartConfig,
  LegendProps,
  Margins,
  TooltipProps,
  TooltipVariant,
} from "./dither-chart";

export interface PieProps {
  variant?: AreaVariant;
}

export type PieChartProps<TData extends object> = TerminalChartOptions &
  InteractionOptions &
  MotionOptions & {
    children: React.ReactNode;
    config: ChartConfig;
    data: TData[];
    dataKey: string;
    innerRadius?: number;
    margins?: Partial<ChartMargins>;
    nameKey: string;
  };

export function Pie(_props: PieProps): null {
  return null;
}
Pie.chartRole = "pie" as const;

export function PieChart<TData extends object>(props: PieChartProps<TData>) {
  return (
    <DitherChart
      {...props}
      data={props.data as unknown as ChartRow[]}
      innerRadius={props.innerRadius}
      kind="pie"
      margins={props.margins}
      renderChart={renderDitherPieChart}
    />
  );
}
