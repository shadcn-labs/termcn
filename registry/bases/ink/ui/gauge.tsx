import { Box, Text } from "ink";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { toAsciiComponentText } from "@/registry/bases/ink/lib/accessibility";

export type GaugeSize = "sm" | "md" | "lg";

export interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  color?: string;
  size?: GaugeSize;
  "aria-label"?: string;
}

const ARC_CHARS_FILL = "█";
const ARC_CHARS_EMPTY = "░";

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const renderSmGauge = (
  pct: number,
  color: string,
  mutedColor: string,
  unicode: boolean
): React.ReactNode => {
  const width = 10;
  const filled = Math.round(pct * width);
  const empty = width - filled;
  const unicodeBar = `${ARC_CHARS_FILL.repeat(filled)}${ARC_CHARS_EMPTY.repeat(empty)}`;
  const bar = unicode ? unicodeBar : toAsciiComponentText(unicodeBar);

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
  fgColor: string,
  unicode: boolean
): React.ReactNode => {
  const arcWidth = 14;
  const filled = Math.round(pct * arcWidth);
  const empty = arcWidth - filled;
  const unicodeBottomFill = `${ARC_CHARS_FILL.repeat(filled)}${ARC_CHARS_EMPTY.repeat(empty)}`;
  const bottomFill = unicode
    ? unicodeBottomFill
    : toAsciiComponentText(unicodeBottomFill);
  const visual = (value: string) =>
    unicode ? value : toAsciiComponentText(value);
  const pctStr = `${Math.round(pct * 100)}%`;

  return (
    <Box flexDirection="column">
      <Text color={mutedColor}>{visual(`╭${"─".repeat(arcWidth)}╮`)}</Text>
      <Box flexDirection="row">
        <Text color={mutedColor}>{visual("│")}</Text>
        <Text color={fgColor}>{` ${pctStr} `.padEnd(arcWidth)}</Text>
        <Text color={mutedColor}>{visual("│")}</Text>
      </Box>
      <Box flexDirection="row">
        <Text color={mutedColor}>{visual("╰")}</Text>
        <Text color={color}>{bottomFill}</Text>
        <Text color={mutedColor}>{visual("╯")}</Text>
      </Box>
    </Box>
  );
};

const renderLgGauge = (
  pct: number,
  color: string,
  mutedColor: string,
  fgColor: string,
  unicode: boolean
): React.ReactNode => {
  const arcWidth = 22;
  const filled = Math.round(pct * arcWidth);
  const empty = arcWidth - filled;
  const unicodeBottomFill = `${ARC_CHARS_FILL.repeat(filled)}${ARC_CHARS_EMPTY.repeat(empty)}`;
  const bottomFill = unicode
    ? unicodeBottomFill
    : toAsciiComponentText(unicodeBottomFill);
  const visual = (value: string) =>
    unicode ? value : toAsciiComponentText(value);
  const pctStr = `${Math.round(pct * 100)}%`;
  const centeredPct = pctStr
    .padStart(Math.floor((arcWidth + pctStr.length) / 2))
    .padEnd(arcWidth);

  return (
    <Box flexDirection="column">
      <Text color={mutedColor}>{visual(` ╭${"─".repeat(arcWidth)}╮`)}</Text>
      <Text color={mutedColor}>{visual(`╱${" ".repeat(arcWidth)}╲`)}</Text>
      <Box flexDirection="row">
        <Text color={mutedColor}>{visual("│")}</Text>
        <Text color={fgColor} bold>
          {centeredPct}
        </Text>
        <Text color={mutedColor}>{visual("│")}</Text>
      </Box>
      <Text color={mutedColor}>{visual(`╲${" ".repeat(arcWidth)}╱`)}</Text>
      <Box flexDirection="row">
        <Text color={mutedColor}>{visual(" ╰")}</Text>
        <Text color={color}>{bottomFill}</Text>
        <Text color={mutedColor}>{visual("╯")}</Text>
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
  "aria-label": ariaLabel,
}: GaugeProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedColor = color ?? theme.colors.primary;
  const clamped = clamp(value, min, max);
  const pct = max === min ? 0 : (clamped - min) / (max - min);

  let gaugeNode: React.ReactNode;
  if (size === "sm") {
    gaugeNode = renderSmGauge(
      pct,
      resolvedColor,
      theme.colors.mutedForeground,
      unicode
    );
  } else if (size === "lg") {
    gaugeNode = renderLgGauge(
      pct,
      resolvedColor,
      theme.colors.mutedForeground,
      theme.colors.foreground,
      unicode
    );
  } else {
    gaugeNode = renderMdGauge(
      pct,
      resolvedColor,
      theme.colors.mutedForeground,
      theme.colors.foreground,
      unicode
    );
  }

  return (
    <Box
      flexDirection="column"
      aria-role="progressbar"
      aria-label={
        ariaLabel ??
        `${label ?? "Gauge"}: ${Math.round(pct * 100)}%, ${clamped} of ${max}.`
      }
      aria-state={{ busy: pct < 1 }}
    >
      {gaugeNode}
      {label && <Text color={theme.colors.mutedForeground}>{label}</Text>}
    </Box>
  );
};
