import { Box, Text } from "ink";

import { useTheme } from "@/components/ui/ink-theme-provider";

export interface HelpProps {
  keymap: Record<string, string>;
  title?: string;
  compact?: boolean;
}

export const Help = ({ keymap, title, compact = false }: HelpProps) => {
  const theme = useTheme();
  const entries = Object.entries(keymap);

  if (compact) {
    const parts = entries.map(([key, action]) => `${key}: ${action}`);
    return (
      <Box gap={1} flexWrap="wrap">
        {title && (
          <Text color={theme.colors.primary} bold>
            {title} |
          </Text>
        )}
        <Text color={theme.colors.mutedForeground}>{parts.join(" · ")}</Text>
      </Box>
    );
  }

  const keyWidth = Math.max(...entries.map(([k]) => k.length), 3);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.colors.border}
      paddingX={1}
      gap={0}
    >
      {title && (
        <Text color={theme.colors.primary} bold>
          {title}
        </Text>
      )}
      {entries.map(([key, action]) => (
        <Box key={key} gap={2}>
          <Box
            borderStyle="single"
            borderColor={theme.colors.primary}
            paddingX={1}
            minWidth={keyWidth + 4}
          >
            <Text color={theme.colors.primary} bold>
              {key}
            </Text>
          </Box>
          <Text color={theme.colors.foreground}>{action}</Text>
        </Box>
      ))}
    </Box>
  );
};
