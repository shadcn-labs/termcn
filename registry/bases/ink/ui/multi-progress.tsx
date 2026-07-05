import { Box, Text } from "ink";

import { useTheme } from "@/components/ui/ink-theme-provider";

export type MultiProgressStatus = "pending" | "running" | "done" | "error";

export interface MultiProgressItem {
  id: string;
  label: string;
  value: number;
  total: number;
  status?: MultiProgressStatus;
  statusText?: string;
}

export interface MultiProgressProps {
  items: MultiProgressItem[];
  barWidth?: number;
  labelWidth?: number;
  compact?: boolean;
  showPercent?: boolean;
}

const truncate = (s: string, n: number): string =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s.padEnd(n);

export const MultiProgress = ({
  items,
  barWidth = 20,
  labelWidth = 20,
  compact = false,
  showPercent = true,
}: MultiProgressProps) => {
  const theme = useTheme();

  const statusColor = (status: MultiProgressStatus | undefined): string => {
    switch (status) {
      case "done": {
        return theme.colors.success;
      }
      case "error": {
        return theme.colors.error;
      }
      case "pending": {
        return theme.colors.mutedForeground;
      }
      default: {
        return theme.colors.primary;
      }
    }
  };

  const renderBar = (item: MultiProgressItem): string => {
    const pct = item.total > 0 ? Math.min(1, item.value / item.total) : 0;
    const filled = Math.round(pct * barWidth);
    const empty = barWidth - filled;
    return `${"█".repeat(filled)}${"░".repeat(empty)}`;
  };

  return (
    <Box flexDirection="column">
      {items.map((item) => {
        const pct =
          item.total > 0
            ? Math.min(100, Math.round((item.value / item.total) * 100))
            : 0;
        const color = statusColor(item.status);
        const bar = renderBar(item);
        const label = truncate(item.label, labelWidth);

        if (compact) {
          return (
            <Box key={item.id} flexDirection="row" gap={1}>
              <Text color={color}>{label}</Text>
              <Text color={theme.colors.mutedForeground}>[</Text>
              <Text color={color}>{bar}</Text>
              <Text color={theme.colors.mutedForeground}>]</Text>
              {showPercent && (
                <Text color={theme.colors.mutedForeground}>
                  {String(pct).padStart(3)}%
                </Text>
              )}
              {item.statusText && (
                <Text color={theme.colors.mutedForeground} dimColor>
                  {item.statusText}
                </Text>
              )}
            </Box>
          );
        }

        return (
          <Box key={item.id} flexDirection="column" marginBottom={0}>
            <Box flexDirection="row" gap={1}>
              <Text bold color={color}>
                {label}
              </Text>
              {item.statusText && (
                <Text color={theme.colors.mutedForeground} dimColor>
                  {item.statusText}
                </Text>
              )}
            </Box>
            <Box flexDirection="row" gap={1}>
              <Text color={theme.colors.mutedForeground}>[</Text>
              <Text color={color}>{bar}</Text>
              <Text color={theme.colors.mutedForeground}>]</Text>
              {showPercent && (
                <Text color={theme.colors.mutedForeground}>
                  {String(pct).padStart(3)}%
                </Text>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
