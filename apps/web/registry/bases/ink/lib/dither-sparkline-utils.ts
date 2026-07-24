import {
  clamp,
  colorFor,
  finishDitherChart,
  lineChar,
  paint,
  paintDither,
  prepareDitherChart,
  xPosition,
  yPosition,
} from "./dither-chart-utils";
import type { DitherChartRenderer } from "./dither-chart-utils";

export const renderDitherSparkline: DitherChartRenderer = (input) => {
  const prepared = prepareDitherChart(input, "area");
  const { bands, frame, input: normalized, max, plot } = prepared;
  const [series] = normalized.series;
  const values = series ? (bands[series.dataKey] ?? []) : [];

  if (series && normalized.data.length > 0) {
    const reveal = Math.max(1, Math.ceil(plot.width * normalized.progress));
    const color = colorFor(normalized.config, series.dataKey);
    for (let localX = 0; localX < reveal; localX += 1) {
      const sample =
        plot.width <= 1
          ? 0
          : (localX / (plot.width - 1)) * (normalized.data.length - 1);
      const low = Math.floor(sample);
      const high = Math.min(normalized.data.length - 1, Math.ceil(sample));
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
          0.92 - ((y - yTop) / span) * 0.58 + (normalized.hovered ? 0.08 : 0);
        paintDither(
          frame,
          x,
          y,
          density,
          series.variant,
          color,
          normalized.unicode,
          false
        );
      }
      paint(frame, x, yTop, {
        bold: true,
        char: normalized.unicode ? "•" : "*",
        color,
        priority: 6,
      });
    }

    if (
      normalized.progress >= 0.98 &&
      series.activeDot &&
      normalized.markerIndex !== null
    ) {
      const index = clamp(normalized.markerIndex, 0, values.length - 1);
      const band = values[index];
      if (band) {
        paint(
          frame,
          xPosition(index, values.length, plot.left, plot.width),
          yPosition(band[1], max, plot.top, plot.height),
          {
            bold: true,
            char: lineChar(normalized.unicode, true),
            color,
            inverse: series.activeDot.variant === "filled",
            priority: 9,
          }
        );
      }
    }
  }

  return finishDitherChart(prepared);
};
