import { Box, Text } from "ink";

import { useTheme } from "@/components/ui/ink-theme-provider";

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
}

const BAR_CHAR = "█";
const EMPTY_CHAR = "░";

const pad = (str: string, length: number): string => {
  if (str.length >= length) {
    return str.slice(0, length);
  }
  return `${str} `.repeat(length - str.length);
};

const padStart = (str: string, length: number): string => {
  if (str.length >= length) {
    return str.slice(0, length);
  }
  return " ".repeat(length - str.length) + str;
};

export const BarChart = ({
  data,
  direction = "horizontal",
  width = 30,
  height = 10,
  showValues = true,
  title,
}: BarChartProps) => {
  const theme = useTheme();

  if (data.length === 0) {
    return <Text color={theme.colors.mutedForeground}>No data</Text>;
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  if (direction === "horizontal") {
    const maxLabelLen = Math.max(...data.map((d) => d.label.length));
    const maxValLen = Math.max(...data.map((d) => String(d.value).length));
    const barWidth = width - maxLabelLen - maxValLen - 3;

    return (
      <Box flexDirection="column">
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
          const barStr = BAR_CHAR.repeat(filled) + EMPTY_CHAR.repeat(empty);
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
      return filled ? BAR_CHAR.repeat(barW) : " ".repeat(barW);
    });
    rows.push(cells);
  }

  return (
    <Box flexDirection="column">
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
