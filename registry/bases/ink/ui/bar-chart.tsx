import { Box, Text } from "ink";
import React from "react";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  resolveTerminalSymbol,
  summarizeSeries,
} from "@/registry/bases/ink/lib/accessibility";
import {
  padToTerminalWidth,
  terminalWidth,
  truncateToTerminalWidth,
} from "@/registry/bases/ink/lib/terminal-text";

export interface BarChartItem {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarChartItem[];
  direction?: "horizontal" | "vertical";
  width?: number;
  height?: number;
  showValues?: boolean;
  title?: string;
  accessibleSummary?: string;
  "aria-label"?: string;
}

const BAR_CHAR = "█";
const EMPTY_CHAR = "░";

const pad = (str: string, length: number): string =>
  padToTerminalWidth(truncateToTerminalWidth(str, length), length);

const padStart = (str: string, length: number): string => {
  const value = truncateToTerminalWidth(str, length);
  return " ".repeat(Math.max(0, length - terminalWidth(value))) + value;
};

export const BarChart = ({
  data,
  direction = "horizontal",
  width = 30,
  height = 10,
  showValues = true,
  title,
  accessibleSummary,
  "aria-label": ariaLabel,
}: BarChartProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const barChar = resolveTerminalSymbol(unicode, BAR_CHAR, "#");
  const emptyChar = resolveTerminalSymbol(unicode, EMPTY_CHAR, ".");

  if (data.length === 0) {
    return <Text color={theme.colors.mutedForeground}>No data</Text>;
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const chartSummary =
    accessibleSummary ??
    summarizeSeries(
      title ?? "Bar chart",
      data.map((item) => ({ label: item.label, value: item.value })),
      12
    );

  if (direction === "horizontal") {
    const maxLabelLen = Math.max(...data.map((d) => terminalWidth(d.label)));
    const maxValLen = Math.max(
      ...data.map((d) => terminalWidth(String(d.value)))
    );
    const barWidth = width - maxLabelLen - maxValLen - 3;

    return (
      <Box flexDirection="column" aria-label={ariaLabel ?? chartSummary}>
        {title && (
          <Text bold color={theme.colors.primary}>
            {title}
          </Text>
        )}
        {data.map((item, idx) => {
          const filled =
            maxValue === 0
              ? 0
              : Math.round((item.value / maxValue) * Math.max(1, barWidth));
          const empty = Math.max(0, barWidth - filled);
          const barStr = barChar.repeat(filled) + emptyChar.repeat(empty);
          const resolvedColor = item.color ?? theme.colors.primary;

          return (
            <Box key={idx} flexDirection="row" gap={1}>
              <Text color={theme.colors.foreground}>
                {pad(item.label, maxLabelLen)}
              </Text>
              <Text color={resolvedColor}>{barStr}</Text>
              {showValues && (
                <Text color={theme.colors.mutedForeground}>
                  {padStart(String(item.value), maxValLen)}
                </Text>
              )}
            </Box>
          );
        })}
      </Box>
    );
  }

  const barW = Math.max(3, Math.floor(width / data.length));
  const rows: string[][] = [];

  for (let row = height - 1; row >= 0; row -= 1) {
    const threshold = (row / (height - 1)) * maxValue;
    const cells = data.map((item) => {
      const filled = item.value >= threshold;
      return filled ? barChar.repeat(barW) : " ".repeat(barW);
    });
    rows.push(cells);
  }

  return (
    <Box flexDirection="column" aria-label={ariaLabel ?? chartSummary}>
      {title && (
        <Text bold color={theme.colors.primary}>
          {title}
        </Text>
      )}
      {rows.map((row, rowIdx) => {
        const threshold = ((height - 1 - rowIdx) / (height - 1)) * maxValue;
        return (
          <Box key={rowIdx} flexDirection="row">
            {row.map((cell, colIdx) => {
              const item = data[colIdx];
              const resolvedColor = item.color ?? theme.colors.primary;
              const isFilled = item.value >= threshold;
              return (
                <Text
                  key={colIdx}
                  color={isFilled ? resolvedColor : theme.colors.muted}
                >
                  {cell}
                </Text>
              );
            })}
          </Box>
        );
      })}
      {showValues && (
        <Box flexDirection="row">
          {data.map((item, idx) => {
            const resolvedColor = item.color ?? theme.colors.primary;
            return (
              <Text key={idx} color={resolvedColor}>
                {pad(String(item.value), barW)}
              </Text>
            );
          })}
        </Box>
      )}
      <Box flexDirection="row">
        {data.map((item, idx) => (
          <Text key={idx} color={theme.colors.mutedForeground}>
            {pad(item.label, barW)}
          </Text>
        ))}
      </Box>
    </Box>
  );
};
