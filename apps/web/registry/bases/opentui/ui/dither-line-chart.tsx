/* @jsxImportSource @opentui/react */

import * as React from "react";

import type { ChartRow } from "@/registry/bases/opentui/lib/dither-chart-utils";
import { renderDitherLineChart } from "@/registry/bases/opentui/lib/dither-line-chart-utils";

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

export type LineProps = SeriesProps;
export type LineChartProps<TData extends object> = CartesianChartProps<TData>;

export function Line(_props: LineProps): null {
  return null;
}
Line.chartRole = "line" as const;

export function LineChart<TData extends object>(props: LineChartProps<TData>) {
  return (
    <DitherChart
      {...props}
      data={props.data as unknown as ChartRow[]}
      kind="line"
      renderChart={renderDitherLineChart}
    />
  );
}
