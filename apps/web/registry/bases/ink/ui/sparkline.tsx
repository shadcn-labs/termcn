import { Box, Text } from "ink";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { summarizeSeries } from "@/registry/bases/ink/lib/accessibility";

export interface SparklineProps {
  data: number[];
  width?: number;
  color?: string;
  label?: string;
  accessibleSummary?: string;
  "aria-label"?: string;
}

const BRAILLE_LEVELS = ["⣀", "⣄", "⣤", "⣦", "⣶", "⣷", "⣿", "⣿"];
const ASCII_LEVELS = [".", ":", "-", "=", "+", "*", "#", "@"];

const normalize = (data: number[], levels: number): number[] => {
  if (data.length === 0) {
    return [];
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  if (range === 0) {
    return data.map(() => Math.floor(levels / 2));
  }
  return data.map((v) => Math.round(((v - min) / range) * (levels - 1)));
};

export const Sparkline = ({
  data,
  width = 20,
  color,
  label,
  accessibleSummary,
  "aria-label": ariaLabel,
}: SparklineProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedColor = color ?? theme.colors.primary;
  const levelsForOutput = unicode ? BRAILLE_LEVELS : ASCII_LEVELS;

  if (data.length === 0) {
    return (
      <Box>
        {label && <Text color={theme.colors.mutedForeground}>{label} </Text>}
        <Text color={theme.colors.mutedForeground}>{"-".repeat(width)}</Text>
      </Box>
    );
  }

  const sampled =
    data.length > width
      ? Array.from(
          { length: width },
          (_, i) => data[Math.round((i / (width - 1)) * (data.length - 1))] ?? 0
        )
      : data;

  const levels = normalize(sampled, levelsForOutput.length);
  const sparkStr = levels
    .map((level) => levelsForOutput[level] ?? levelsForOutput[0])
    .join("");

  return (
    <Box
      flexDirection="row"
      gap={1}
      aria-label={
        ariaLabel ??
        accessibleSummary ??
        summarizeSeries(
          label ?? "Sparkline",
          data.map((value, index) => ({ label: String(index + 1), value }))
        )
      }
    >
      {label && <Text color={theme.colors.mutedForeground}>{label}</Text>}
      <Text color={resolvedColor}>{sparkStr}</Text>
    </Box>
  );
};
