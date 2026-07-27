import { Box, Text, useInput } from "ink";
import * as React from "react";

import {
  useMotion,
  useTheme,
  useUnicode,
} from "@/components/ui/ink-theme-provider";
import {
  colorFor,
  easeInOutCubic,
  labelOf,
  valueAt,
} from "@/registry/bases/ink/lib/dither-chart-utils";
import type {
  AreaVariant,
  AxisSpec,
  BloomBlend,
  BloomConfig,
  BloomInput,
  ChartConfig,
  ChartMargins,
  ChartRow,
  ChartType,
  DitherCell,
  DitherChartRenderer,
  DitherColor,
  DotSpec,
  DotVariant,
  GridSpec,
  SeriesSpec,
  SeriesKind,
  StackType,
  StrokeVariant,
} from "@/registry/bases/ink/lib/dither-chart-utils";

export type {
  AreaVariant,
  BloomBlend,
  BloomConfig,
  BloomInput,
  ChartConfig,
  ChartMargins as Margins,
  ChartType,
  DitherColor,
  DotVariant,
  SeriesKind,
  StackType,
  StrokeVariant,
};

type DataObject = object;

export interface SeriesProps {
  children?: React.ReactNode;
  dataKey: string;
  isClickable?: boolean;
  strokeVariant?: StrokeVariant;
  variant?: AreaVariant;
}

export interface DotProps {
  r?: number;
  variant?: DotVariant;
}

export interface GridProps {
  horizontal?: boolean;
  strokeDasharray?: string;
  vertical?: boolean;
}

export interface XAxisProps {
  dataKey?: string;
  maxTicks?: number;
  tickFormatter?: (value: unknown, index: number) => string;
  tickMargin?: number;
}

export interface YAxisProps {
  tickCount?: number;
  tickFormatter?: (value: number) => string;
  tickMargin?: number;
}

export interface LegendProps {
  align?: "left" | "center" | "right";
  isClickable?: boolean;
}

export type TooltipVariant = "default" | "frosted-glass";

export interface TooltipProps {
  labelKey?: string;
  valueFormatter?: (value: number, name: string) => string;
  variant?: TooltipVariant;
}

type ChartRole =
  | "active-dot"
  | "area"
  | "bar"
  | "dot"
  | "grid"
  | "legend"
  | "line"
  | "pie"
  | "radar"
  | "tooltip"
  | "x-axis"
  | "y-axis";

type ChartPart = React.ComponentType<Record<string, unknown>> & {
  chartRole?: ChartRole;
};

export function Dot(_props: DotProps): null {
  return null;
}
Dot.chartRole = "dot" as const;

export function ActiveDot(_props: DotProps): null {
  return null;
}
ActiveDot.chartRole = "active-dot" as const;

export function Grid(_props: GridProps): null {
  return null;
}
Grid.chartRole = "grid" as const;

export function XAxis(_props: XAxisProps): null {
  return null;
}
XAxis.chartRole = "x-axis" as const;

export function YAxis(_props: YAxisProps): null {
  return null;
}
YAxis.chartRole = "y-axis" as const;

export function Legend(_props: LegendProps): null {
  return null;
}
Legend.chartRole = "legend" as const;

export function Tooltip(_props: TooltipProps): null {
  return null;
}
Tooltip.chartRole = "tooltip" as const;

interface ParsedParts {
  grid?: GridSpec;
  legend?: Required<LegendProps>;
  pieVariant: AreaVariant;
  series: SeriesSpec[];
  tooltip?: Required<Pick<TooltipProps, "variant">> & TooltipProps;
  xAxis?: AxisSpec;
  yAxis?: AxisSpec;
}

interface ParsedPieProps {
  variant?: AreaVariant;
}

interface ParsedRadarProps {
  dataKey: string;
  variant?: AreaVariant;
}

const dotSpec = (props: DotProps): DotSpec => ({
  radius: props.r ?? 2,
  variant: props.variant ?? "border",
});

