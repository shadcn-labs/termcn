export type DitherColor =
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "orange"
  | "red"
  | "grey";

export type AreaVariant = "gradient" | "dotted" | "hatched" | "solid";
export type StrokeVariant = "solid" | "dashed";
export type StackType = "default" | "stacked" | "percent";
export type ChartType = "area" | "line" | "bar" | "pie" | "radar";
export type SeriesKind = "area" | "line" | "bar" | "radar";
export type DotVariant = "border" | "colored-border" | "filled";
export type BloomLevel = "off" | "low" | "high" | "aura";
export type BloomBlend = "plus-lighter" | "screen" | "lighten";

export interface BloomConfig {
  blend?: BloomBlend;
  blur: number;
  brightness: number;
  opacity: number;
  saturate?: number;
}

export type BloomInput = BloomLevel | BloomConfig;

export type ChartConfig = Record<
  string,
  {
    color: DitherColor;
    label?: string;
  }
>;

export type ChartRow = Record<string, unknown>;

export interface DitherCell {
  bold?: boolean;
  char: string;
  color?: string;
  dim?: boolean;
  inverse?: boolean;
  priority?: number;
}

export interface DotSpec {
  radius: number;
  variant: DotVariant;
}

export interface SeriesSpec {
  activeDot?: DotSpec;
  dataKey: string;
  dot?: DotSpec;
  isClickable: boolean;
  kind: SeriesKind;
  strokeVariant: StrokeVariant;
  variant: AreaVariant;
}

export interface AxisSpec {
  dataKey?: string;
  maxTicks?: number;
  tickCount?: number;
  tickFormatter?: (value: unknown, index: number) => string;
}

export interface GridSpec {
  horizontal: boolean;
  strokeDasharray: string;
  vertical: boolean;
}

export interface ChartMargins {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export interface DitherRenderInput {
  bloom: BloomInput;
  bloomOnHover: boolean;
  config: ChartConfig;
  data: ChartRow[];
  focusDataKey: string | null;
  grid?: GridSpec;
  height: number;
  hovered: boolean;
  kind: ChartType;
  margins?: Partial<ChartMargins>;
  markerIndex: number | null;
  nameKey?: string;
  pie?: {
    innerRadius: number;
    variant: AreaVariant;
    valueKey: string;
  };
  progress: number;
  selectedDataKey: string | null;
  series: SeriesSpec[];
  stackType: StackType;
  unicode: boolean;
  width: number;
  xAxis?: AxisSpec;
  yAxis?: AxisSpec;
}

export interface DitherRenderResult {
  frame: DitherCell[][];
  max: number;
  names: string[];
  plot: {
    height: number;
    left: number;
    top: number;
    width: number;
  };
}

export type DitherChartRenderer = (
  input: DitherRenderInput
) => DitherRenderResult;

export interface PreparedDitherChart {
  bands: Record<string, [number, number][]>;
  frame: DitherCell[][];
  input: DitherRenderInput;
  max: number;
  names: string[];
  plot: DitherRenderResult["plot"];
}

const PALETTE: Record<DitherColor, string> = {
  blue: "#3590f3",
  green: "#28d26e",
  grey: "#8c8c96",
  orange: "#ff9632",
  pink: "#f05abe",
  purple: "#966eff",
  red: "#f04646",
};

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const finiteNumber = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;

export const makeFrame = (width: number, height: number): DitherCell[][] =>
  Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({ char: " ", priority: 0 }))
  );

export const paint = (
  frame: DitherCell[][],
  x: number,
  y: number,
  cell: DitherCell
): void => {
  const row = frame[y];
  const current = row?.[x];
  if (!current || (current.priority ?? 0) > (cell.priority ?? 1)) {
    return;
  }
  row[x] = cell;
};

