import { Box, Text } from "ink";

import { useTheme } from "@/components/ui/ink-theme-provider";

export type GaugeSize = "sm" | "md" | "lg";

export interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  color?: string;
  size?: GaugeSize;
}

const ARC_CHARS_FILL = "█";
const ARC_CHARS_EMPTY = "░";

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const renderSmGauge = (
  pct: number,
  color: string,
  mutedColor: string
): React.ReactNode => {
  const width = 10;
  const filled = Math.round(pct * width);
  const empty = width - filled;
  const bar = `${ARC_CHARS_FILL.repeat(filled)}${ARC_CHARS_EMPTY.repeat(empty)}`;

  return (
    <Box flexDirection="row" gap={1}>
      <Text color={mutedColor}>[</Text>
      <Text color={color}>{bar}</Text>
      <Text color={mutedColor}>]</Text>
      <Text color={color}>{Math.round(pct * 100)}%</Text>
    </Box>
  );
};

const renderMdGauge = (
  pct: number,
  color: string,
  mutedColor: string,
  fgColor: string
): React.ReactNode => {
  const arcWidth = 14;
  const filled = Math.round(pct * arcWidth);
  const empty = arcWidth - filled;
  const bottomFill = `${ARC_CHARS_FILL.repeat(filled)}${ARC_CHARS_EMPTY.repeat(empty)}`;
  const pctStr = `${Math.round(pct * 100)}%`;

  return (
    <Box flexDirection="column">
      <Text color={mutedColor}>{`╭${"─".repeat(arcWidth)}╮`}</Text>
      <Box flexDirection="row">
        <Text color={mutedColor}>│</Text>
        <Text color={fgColor}>{` ${pctStr} `.padEnd(arcWidth)}</Text>
        <Text color={mutedColor}>│</Text>
      </Box>
      <Box flexDirection="row">
        <Text color={mutedColor}>╰</Text>
        <Text color={color}>{bottomFill}</Text>
        <Text color={mutedColor}>╯</Text>
      </Box>
    </Box>
  );
};

const renderLgGauge = (
  pct: number,
  color: string,
  mutedColor: string,
  fgColor: string
): React.ReactNode => {
  const arcWidth = 22;
  const filled = Math.round(pct * arcWidth);
  const empty = arcWidth - filled;
  const bottomFill = `${ARC_CHARS_FILL.repeat(filled)}${ARC_CHARS_EMPTY.repeat(empty)}`;
  const pctStr = `${Math.round(pct * 100)}%`;
  const centeredPct = pctStr
    .padStart(Math.floor((arcWidth + pctStr.length) / 2))
    .padEnd(arcWidth);

  return (
    <Box flexDirection="column">
      <Text color={mutedColor}>{` ╭${"─".repeat(arcWidth)}╮`}</Text>
      <Text color={mutedColor}>{`╱${" ".repeat(arcWidth)}╲`}</Text>
      <Box flexDirection="row">
        <Text color={mutedColor}>│</Text>
        <Text color={fgColor} bold>
          {centeredPct}
        </Text>
        <Text color={mutedColor}>│</Text>
      </Box>
      <Text color={mutedColor}>{`╲${" ".repeat(arcWidth)}╱`}</Text>
      <Box flexDirection="row">
        <Text color={mutedColor}>{" ╰"}</Text>
        <Text color={color}>{bottomFill}</Text>
        <Text color={mutedColor}>╯</Text>
      </Box>
    </Box>
  );
};

export const Gauge = ({
  value,
  min = 0,
  max = 100,
  label,
  color,
  size = "md",
}: GaugeProps) => {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.primary;
  const clamped = clamp(value, min, max);
  const pct = max === min ? 0 : (clamped - min) / (max - min);

  let gaugeNode: React.ReactNode;
  if (size === "sm") {
    gaugeNode = renderSmGauge(pct, resolvedColor, theme.colors.mutedForeground);
  } else if (size === "lg") {
    gaugeNode = renderLgGauge(
      pct,
      resolvedColor,
      theme.colors.mutedForeground,
      theme.colors.foreground
    );
  } else {
    gaugeNode = renderMdGauge(
      pct,
      resolvedColor,
      theme.colors.mutedForeground,
      theme.colors.foreground
    );
  }

  return (
    <Box flexDirection="column">
      {gaugeNode}
      {label && <Text color={theme.colors.mutedForeground}>{label}</Text>}
    </Box>
  );
};
