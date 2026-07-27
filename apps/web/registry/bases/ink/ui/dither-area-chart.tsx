import * as React from "react";

import { renderDitherAreaChart } from "@/registry/bases/ink/lib/dither-area-chart-utils";
import type { ChartRow } from "@/registry/bases/ink/lib/dither-chart-utils";

import { DitherChart } from "./dither-chart";
import type { CartesianChartProps, SeriesProps } from "./dither-chart";

export {
  ActiveDot,
  Dot,
  Grid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "./dither-chart";
export type {
  AreaVariant,
  BloomBlend,
  BloomConfig,
  BloomInput,
  ChartConfig,
  DotProps,
  DotVariant,
  GridProps,
  LegendProps,
  Margins,
  StackType,
  StrokeVariant,
  TooltipProps,
  TooltipVariant,
  XAxisProps,
  YAxisProps,
} from "./dither-chart";

export type AreaProps = SeriesProps;
export type AreaChartProps<TData extends object> = CartesianChartProps<TData>;

export function Area(_props: AreaProps): null {
  return null;
}
Area.chartRole = "area" as const;

export function AreaChart<TData extends object>(props: AreaChartProps<TData>) {
  return (
    <DitherChart
      {...props}
      data={props.data as unknown as ChartRow[]}
      kind="area"
      renderChart={renderDitherAreaChart}
    />
  );
}