const ditherChar = (
  density: number,
  variant: AreaVariant,
  x: number,
  y: number,
  unicode: boolean
): string => {
  const threshold = ((BAYER4[y % 4]?.[x % 4] ?? 0) + 0.5) / 16;
  const level = clamp(density * 1.2 - threshold * 0.2, 0, 1);
  if (variant === "solid") {
    return unicode ? "█" : "#";
  }
  if (level <= threshold * 0.68) {
    return " ";
  }
  if (variant === "dotted") {
    if (!unicode) {
      return ".";
    }
    return level > 0.82 ? "•" : "·";
  }
  if (variant === "hatched") {
    if (!unicode) {
      return "/";
    }
    return (x + y) % 2 === 0 ? "╱" : "╲";
  }
  if (unicode) {
    if (level > 0.88) {
      return "█";
    }
    if (level > 0.68) {
      return "▓";
    }
    if (level > 0.46) {
      return "▒";
    }
    if (level > 0.26) {
      return "░";
    }
    return "·";
  }
  if (level > 0.82) {
    return "#";
  }
  if (level > 0.58) {
    return "+";
  }
  if (level > 0.34) {
    return ":";
  }
  return ".";
};

export const paintDither = (
  frame: DitherCell[][],
  x: number,
  y: number,
  density: number,
  variant: AreaVariant,
  color: string,
  unicode: boolean,
  dim: boolean,
  priority = 4
): void => {
  let char = ditherChar(density, variant, x, y, unicode);
  if (char === " ") {
    return;
  }
  if (unicode && density > 0.9 && (x * 17 + y * 31) % 47 === 0) {
    char = "✦";
  }
  paint(frame, x, y, { char, color, dim, priority });
};

export const lineChar = (unicode: boolean, active = false): string => {
  if (!unicode) {
    return active ? "O" : "*";
  }
  return active ? "◉" : "●";
};

export const dotChar = (unicode: boolean, variant: DotVariant): string => {
  if (variant === "filled") {
    return lineChar(unicode);
  }
  return unicode ? "○" : "o";
};

export const colorFor = (config: ChartConfig, key: string): string =>
  PALETTE[config[key]?.color ?? "grey"];

export const labelOf = (config: ChartConfig, key: string): string =>
  config[key]?.label ?? key;

export const valueAt = (row: ChartRow | undefined, key: string): number =>
  finiteNumber(row?.[key]);

export const chartNames = (
  kind: ChartType,
  data: ChartRow[],
  series: SeriesSpec[],
  nameKey?: string
): string[] => {
  if (kind === "pie") {
    return data.map((row, index) => String(row[nameKey ?? "name"] ?? index));
  }
  return series.map((item) => item.dataKey);
};

export const computeBands = (
  data: ChartRow[],
  series: SeriesSpec[],
  stackType: StackType
): { bands: Record<string, [number, number][]>; max: number } => {
  const bands: Record<string, [number, number][]> = {};
  let max = 0;
  if (stackType === "default") {
    for (const item of series) {
      const itemBands: [number, number][] = [];
      for (const row of data) {
        const value = valueAt(row, item.dataKey);
        max = Math.max(max, value);
        itemBands.push([0, value]);
      }
      bands[item.dataKey] = itemBands;
    }
    return { bands, max: max || 1 };
  }

  for (let index = 0; index < data.length; index += 1) {
    const row = data[index] ?? {};
    const total = series.reduce(
      (sum, item) => sum + valueAt(row, item.dataKey),
      0
    );
    let floor = 0;
    for (const item of series) {
      const raw = valueAt(row, item.dataKey);
      const value = stackType === "percent" && total > 0 ? raw / total : raw;
      const top = floor + value;
      (bands[item.dataKey] ??= [])[index] = [floor, top];
      floor = top;
      max = Math.max(max, top);
    }
  }
  return { bands, max: max || 1 };
};

const defaultMargins = (input: DitherRenderInput): ChartMargins => ({
  bottom: input.xAxis ? 2 : 0,
  left: input.yAxis ? 7 : 0,
  right: 0,
  top: 0,
  ...input.margins,
});

export const resolvePlot = (
  input: DitherRenderInput
): DitherRenderResult["plot"] => {
  const margins = defaultMargins(input);
  return {
    height: Math.max(2, input.height - margins.top - margins.bottom),
    left: clamp(margins.left, 0, Math.max(0, input.width - 2)),
    top: clamp(margins.top, 0, Math.max(0, input.height - 2)),
    width: Math.max(2, input.width - margins.left - margins.right),
  };
};

