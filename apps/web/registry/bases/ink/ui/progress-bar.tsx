import { Box, Text } from "ink";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { getProgressPercent } from "@/registry/bases/ink/lib/progress-utils";

export interface ProgressBarProps {
  value: number;
  total?: number;
  width?: number;
  showPercent?: boolean;
  showEta?: boolean;
  fillChar?: string;
  emptyChar?: string;
  color?: string;
  label?: string;
}

export const ProgressBar = ({
  value,
  total,
  width = 30,
  showPercent = true,
  showEta: _showEta = false,
  fillChar = "█",
  emptyChar = "░",
  color,
  label,
}: ProgressBarProps) => {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.primary;

  const percent = getProgressPercent(value, total);
  const safeWidth = Math.max(0, Math.floor(width));
  const filled = Math.round((percent / 100) * safeWidth);
  const empty = safeWidth - filled;

  const bar = fillChar.repeat(filled) + emptyChar.repeat(empty);

  return (
    <Box flexDirection="column">
      {label && <Text>{label}</Text>}
      <Box gap={1}>
        <Text color={resolvedColor}>{bar}</Text>
        {showPercent && (
          <Text color={theme.colors.mutedForeground}>{percent}%</Text>
        )}
        {total !== undefined && (
          <Text color={theme.colors.mutedForeground} dimColor>
            {value}/{total}
          </Text>
        )}
      </Box>
    </Box>
  );
};