const parseDots = (
  children: React.ReactNode
): Pick<SeriesSpec, "activeDot" | "dot"> => {
  const result: Pick<SeriesSpec, "activeDot" | "dot"> = {};
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      return;
    }
    const role = (child.type as ChartPart).chartRole;
    const props = child.props as DotProps;
    if (role === "dot") {
      result.dot = dotSpec(props);
    }
    if (role === "active-dot") {
      result.activeDot = dotSpec(props);
    }
  });
  return result;
};

const parseParts = (children: React.ReactNode): ParsedParts => {
  const parsed: ParsedParts = { pieVariant: "gradient", series: [] };

  const visit = (nodes: React.ReactNode): void => {
    React.Children.forEach(nodes, (child) => {
      if (!React.isValidElement(child)) {
        return;
      }
      const role = (child.type as ChartPart).chartRole;
      if (!role) {
        const nested = (child.props as { children?: React.ReactNode }).children;
        if (nested) {
          visit(nested);
        }
        return;
      }
      if (role === "area" || role === "line" || role === "bar") {
        const props = child.props as SeriesProps;
        parsed.series.push({
          ...parseDots(props.children),
          dataKey: props.dataKey,
          isClickable: props.isClickable ?? false,
          kind: role,
          strokeVariant: props.strokeVariant ?? "solid",
          variant: props.variant ?? "gradient",
        });
        return;
      }
      if (role === "radar") {
        const props = child.props as ParsedRadarProps;
        parsed.series.push({
          dataKey: props.dataKey,
          isClickable: false,
          kind: "radar",
          strokeVariant: "solid",
          variant: props.variant ?? "gradient",
        });
        return;
      }
      if (role === "pie") {
        parsed.pieVariant =
          (child.props as ParsedPieProps).variant ?? "gradient";
        return;
      }
      if (role === "grid") {
        const props = child.props as GridProps;
        parsed.grid = {
          horizontal: props.horizontal ?? true,
          strokeDasharray: props.strokeDasharray ?? "3 3",
          vertical: props.vertical ?? false,
        };
        return;
      }
      if (role === "x-axis") {
        const props = child.props as XAxisProps;
        parsed.xAxis = {
          dataKey: props.dataKey,
          maxTicks: props.maxTicks ?? 8,
          tickFormatter: props.tickFormatter,
        };
        return;
      }
      if (role === "y-axis") {
        const props = child.props as YAxisProps;
        parsed.yAxis = {
          tickCount: props.tickCount ?? 4,
          tickFormatter: props.tickFormatter
            ? (value) => props.tickFormatter?.(Number(value)) ?? ""
            : undefined,
        };
        return;
      }
      if (role === "legend") {
        const props = child.props as LegendProps;
        parsed.legend = {
          align: props.align ?? "right",
          isClickable: props.isClickable ?? false,
        };
        return;
      }
      if (role === "tooltip") {
        const props = child.props as TooltipProps;
        parsed.tooltip = { ...props, variant: props.variant ?? "default" };
      }
    });
  };

  visit(children);
  return parsed;
};

export interface TerminalChartOptions {
  className?: string;
  emptyMessage?: string;
  height?: number;
  isActive?: boolean;
  noColor?: boolean;
  reducedMotion?: boolean;
  screenReaderMode?: boolean;
  selectedDataKey?: string | null;
  showControls?: boolean;
  title?: string;
  unicode?: boolean;
  width?: number;
}

export interface InteractionOptions {
  bloom?: BloomInput;
  bloomOnHover?: boolean;
  defaultSelectedDataKey?: string | null;
  hovered?: boolean;
  interactive?: boolean;
  markerIndex?: number | null;
  onHoverChange?: (index: number | null) => void;
  onSelectionChange?: (key: string | null) => void;
}

export interface MotionOptions {
  animate?: boolean;
  animationDuration?: number;
  replayToken?: number;
}

