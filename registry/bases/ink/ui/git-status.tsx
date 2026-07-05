import { Box, Text } from "ink";

import { useTheme } from "@/components/ui/ink-theme-provider";

export interface GitStatusProps {
  branch: string;
  staged?: number;
  modified?: number;
  ahead?: number;
  behind?: number;
}

export const GitStatus = ({
  branch,
  staged = 0,
  modified = 0,
  ahead = 0,
  behind = 0,
}: GitStatusProps) => {
  const theme = useTheme();
  return (
    <Box flexDirection="column" gap={0}>
      <Text color={theme.colors.primary}>
        <Text bold>Branch </Text>
        {branch}
      </Text>
      <Text color={theme.colors.mutedForeground}>
        {ahead}↑ {behind}↓ · staged {staged} · modified {modified}
      </Text>
    </Box>
  );
};
