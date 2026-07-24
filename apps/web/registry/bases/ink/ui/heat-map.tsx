import { Box, Text } from "ink";

import { useTheme } from "@/components/ui/ink-theme-provider";

export interface HeatMapProps {
  data: number[][];
  rowLabels?: string[];
  colLabels?: string[];
  colorScale?: string[];
  cellWidth?: number;
  showValues?: boolean;
}

const DEFAULT_COLOR_SCALE = [
  "#1e3a5f",
  "#1a5276",
  "#1f618d",
  "#2980b9",
  "#5dade2",
  "#f39c12",
  "#e67e22",
  "#e74c3c",
  "#c0392b",
];

const SHADE_CHARS = [" ", "░", "▒", "▓", "█"];

const getColorForValue = (
  value: number,
  min: number,
  max: number,
  scale: string[]
): string => {
  if (max === min) {
    return scale[Math.floor(scale.length / 2)] ?? "#888888";
  }
  const t = (value - min) / (max - min);
  const idx = Math.min(scale.length - 1, Math.round(t * (scale.length - 1)));
  return scale[idx] ?? scale[0] ?? "#888888";
};

const getShadeForValue = (value: number, min: number, max: number): string => {
  if (max === min) {
    return SHADE_CHARS[2] ?? "▒";
  }
  const t = (value - min) / (max - min);
  const idx = Math.min(
    SHADE_CHARS.length - 1,
    Math.round(t * (SHADE_CHARS.length - 1))
  );
  return SHADE_CHARS[idx] ?? SHADE_CHARS[0] ?? " ";
};

const padCenter = (str: string, width: number): string => {
  if (str.length >= width) {
    return str.slice(0, width);
  }
  const total = width - str.length;
  const left = Math.floor(total / 2);
  const right = total - left;
  return " ".repeat(left) + `${str} `.repeat(right);
};

const padStart = (str: string, width: number): string => {
  if (str.length >= width) {
    return str.slice(0, width);
  }
  return " ".repeat(width - str.length) + str;
};

export const HeatMap = ({
  data,
  rowLabels,
  colLabels,
  colorScale = DEFAULT_COLOR_SCALE,
  cellWidth = 5,
  showValues = false,
}: HeatMapProps) => {
  const theme = useTheme();

  if (data.length === 0 || data[0].length === 0) {
    return <Text color={theme.colors.mutedForeground}>No data</Text>;
  }

  const _numRows = data.length;
  const numCols = data[0].length;

  const allValues = data.flat();
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);

  const rowLabelWidth = rowLabels
    ? Math.max(...rowLabels.map((l) => l.length)) + 1
    : 0;

  return (
    <Box flexDirection="column">
      {colLabels && (
        <Box flexDirection="row">
          {rowLabelWidth > 0 && <Text>{" ".repeat(rowLabelWidth + 1)}</Text>}
          {Array.from({ length: numCols }, (_, ci) => (
            <Text key={ci} color={theme.colors.mutedForeground}>
              {padCenter(colLabels[ci] ?? String(ci), cellWidth)}
            </Text>
          ))}
        </Box>
      )}

      {data.map((row, ri) => (
        <Box key={ri} flexDirection="row">
          {rowLabels && (
            <Text color={theme.colors.mutedForeground}>
              {padStart(rowLabels[ri] ?? String(ri), rowLabelWidth)}{" "}
            </Text>
          )}

          {row.map((val, ci) => {
            const cellColor = getColorForValue(val, min, max, colorScale);
            const shadeChar = getShadeForValue(val, min, max);
            const cellContent = showValues
              ? padCenter(String(Math.round(val)), cellWidth)
              : shadeChar.repeat(cellWidth);

            return (
              <Text key={ci} color={cellColor}>
                {cellContent}
              </Text>
            );
          })}
        </Box>
      ))}

      <Box flexDirection="row" gap={1} marginTop={1}>
        <Text color={theme.colors.mutedForeground}>Low</Text>
        {colorScale.map((c, idx) => (
          <Text key={idx} color={c}>
            █
          </Text>
        ))}
        <Text color={theme.colors.mutedForeground}>High</Text>
      </Box>
    </Box>
  );
};
