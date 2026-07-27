import {
  clamp,
  colorFor,
  finishDitherChart,
  paint,
  paintDither,
  prepareDitherChart,
  valueAt,
} from "./dither-chart-utils";
import type {
  DitherCell,
  DitherChartRenderer,
  DitherRenderInput,
  DitherRenderResult,
  SeriesSpec,
} from "./dither-chart-utils";

interface Point {
  x: number;
  y: number;
}

const pointInPolygon = (point: Point, polygon: Point[]): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    if (!(a && b)) {
      continue;
    }
    const intersects =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y || 1) + a.x;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
};

const distanceToSegment = (point: Point, start: Point, end: Point): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const amount =
    lengthSquared === 0
      ? 0
      : clamp(
          ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared,
          0,
          1
        );
  return Math.hypot(
    point.x - (start.x + amount * dx),
    point.y - (start.y + amount * dy)
  );
};

const paintRadarFrame = (
  frame: DitherCell[][],
  input: DitherRenderInput,
  axes: number,
  cx: number,
  cy: number,
  radiusX: number,
  radiusY: number
): void => {
  for (let ring = 1; ring <= 4; ring += 1) {
    const ratio = ring / 4;
    for (let step = 0; step < 72; step += 1) {
      const angle = (step / 72) * Math.PI * 2 - Math.PI / 2;
      paint(
        frame,
        Math.round(cx + Math.cos(angle) * radiusX * ratio),
        Math.round(cy + Math.sin(angle) * radiusY * ratio),
        {
          char: input.unicode ? "·" : ".",
          dim: true,
          priority: 1,
        }
      );
    }
  }

  for (let index = 0; index < input.data.length; index += 1) {
    const row = input.data[index] ?? {};
    const angle = (index / axes) * Math.PI * 2 - Math.PI / 2;
    const end = {
      x: Math.round(cx + Math.cos(angle) * radiusX),
      y: Math.round(cy + Math.sin(angle) * radiusY),
    };
    const steps = Math.max(Math.abs(end.x - cx), Math.abs(end.y - cy));
    for (let step = 0; step <= steps; step += 1) {
      paint(
        frame,
        Math.round(cx + ((end.x - cx) * step) / Math.max(1, steps)),
        Math.round(cy + ((end.y - cy) * step) / Math.max(1, steps)),
        {
          char: input.unicode ? "·" : ".",
          dim: true,
          priority: 1,
        }
      );
    }
    const label = String(row[input.nameKey ?? "name"] ?? index).slice(0, 8);
    const labelX = clamp(
      end.x - Math.floor(label.length / 2),
      0,
      Math.max(0, input.width - label.length)
    );
    for (let offset = 0; offset < label.length; offset += 1) {
      paint(frame, labelX + offset, clamp(end.y, 0, input.height - 1), {
        char: label[offset] ?? " ",
        dim: true,
        priority: 9,
      });
    }
  }
};

const paintRadarSeries = (
  frame: DitherCell[][],
  input: DitherRenderInput,
  plot: DitherRenderResult["plot"],
  max: number,
  axes: number,
  cx: number,
  cy: number,
  radiusX: number,
  radiusY: number,
  series: SeriesSpec,
  seriesIndex: number
): void => {
  const polygon = input.data.map((row, index) => {
    const angle = (index / axes) * Math.PI * 2 - Math.PI / 2;
    const ratio = (valueAt(row, series.dataKey) / max) * input.progress;
    return {
      x: cx + Math.cos(angle) * radiusX * ratio,
      y: cy + Math.sin(angle) * radiusY * ratio,
    };
  });
  const color = colorFor(input.config, series.dataKey);
  const emphasis = input.selectedDataKey ?? input.focusDataKey;
  const dim = emphasis !== null && emphasis !== series.dataKey;
  for (let y = plot.top; y < plot.top + plot.height; y += 1) {
    for (let x = plot.left; x < plot.left + plot.width; x += 1) {
      const point = { x, y };
      const inside = pointInPolygon(point, polygon);
      const edge = polygon.some(
        (start, index) =>
          distanceToSegment(
            point,
            start,
            polygon[(index + 1) % polygon.length] ?? start
          ) <= 0.58
      );
      if (inside) {
        paintDither(
          frame,
          x,
          y,
          0.68 + (input.hovered ? 0.1 : 0),
          series.variant,
          color,
          input.unicode,
          dim,
          4 + seriesIndex
        );
      }
      if (edge) {
        paint(frame, x, y, {
          bold: true,
          char: input.unicode ? "•" : "*",
          color,
          dim,
          priority: 7 + seriesIndex,
        });
      }
    }
  }
};

export const renderDitherRadarChart: DitherChartRenderer = (input) => {
  const prepared = prepareDitherChart(input, "radar");
  const { frame, input: normalized, max, plot } = prepared;
  const axes = normalized.data.length;

  if (axes >= 3) {
    const cx = plot.left + (plot.width - 1) / 2;
    const cy = plot.top + (plot.height - 1) / 2;
    const radiusY = Math.max(
      2,
      Math.min((plot.height - 2) / 2, plot.width / 4)
    );
    const radiusX = Math.max(4, Math.min((plot.width - 4) / 2, radiusY * 2));
    paintRadarFrame(frame, normalized, axes, cx, cy, radiusX, radiusY);
    for (
      let seriesIndex = 0;
      seriesIndex < normalized.series.length;
      seriesIndex += 1
    ) {
      const series = normalized.series[seriesIndex];
      if (series) {
        paintRadarSeries(
          frame,
          normalized,
          plot,
          max,
          axes,
          cx,
          cy,
          radiusX,
          radiusY,
          series,
          seriesIndex
        );
      }
    }
  }

  return finishDitherChart(prepared);
};
