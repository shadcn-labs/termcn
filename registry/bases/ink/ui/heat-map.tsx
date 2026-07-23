import { Box, Text } from "ink";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  padToTerminalWidth,
  terminalWidth,
  truncateToTerminalWidth,
} from "@/registry/bases/ink/lib/terminal-text";

export interface HeatMapProps {
  data: number[][];
  rowLabels?: string[];
  colLabels?: string[];
  colorScale?: string[];
  cellWidth?: number;
  showValues?: boolean;
  title?: string;
  accessibleSummary?: string;
  "aria-label"?: string;
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
const ASCII_SHADE_CHARS = [" ", ".", ":", "*", "#"];

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

const getShadeForValue = (
  value: number,
  min: number,
  max: number,
  shadeChars: string[]
): string => {
  if (max === min) {
    return shadeChars[2] ?? ":";
  }
  const t = (value - min) / (max - min);
  const idx = Math.min(
    shadeChars.length - 1,
    Math.round(t * (shadeChars.length - 1))
  );
  return shadeChars[idx] ?? shadeChars[0] ?? " ";
};

const padCenter = (str: string, width: number): string => {
  const value = truncateToTerminalWidth(str, width);
  const total = Math.max(0, width - terminalWidth(value));
  const left = Math.floor(total / 2);
  const right = total - left;
  return " ".repeat(left) + value + " ".repeat(right);
};

const padStart = (str: string, width: number): string => {
  const value = truncateToTerminalWidth(str, width);
  return " ".repeat(Math.max(0, width - terminalWidth(value))) + value;
};

export const HeatMap = ({
  data,
  rowLabels,
  colLabels,
  colorScale = DEFAULT_COLOR_SCALE,
  cellWidth = 5,
  showValues = false,
  title,
  accessibleSummary,
  "aria-label": ariaLabel,
}: HeatMapProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const shadeChars = unicode ? SHADE_CHARS : ASCII_SHADE_CHARS;

  if (data.length === 0 || data[0].length === 0) {
    return <Text color={theme.colors.mutedForeground}>No data</Text>;
  }

  const _numRows = data.length;
  const numCols = data[0].length;

  const allValues = data.flat();
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);

  const rowLabelWidth = rowLabels
    ? Math.max(...rowLabels.map((l) => terminalWidth(l))) + 1
    : 0;

  return (
    <Box
      flexDirection="column"
      aria-label={
        ariaLabel ??
        accessibleSummary ??
        `${title ?? "Heat map"}. Range ${min} to ${max}. ${data
          .slice(0, 8)
          .map(
            (row, rowIndex) =>
              `${rowLabels?.[rowIndex] ?? `Row ${rowIndex + 1}`}: ${row
                .slice(0, 8)
                .map(
                  (value, columnIndex) =>
                    `${colLabels?.[columnIndex] ?? `Column ${columnIndex + 1}`} ${value}`
                )
                .join(", ")}`
          )
          .join(". ")}.`
      }
    >
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
            const shadeChar = getShadeForValue(val, min, max, shadeChars);
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
            {unicode ? "█" : "#"}
          </Text>
        ))}
        <Text color={theme.colors.mutedForeground}>High</Text>
      </Box>
    </Box>
  );
};
