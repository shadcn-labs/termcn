/* @jsxImportSource @opentui/react */

import * as React from "react";

import { renderDitherBarChart } from "@/registry/bases/opentui/lib/dither-bar-chart-utils";
import type { ChartRow } from "@/registry/bases/opentui/lib/dither-chart-utils";

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

export type BarProps = SeriesProps;
export type BarChartProps<TData extends object> = CartesianChartProps<TData>;

export function Bar(_props: BarProps): null {
  return null;
}
Bar.chartRole = "bar" as const;

export function BarChart<TData extends object>(props: BarChartProps<TData>) {
  return (
    <DitherChart
      {...props}
      data={props.data as unknown as ChartRow[]}
      kind="bar"
      renderChart={renderDitherBarChart}
    />
  );
}
