import {
  clamp,
  colorFor,
  finishDitherChart,
  paintDither,
  prepareDitherChart,
  valueAt,
} from "./dither-chart-utils";
import type { ChartRow, DitherChartRenderer } from "./dither-chart-utils";

const pieSlices = (
  data: ChartRow[],
  valueKey: string,
  nameKey: string
): { end: number; name: string; start: number }[] => {
  const total = data.reduce((sum, row) => sum + valueAt(row, valueKey), 0);
  let cursor = 0;
  return data.map((row, index) => {
    const start = cursor;
    cursor += total > 0 ? (valueAt(row, valueKey) / total) * Math.PI * 2 : 0;
    return {
      end: cursor,
      name: String(row[nameKey] ?? index),
      start,
    };
  });
};

export const renderDitherPieChart: DitherChartRenderer = (input) => {
  const prepared = prepareDitherChart(input, "pie");
  const { frame, input: normalized, plot } = prepared;
  const { pie } = normalized;

  if (pie) {
    const nameKey = normalized.nameKey ?? "name";
    const slices = pieSlices(normalized.data, pie.valueKey, nameKey);
    const cx = plot.left + (plot.width - 1) / 2;
    const cy = plot.top + (plot.height - 1) / 2;
    const radiusY = Math.max(
      1,
      Math.min((plot.height - 1) / 2, plot.width / 4)
    );
    const radiusX = Math.max(2, Math.min((plot.width - 1) / 2, radiusY * 2));
    const sweep = Math.PI * 2 * normalized.progress;
    for (let y = plot.top; y < plot.top + plot.height; y += 1) {
      for (let x = plot.left; x < plot.left + plot.width; x += 1) {
        const dx = (x - cx) / radiusX;
        const dy = (y - cy) / radiusY;
        const radius = Math.hypot(dx, dy);
        if (radius > 1 || radius < clamp(pie.innerRadius, 0, 0.92)) {
          continue;
        }
        let angle = Math.atan2(dx, -dy);
        if (angle < 0) {
          angle += Math.PI * 2;
        }
        if (angle > sweep) {
          continue;
        }
        const sliceIndex = slices.findIndex(
          (slice) => angle >= slice.start && angle <= slice.end
        );
        const slice = slices[sliceIndex];
        if (!slice) {
          continue;
        }
        const emphasis = normalized.selectedDataKey ?? normalized.focusDataKey;
        const dim = emphasis !== null && emphasis !== slice.name;
        const density = 0.92 - Math.abs(radius - 0.65) * 0.36;
        paintDither(
          frame,
          x,
          y,
          density,
          pie.variant,
          colorFor(normalized.config, slice.name),
          normalized.unicode,
          dim,
          5 + sliceIndex
        );
      }
    }
  }

  return finishDitherChart(prepared);
};