export const xPosition = (
  index: number,
  count: number,
  left: number,
  width: number
): number => {
  if (count <= 1) {
    return left + Math.floor((width - 1) / 2);
  }
  return left + Math.round((index / (count - 1)) * (width - 1));
};

export const yPosition = (
  value: number,
  max: number,
  top: number,
  height: number
): number => top + height - 1 - Math.round((value / max) * (height - 1));

const formatNumber = (value: number): string => {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(1);
};

export const paintGrid = (
  frame: DitherCell[][],
  input: DitherRenderInput,
  plot: DitherRenderResult["plot"],
  max: number
): void => {
  const { grid } = input;
  if (!grid) {
    return;
  }
  const char = input.unicode ? "┄" : ".";
  if (grid.horizontal) {
    for (let tick = 0; tick < 4; tick += 1) {
      const value = (tick / 3) * max;
      const y = yPosition(value, max, plot.top, plot.height);
      for (let x = plot.left; x < plot.left + plot.width; x += 1) {
        if (!grid.strokeDasharray || x % 2 === 0) {
          paint(frame, x, y, { char, dim: true, priority: 1 });
        }
      }
    }
  }
  if (grid.vertical) {
    const step = Math.max(1, Math.ceil(input.data.length / 8));
    for (let index = 0; index < input.data.length; index += 1) {
      if (index % step !== 0) {
        continue;
      }
      const x = xPosition(index, input.data.length, plot.left, plot.width);
      for (let y = plot.top; y < plot.top + plot.height; y += 1) {
        if (!grid.strokeDasharray || y % 2 === 0) {
          paint(frame, x, y, {
            char: input.unicode ? "┊" : ":",
            dim: true,
            priority: 1,
          });
        }
      }
    }
  }
};

export const paintCrosshair = (
  frame: DitherCell[][],
  input: DitherRenderInput,
  plot: DitherRenderResult["plot"]
): void => {
  if (input.markerIndex === null || input.data.length === 0) {
    return;
  }
  const index = clamp(input.markerIndex, 0, input.data.length - 1);
  const x = xPosition(index, input.data.length, plot.left, plot.width);
  for (let y = plot.top; y < plot.top + plot.height; y += 1) {
    paint(frame, x, y, {
      char: input.unicode ? "┊" : ":",
      dim: true,
      priority: 2,
    });
  }
};

const paintYAxis = (
  frame: DitherCell[][],
  input: DitherRenderInput,
  plot: DitherRenderResult["plot"],
  max: number
): void => {
  if (!input.yAxis) {
    return;
  }
  const count = Math.max(2, input.yAxis.tickCount ?? 4);
  for (let tick = 0; tick < count; tick += 1) {
    const value = (tick / (count - 1)) * max;
    const y = yPosition(value, max, plot.top, plot.height);
    const formatter = input.yAxis.tickFormatter;
    const label = formatter ? formatter(value, tick) : formatNumber(value);
    const fitted = label.slice(-Math.max(1, plot.left - 1));
    const padded = fitted.padStart(Math.max(1, plot.left - 1));
    for (let index = 0; index < padded.length; index += 1) {
      paint(frame, index, y, {
        char: padded[index] ?? " ",
        dim: true,
        priority: 8,
      });
    }
    paint(frame, plot.left - 1, y, {
      char: input.unicode ? "┤" : "|",
      dim: true,
      priority: 8,
    });
  }
};

