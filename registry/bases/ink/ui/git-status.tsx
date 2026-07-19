import { Box, Text } from "ink";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";

export interface GitStatusProps {
  branch: string;
  staged?: number;
  modified?: number;
  ahead?: number;
  behind?: number;
  "aria-label"?: string;
}

export const GitStatus = ({
  branch,
  staged = 0,
  modified = 0,
  ahead = 0,
  behind = 0,
  "aria-label": ariaLabel,
}: GitStatusProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  return (
    <Box
      flexDirection="column"
      gap={0}
      aria-label={
        ariaLabel ??
        `Git branch ${branch}. ${ahead} commits ahead, ${behind} behind, ${staged} staged, ${modified} modified.`
      }
    >
      <Text color={theme.colors.primary}>
        <Text bold>Branch </Text>
        {branch}
      </Text>
      <Text color={theme.colors.mutedForeground}>
        {unicode
          ? `${ahead}↑ ${behind}↓ · staged ${staged} · modified ${modified}`
          : `${ahead} up ${behind} down - staged ${staged} - modified ${modified}`}
      </Text>
    </Box>
  );
};
