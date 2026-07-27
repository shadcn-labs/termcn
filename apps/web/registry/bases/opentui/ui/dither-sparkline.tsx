/* @jsxImportSource @opentui/react */

import * as React from "react";

import type {
  AreaVariant,
  ChartConfig,
  DitherColor,
} from "@/registry/bases/opentui/lib/dither-chart-utils";
import { renderDitherSparkline } from "@/registry/bases/opentui/lib/dither-sparkline-utils";

import { ActiveDot, DitherChart } from "./dither-chart";
import type {
  InteractionOptions,
  MotionOptions,
  SeriesProps,
  TerminalChartOptions,
} from "./dither-chart";

export type {
  AreaVariant,
  BloomBlend,
  BloomConfig,
  BloomInput,
  DitherColor,
} from "./dither-chart";

export type SparklineProps = TerminalChartOptions &
  Pick<
    InteractionOptions,
    "bloom" | "bloomOnHover" | "hovered" | "markerIndex"
  > &
  MotionOptions & {
    color: DitherColor;
    data: number[];
    variant?: AreaVariant;
  };

function SparklineArea(_props: SeriesProps): null {
  return null;
}
SparklineArea.chartRole = "area" as const;

export function Sparkline({
  animate = false,
  animationDuration,
  bloom,
  bloomOnHover,
  className,
  color,
  data,
  height = 4,
  hovered,
  markerIndex,
  noColor,
  reducedMotion,
  replayToken,
  screenReaderMode,
  title,
  unicode,
  variant = "gradient",
  width = 24,
}: SparklineProps) {
  const rows = React.useMemo(() => data.map((value) => ({ value })), [data]);
  const config = React.useMemo<ChartConfig>(
    () => ({ value: { color, label: title ?? "Value" } }),
    [color, title]
  );

  return (
    <DitherChart
      animate={animate}
      animationDuration={animationDuration}
      bloom={bloom}
      bloomOnHover={bloomOnHover}
      className={className}
      config={config}
      data={rows}
      height={height}
      hovered={hovered}
      interactive={false}
      kind="area"
      margins={{ bottom: 0, left: 0, right: 0, top: 0 }}
      markerIndex={markerIndex}
      noColor={noColor}
      reducedMotion={reducedMotion}
      renderChart={renderDitherSparkline}
      replayToken={replayToken}
      screenReaderMode={screenReaderMode}
      title={title}
      unicode={unicode}
      width={width}
    >
      <SparklineArea dataKey="value" variant={variant}>
        {markerIndex !== null && markerIndex !== undefined ? (
          <ActiveDot />
        ) : null}
      </SparklineArea>
    </DitherChart>
  );
}
