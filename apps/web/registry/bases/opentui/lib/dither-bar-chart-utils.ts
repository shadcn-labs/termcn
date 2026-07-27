import {
  colorFor,
  dotChar,
  finishDitherChart,
  lineChar,
  paint,
  paintAxes,
  paintCrosshair,
  paintDither,
  paintGrid,
  prepareDitherChart,
  yPosition,
} from "./dither-chart-utils";
import type {
  DitherCell,
  DitherChartRenderer,
  DitherRenderInput,
  DitherRenderResult,
  SeriesSpec,
} from "./dither-chart-utils";

const paintBar = (
  frame: DitherCell[][],
  input: DitherRenderInput,
  plot: DitherRenderResult["plot"],
  max: number,
  series: SeriesSpec,
  dataIndex: number,
  seriesIndex: number,
  categoryWidth: number,
  groupWidth: number,
  band: [number, number]
): void => {
  const stacked = input.stackType !== "default";
  const animatedTop = band[0] + (band[1] - band[0]) * input.progress;
  const yTop = yPosition(animatedTop, max, plot.top, plot.height);
  const yFloor = yPosition(band[0], max, plot.top, plot.height);
  const barWidth = stacked
    ? groupWidth
    : Math.max(1, Math.floor(groupWidth / input.series.length));
  const groupStart =
    plot.left +
    Math.floor(dataIndex * categoryWidth + (categoryWidth - groupWidth) / 2);
  const xStart = stacked ? groupStart : groupStart + seriesIndex * barWidth;
  const color = colorFor(input.config, series.dataKey);
  const emphasis = input.selectedDataKey ?? input.focusDataKey;
  const dim = emphasis !== null && emphasis !== series.dataKey;

  for (let x = xStart; x < xStart + barWidth; x += 1) {
    for (let y = yTop; y <= yFloor; y += 1) {
      const density =
        0.94 - ((y - yTop) / Math.max(1, yFloor - yTop + 1)) * 0.38;
      paintDither(
        frame,
        x,
        y,
        density,
        series.variant,
        color,
        input.unicode,
        dim
      );
    }
    if (series.strokeVariant !== "dashed" || x % 3 !== 1) {
      paint(frame, x, yTop, {
        char: input.unicode ? "▄" : "=",
        color,
        dim,
        priority: 6,
      });
    }
  }

  if (series.dot && input.progress >= 0.98) {
    const char = dotChar(input.unicode, series.dot.variant);
    paint(frame, xStart + Math.floor(barWidth / 2), yTop, {
      char,
      color,
      dim,
      priority: 7,
    });
  }
  if (series.activeDot && input.markerIndex === dataIndex) {
    paint(frame, xStart + Math.floor(barWidth / 2), yTop, {
      bold: true,
      char: lineChar(input.unicode, true),
      color,
      priority: 9,
    });
  }
};

export const renderDitherBarChart: DitherChartRenderer = (input) => {
  const prepared = prepareDitherChart(input, "bar");
  const { bands, frame, input: normalized, max, plot } = prepared;

  paintGrid(frame, normalized, plot, max);
  paintCrosshair(frame, normalized, plot);
  if (normalized.data.length > 0) {
    const categoryWidth = plot.width / normalized.data.length;
    const groupWidth = Math.max(1, Math.floor(categoryWidth * 0.72));
    for (
      let dataIndex = 0;
      dataIndex < normalized.data.length;
      dataIndex += 1
    ) {
      for (
        let seriesIndex = 0;
        seriesIndex < normalized.series.length;
        seriesIndex += 1
      ) {
        const series = normalized.series[seriesIndex];
        if (series) {
          paintBar(
            frame,
            normalized,
            plot,
            max,
            series,
            dataIndex,
            seriesIndex,
            categoryWidth,
            groupWidth,
            bands[series.dataKey]?.[dataIndex] ?? [0, 0]
          );
        }
      }
    }
  }
  paintAxes(frame, normalized, plot, max);

  return finishDitherChart(prepared);
};
