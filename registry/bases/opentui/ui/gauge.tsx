/* @jsxImportSource @opentui/react */
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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
): ReactNode => {
  const width = 10;
  const filled = Math.round(pct * width);
  const empty = width - filled;
  const bar = `${ARC_CHARS_FILL.repeat(filled)}${ARC_CHARS_EMPTY.repeat(empty)}`;

  return (
    <box flexDirection="row" gap={1}>
      <text fg={mutedColor}>[</text>
      <text fg={color}>{bar}</text>
      <text fg={mutedColor}>]</text>
      <text fg={color}>{`${Math.round(pct * 100)}%`}</text>
    </box>
  );
};

const renderMdGauge = (
  pct: number,
  color: string,
  mutedColor: string,
  fgColor: string
): ReactNode => {
  const arcWidth = 14;
  const filled = Math.round(pct * arcWidth);
  const empty = arcWidth - filled;
  const bottomFill = `${ARC_CHARS_FILL.repeat(filled)}${ARC_CHARS_EMPTY.repeat(empty)}`;
  const pctStr = `${Math.round(pct * 100)}%`;

  return (
    <box flexDirection="column">
      <text fg={mutedColor}>{`╭${"─".repeat(arcWidth)}╮`}</text>
      <box flexDirection="row">
        <text fg={mutedColor}>│</text>
        <text fg={fgColor}>{` ${pctStr} `.padEnd(arcWidth)}</text>
        <text fg={mutedColor}>│</text>
      </box>
      <box flexDirection="row">
        <text fg={mutedColor}>╰</text>
        <text fg={color}>{bottomFill}</text>
        <text fg={mutedColor}>╯</text>
      </box>
    </box>
  );
};

const renderLgGauge = (
  pct: number,
  color: string,
  mutedColor: string,
  fgColor: string
): ReactNode => {
  const arcWidth = 22;
  const filled = Math.round(pct * arcWidth);
  const empty = arcWidth - filled;
  const bottomFill = `${ARC_CHARS_FILL.repeat(filled)}${ARC_CHARS_EMPTY.repeat(empty)}`;
  const pctStr = `${Math.round(pct * 100)}%`;
  const centeredPct = pctStr
    .padStart(Math.floor((arcWidth + pctStr.length) / 2))
    .padEnd(arcWidth);

  return (
    <box flexDirection="column">
      <text fg={mutedColor}>{` ╭${"─".repeat(arcWidth)}╮`}</text>
      <text fg={mutedColor}>{`╱${" ".repeat(arcWidth)}╲`}</text>
      <box flexDirection="row">
        <text fg={mutedColor}>│</text>
        <text fg={fgColor}>
          <b>{centeredPct}</b>
        </text>
        <text fg={mutedColor}>│</text>
      </box>
      <text fg={mutedColor}>{`╲${" ".repeat(arcWidth)}╱`}</text>
      <box flexDirection="row">
        <text fg={mutedColor}>{" ╰"}</text>
        <text fg={color}>{bottomFill}</text>
        <text fg={mutedColor}>╯</text>
      </box>
    </box>
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

  let gaugeNode: ReactNode;
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
    <box flexDirection="column">
      {gaugeNode}
      {label && <text fg={theme.colors.mutedForeground}>{label}</text>}
    </box>
  );
};