const paintXAxis = (
  frame: DitherCell[][],
  input: DitherRenderInput,
  plot: DitherRenderResult["plot"]
): void => {
  if (!input.xAxis || input.data.length === 0) {
    return;
  }
  const axisY = plot.top + plot.height;
  if (axisY < frame.length) {
    for (let x = plot.left; x < plot.left + plot.width; x += 1) {
      paint(frame, x, axisY, {
        char: input.unicode ? "─" : "-",
        dim: true,
        priority: 8,
      });
    }
  }
  const maxTicks = Math.max(2, input.xAxis.maxTicks ?? 8);
  const step = Math.max(1, Math.ceil(input.data.length / maxTicks));
  for (let index = 0; index < input.data.length; index += 1) {
    if (index % step !== 0 && index !== input.data.length - 1) {
      continue;
    }
    const row = input.data[index] ?? {};
    const raw = input.xAxis.dataKey ? row[input.xAxis.dataKey] : index;
    const label = input.xAxis.tickFormatter
      ? input.xAxis.tickFormatter(raw, index)
      : String(raw ?? "");
    const x = xPosition(index, input.data.length, plot.left, plot.width);
    const start = clamp(
      x - Math.floor(label.length / 2),
      plot.left,
      Math.max(plot.left, plot.left + plot.width - label.length)
    );
    const visibleLabel = label.slice(0, plot.width);
    for (let offset = 0; offset < visibleLabel.length; offset += 1) {
      paint(frame, start + offset, axisY + 1, {
        char: visibleLabel[offset] ?? " ",
        dim: true,
        priority: 8,
      });
    }
  }
};

export const paintAxes = (
  frame: DitherCell[][],
  input: DitherRenderInput,
  plot: DitherRenderResult["plot"],
  max: number
): void => {
  paintYAxis(frame, input, plot, max);
  paintXAxis(frame, input, plot);
};

const bloomLevel = (input: BloomInput): BloomLevel => {
  if (typeof input === "string") {
    return input;
  }
  if (input.blur >= 10) {
    return "aura";
  }
  if (input.blur >= 5) {
    return "high";
  }
  return "low";
};

interface BloomSource {
  color: string;
  x: number;
  y: number;
}

const bloomSources = (frame: DitherCell[][]): BloomSource[] => {
  const sources: BloomSource[] = [];
  for (let y = 0; y < frame.length; y += 1) {
    const row = frame[y] ?? [];
    for (let x = 0; x < row.length; x += 1) {
      const cell = row[x];
      if ((cell?.priority ?? 0) >= 4 && cell?.color) {
        sources.push({ color: cell.color, x, y });
      }
    }
  }
  return sources;
};

const paintBloomSource = (
  frame: DitherCell[][],
  input: DitherRenderInput,
  radius: number,
  source: BloomSource
): void => {
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      if (dx === 0 && dy === 0) {
        continue;
      }
      const distance = Math.abs(dx) + Math.abs(dy);
      if (distance > radius + 1) {
        continue;
      }
      paint(frame, source.x + dx, source.y + dy, {
        char: input.unicode ? "·" : ".",
        color: source.color,
        dim: true,
        priority: 2,
      });
    }
  }
};

const applyBloom = (frame: DitherCell[][], input: DitherRenderInput): void => {
  const level = bloomLevel(input.bloom);
  if (level === "off" || (input.bloomOnHover && !input.hovered)) {
    return;
  }
  const configuredRadius =
    typeof input.bloom === "string"
      ? undefined
      : clamp(Math.round(input.bloom.blur / 3), 1, 3);
  const radius = Math.max(
    1,
    Math.round(configuredRadius ?? (level === "aura" ? 2 : 1))
  );

  for (const source of bloomSources(frame)) {
    paintBloomSource(frame, input, radius, source);
  }
};

export const prepareDitherChart = (
  input: DitherRenderInput,
  kind: ChartType
): PreparedDitherChart => {
  const width = Math.max(8, Math.floor(input.width));
  const height = Math.max(3, Math.floor(input.height));
  const normalizedInput = { ...input, height, kind, width };
  const frame = makeFrame(width, height);
  const plot = resolvePlot(normalizedInput);
  const { bands, max } = computeBands(
    normalizedInput.data,
    normalizedInput.series,
    normalizedInput.stackType
  );
  const names = chartNames(
    kind,
    normalizedInput.data,
    normalizedInput.series,
    normalizedInput.nameKey
  );
  return { bands, frame, input: normalizedInput, max, names, plot };
};

export const finishDitherChart = ({
  frame,
  input,
  max,
  names,
  plot,
}: PreparedDitherChart): DitherRenderResult => {
  applyBloom(frame, input);
  return { frame, max, names, plot };
};

export const easeInOutCubic = (value: number): number =>
  value < 0.5 ? 4 * value * value * value : 1 - (-2 * value + 2) ** 3 / 2;
