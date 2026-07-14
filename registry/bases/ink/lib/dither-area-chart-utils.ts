import {
  clamp,
  colorFor,
  dotChar,
  finishDitherChart,
  paint,
  paintAxes,
  paintCrosshair,
  paintDither,
  paintGrid,
  prepareDitherChart,
  xPosition,
  yPosition,
} from "./dither-chart-utils";
import type {
  DitherCell,
  DitherChartRenderer,
  DitherRenderInput,
  DitherRenderResult,
  SeriesSpec,
} from "./dither-chart-utils";

const paintDots = (
  frame: DitherCell[][],
  input: DitherRenderInput,
  plot: DitherRenderResult["plot"],
  max: number,
  series: SeriesSpec,
  values: [number, number][],
  color: string,
  dim: boolean
): void => {
  if (input.progress >= 0.98 && series.dot) {
    for (let index = 0; index < values.length; index += 1) {
      const band = values[index];
      if (!band) {
        continue;
      }
      const x = xPosition(index, values.length, plot.left, plot.width);
      const y = yPosition(band[1], max, plot.top, plot.height);
      const char = dotChar(input.unicode, series.dot.variant);
      paint(frame, x, y, { char, color, dim, priority: 7 });
    }
  }
  if (
    input.progress >= 0.98 &&
    series.activeDot &&
    input.markerIndex !== null
  ) {
    const index = clamp(input.markerIndex, 0, values.length - 1);
    const band = values[index];
    if (band) {
      paint(
        frame,
        xPosition(index, values.length, plot.left, plot.width),
        yPosition(band[1], max, plot.top, plot.height),
        {
          bold: true,
          char: input.unicode ? "◉" : "O",
          color,
          inverse: series.activeDot.variant === "filled",
          priority: 9,
        }
      );
    }
  }
};

const paintAreaSeries = (
  frame: DitherCell[][],
  input: DitherRenderInput,
  plot: DitherRenderResult["plot"],
  max: number,
  reveal: number,
  series: SeriesSpec,
  values: [number, number][]
): void => {
  const color = colorFor(input.config, series.dataKey);
  const emphasis = input.selectedDataKey ?? input.focusDataKey;
  const dim = emphasis !== null && emphasis !== series.dataKey;
  for (let localX = 0; localX < reveal; localX += 1) {
    const sample =
      plot.width <= 1
        ? 0
        : (localX / (plot.width - 1)) * (input.data.length - 1);
    const low = Math.floor(sample);
    const high = Math.min(input.data.length - 1, Math.ceil(sample));
    const amount = sample - low;
    const lowBand = values[low] ?? [0, 0];
    const highBand = values[high] ?? lowBand;
    const floorValue = lowBand[0] + (highBand[0] - lowBand[0]) * amount;
    const topValue = lowBand[1] + (highBand[1] - lowBand[1]) * amount;
    const x = plot.left + localX;
    const yTop = yPosition(topValue, max, plot.top, plot.height);
    const yFloor = yPosition(floorValue, max, plot.top, plot.height);
    const span = Math.max(1, yFloor - yTop + 1);
    for (let y = yTop; y <= yFloor; y += 1) {
      const density =
        0.92 - ((y - yTop) / span) * 0.58 + (input.hovered ? 0.08 : 0);
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
    if (series.strokeVariant !== "dashed" || localX % 3 !== 1) {
      paint(frame, x, yTop, {
        bold: true,
        char: input.unicode ? "•" : "*",
        color,
        dim,
        priority: 6,
      });
    }
  }
  paintDots(frame, input, plot, max, series, values, color, dim);
};

export const renderDitherAreaChart: DitherChartRenderer = (input) => {
  const prepared = prepareDitherChart(input, "area");
  const { bands, frame, input: normalized, max, plot } = prepared;

  paintGrid(frame, normalized, plot, max);
  paintCrosshair(frame, normalized, plot);
  if (normalized.data.length > 0) {
    const reveal = Math.max(1, Math.ceil(plot.width * normalized.progress));
    for (const series of normalized.series) {
      paintAreaSeries(
        frame,
        normalized,
        plot,
        max,
        reveal,
        series,
        bands[series.dataKey] ?? []
      );
    }
  }
  paintAxes(frame, normalized, plot, max);

  return finishDitherChart(prepared);
};