export type CartesianChartProps<TData extends DataObject> =
  TerminalChartOptions &
    InteractionOptions &
    MotionOptions & {
      children: React.ReactNode;
      config: ChartConfig;
      data: TData[];
      margins?: Partial<ChartMargins>;
      stackType?: StackType;
    };

export interface DitherChartProps
  extends TerminalChartOptions, InteractionOptions, MotionOptions {
  children: React.ReactNode;
  config: ChartConfig;
  data: ChartRow[];
  dataKey?: string;
  kind: ChartType;
  innerRadius?: number;
  margins?: Partial<ChartMargins>;
  nameKey?: string;
  renderChart: DitherChartRenderer;
  stackType?: StackType;
}

const useEntrance = ({
  animate,
  data,
  duration,
  reduced,
  replayToken,
}: {
  animate: boolean;
  data: ChartRow[];
  duration: number;
  reduced: boolean;
  replayToken: number;
}): number => {
  const [progress, setProgress] = React.useState(animate && !reduced ? 0 : 1);

  React.useEffect(() => {
    if (!animate || reduced || duration <= 0) {
      setProgress(1);
      return;
    }
    const startedAt = Date.now();
    setProgress(0);
    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.min(1, elapsed / duration);
      setProgress(easeInOutCubic(next));
      if (next >= 1) {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [animate, data, duration, reduced, replayToken]);

  return progress;
};

interface CellRun extends Omit<DitherCell, "char"> {
  start: number;
  text: string;
}

const cellStyleKey = (cell: DitherCell, noColor: boolean): string =>
  [
    noColor ? "" : (cell.color ?? ""),
    cell.bold ? "1" : "0",
    cell.dim ? "1" : "0",
    cell.inverse ? "1" : "0",
  ].join(":");

const rowRuns = (row: DitherCell[], noColor: boolean): CellRun[] => {
  const runs: CellRun[] = [];
  for (let index = 0; index < row.length; index += 1) {
    const cell = row[index];
    if (!cell) {
      continue;
    }
    const previous = runs.at(-1);
    const key = cellStyleKey(cell, noColor);
    const previousKey = previous
      ? cellStyleKey(
          {
            bold: previous.bold,
            char: "",
            color: previous.color,
            dim: previous.dim,
            inverse: previous.inverse,
          },
          noColor
        )
      : "";
    if (previous && previousKey === key) {
      previous.text += cell.char;
      continue;
    }
    runs.push({
      bold: cell.bold,
      color: noColor ? undefined : cell.color,
      dim: cell.dim,
      inverse: cell.inverse,
      start: index,
      text: cell.char,
    });
  }
  return runs;
};

const clampIndex = (index: number, length: number): number | null =>
  length > 0 ? Math.max(0, Math.min(length - 1, index)) : null;

export const DitherChart = ({
  animate = true,
  animationDuration = 900,
  bloom = "off",
  bloomOnHover = false,
  children,
  config,
  data,
  dataKey,
  defaultSelectedDataKey = null,
  emptyMessage = "No data",
  height = 12,
  hovered = false,
  innerRadius = 0,
  interactive = true,
  isActive = true,
  margins,
  markerIndex = null,
  nameKey,
  noColor = false,
  onHoverChange,
  onSelectionChange,
  reducedMotion,
  renderChart,
  replayToken = 0,
  screenReaderMode = false,
  selectedDataKey: controlledSelected,
  showControls = false,
  stackType = "default",
  title,
  unicode,
  width = 56,
  kind,
}: DitherChartProps) => {
  const theme = useTheme();
  const motion = useMotion();
  const unicodeContext = useUnicode();
  const parts = React.useMemo(() => parseParts(children), [children]);
  const names = React.useMemo(
    () =>
      kind === "pie"
        ? data.map((row, index) => String(row[nameKey ?? "name"] ?? index))
        : parts.series.map((series) => series.dataKey),
    [data, kind, nameKey, parts.series]
  );
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const [focusIndex, setFocusIndex] = React.useState<number | null>(null);
  const [internalSelected, setInternalSelected] = React.useState<string | null>(
    defaultSelectedDataKey
  );
  const [localReplay, setLocalReplay] = React.useState(0);
  const selected =
    controlledSelected === undefined ? internalSelected : controlledSelected;
  const activeIndex = markerIndex ?? hoverIndex;
  const focusKey = focusIndex === null ? null : (names[focusIndex] ?? null);
  const selectable =
    (parts.legend?.isClickable ?? false) ||
    parts.series.some((series) => series.isClickable);
  const reduced = reducedMotion ?? motion.reduced;
  const useUnicodeGlyphs = unicode ?? unicodeContext;
  const progress = useEntrance({
    animate,
    data,
    duration: animationDuration,
    reduced,
    replayToken: replayToken + localReplay,
  });

  const moveHover = React.useCallback(
    (direction: -1 | 1) => {
      const start = hoverIndex ?? (direction > 0 ? -1 : data.length);
      const next = clampIndex(start + direction, data.length);
      setHoverIndex(next);
      onHoverChange?.(next);
    },
    [data.length, hoverIndex, onHoverChange]
  );

  const moveFocus = React.useCallback(
    (direction: -1 | 1) => {
      if (names.length === 0) {
        return;
      }
      setFocusIndex((current) => {
        if (current === null) {
          return direction > 0 ? 0 : names.length - 1;
        }
        return (current + direction + names.length) % names.length;
      });
    },
    [names.length]
  );

  const selectFocused = React.useCallback(() => {
    if (!selectable || names.length === 0) {
      return;
    }
    const key = focusKey ?? names[0] ?? null;
    const next = selected === key ? null : key;
    if (controlledSelected === undefined) {
      setInternalSelected(next);
    }
    onSelectionChange?.(next);
  }, [
    controlledSelected,
    focusKey,
    names,
    onSelectionChange,
    selectable,
    selected,
  ]);

  useInput(
    (input, key) => {
      if (key.leftArrow || input === "h") {
        moveHover(-1);
      } else if (key.rightArrow || input === "l") {
        moveHover(1);
      } else if (key.upArrow || input === "k") {
        moveFocus(-1);
      } else if (key.downArrow || input === "j") {
        moveFocus(1);
      } else if (key.return || input === " ") {
        selectFocused();
      } else if (key.escape) {
        setHoverIndex(null);
        setFocusIndex(null);
        onHoverChange?.(null);
      } else if (input.toLowerCase() === "r" && animate && !reduced) {
        setLocalReplay((value) => value + 1);
      }
    },
    { isActive: interactive && isActive }
  );

  const rendered = React.useMemo(
    () =>
      renderChart({
        bloom,
        bloomOnHover,
        config,
        data,
        focusDataKey: focusKey,
        grid: parts.grid,
        height,
        hovered: hovered || hoverIndex !== null,
        kind,
        margins,
        markerIndex: activeIndex,
        nameKey,
        pie:
          kind === "pie" && dataKey
            ? {
                innerRadius: Math.max(0, Math.min(0.92, innerRadius)),
                valueKey: dataKey,
                variant: parts.pieVariant,
              }
            : undefined,
        progress,
        selectedDataKey: selected,
        series: parts.series,
        stackType,
        unicode: useUnicodeGlyphs,
        width,
        xAxis: parts.xAxis,
        yAxis: parts.yAxis,
      }),
    [
      activeIndex,
      bloom,
      bloomOnHover,
      config,
      data,
      dataKey,
      focusKey,
      height,
      hoverIndex,
      hovered,
      innerRadius,
      kind,
      margins,
      nameKey,
      parts,
      progress,
      renderChart,
      selected,
      stackType,
      useUnicodeGlyphs,
      width,
    ]
  );

  if (data.length === 0) {
    return <Text color={theme.colors.mutedForeground}>{emptyMessage}</Text>;
  }

  const tooltipIndex =
    activeIndex === null ? null : clampIndex(activeIndex, data.length);
  const tooltipRow = tooltipIndex === null ? undefined : data[tooltipIndex];
  const tooltipLabelKey = parts.tooltip?.labelKey ?? parts.xAxis?.dataKey;
  const tooltipHeading =
    tooltipRow && tooltipLabelKey
      ? String(tooltipRow[tooltipLabelKey] ?? "")
      : kind === "pie" && tooltipIndex !== null
        ? names[tooltipIndex]
        : tooltipIndex === null
          ? ""
          : String(tooltipIndex);
  let tooltipNames = names;
  if (kind === "pie" && tooltipIndex !== null) {
    const pieName = names[tooltipIndex];
    tooltipNames = pieName ? [pieName] : [];
  }

  if (screenReaderMode) {
    return (
      <Box flexDirection="column">
        {title && <Text bold>{title}</Text>}
        {data.map((row, index) => {
          const heading =
            kind === "pie"
              ? String(row[nameKey ?? "name"] ?? index)
              : parts.xAxis?.dataKey
                ? String(row[parts.xAxis.dataKey] ?? index)
                : String(index);
          const values =
            kind === "pie" && dataKey
              ? `${labelOf(config, heading)} ${valueAt(row, dataKey)}`
              : names
                  .map(
                    (name) => `${labelOf(config, name)} ${valueAt(row, name)}`
                  )
                  .join(", ");
          return (
            <Text key={`${heading}-${index}`}>{`${heading}: ${values}`}</Text>
          );
        })}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" width={width}>
      {title && (
        <Text bold color={noColor ? undefined : theme.colors.primary}>
          {title}
        </Text>
      )}
      {parts.legend && (
        <Box
          flexDirection="row"
          flexWrap="wrap"
          justifyContent={
            parts.legend.align === "left"
              ? "flex-start"
              : parts.legend.align === "right"
                ? "flex-end"
                : "center"
          }
        >
          {names.map((name, index) => {
            const isFocused = focusIndex === index;
            const isSelected = selected === name;
            return (
              <Text
                key={name}
                bold={isFocused || isSelected}
                color={noColor ? undefined : colorFor(config, name)}
                dimColor={selected !== null && !isSelected && !isFocused}
                inverse={isSelected}
              >
                {`${useUnicodeGlyphs ? "■" : "#"} ${labelOf(config, name)} `}
              </Text>
            );
          })}
        </Box>
      )}
      {rendered.frame.map((row, rowIndex) => (
        <Text key={`dither-row-${rowIndex}`} wrap="truncate-end">
          {rowRuns(row, noColor).map((run) => (
            <Text
              key={`${rowIndex}-${run.start}`}
              bold={run.bold}
              color={run.color}
              dimColor={run.dim}
              inverse={run.inverse}
            >
              {run.text}
            </Text>
          ))}
        </Text>
      ))}
      {parts.tooltip && tooltipRow && tooltipIndex !== null && (
        <Box
          borderColor={noColor ? undefined : theme.colors.border}
          borderStyle={
            parts.tooltip.variant === "frosted-glass" ? "round" : "single"
          }
          flexDirection="column"
          paddingX={1}
        >
          <Text dimColor>{tooltipHeading}</Text>
          {tooltipNames.map((name) => {
            const value =
              kind === "pie" && dataKey
                ? valueAt(tooltipRow, dataKey)
                : valueAt(tooltipRow, name);
            const formatted = parts.tooltip?.valueFormatter
              ? parts.tooltip.valueFormatter(value, name)
              : value.toLocaleString();
            return (
              <Text
                key={name}
                dimColor={selected !== null && selected !== name}
              >
                {`${useUnicodeGlyphs ? "▪" : "*"} ${labelOf(config, name)}  ${formatted}`}
              </Text>
            );
          })}
        </Box>
      )}
      {showControls && interactive && (
        <Text color={noColor ? undefined : theme.colors.mutedForeground}>
          {"←/→ inspect  ↑/↓ series  enter select  esc clear  r replay"}
        </Text>
      )}
    </Box>
  );
};
