import { Box, Text } from "ink";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveTerminalSymbol } from "@/registry/bases/ink/lib/accessibility";

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
  "aria-label"?: string;
}

export const ProgressBar = ({
  value,
  total,
  width = 30,
  showPercent = true,
  showEta: _showEta = false,
  fillChar,
  emptyChar,
  color,
  label,
  "aria-label": ariaLabel,
}: ProgressBarProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedColor = color ?? theme.colors.primary;
  const resolvedFillChar = fillChar ?? resolveTerminalSymbol(unicode, "█", "#");
  const resolvedEmptyChar =
    emptyChar ?? resolveTerminalSymbol(unicode, "░", ".");

  const percent =
    total === undefined
      ? Math.min(100, Math.round(value))
      : total <= 0
        ? 0
        : Math.min(100, Math.max(0, Math.round((value / total) * 100)));
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  const bar = resolvedFillChar.repeat(filled) + resolvedEmptyChar.repeat(empty);

  return (
    <Box
      flexDirection="column"
      aria-role="progressbar"
      aria-label={
        ariaLabel ??
        `${label ?? "Progress"}: ${percent}%${total === undefined ? "" : `, ${value} of ${total}`}`
      }
      aria-state={{ busy: percent < 100 }}
    >
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
