import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";

export type TagVariant = "default" | "outline";

export interface TagProps {
  children: ReactNode;
  onRemove?: () => void;
  color?: string;
  variant?: TagVariant;
}

export const Tag = ({
  children,
  onRemove,
  color,
  variant = "default",
}: TagProps) => {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.primary;
  const borderColor =
    variant === "outline" ? theme.colors.mutedForeground : resolvedColor;

  return (
    <Box
      borderStyle="round"
      borderColor={borderColor}
      paddingX={1}
      flexDirection="row"
    >
      <Text
        color={
          variant === "outline" ? theme.colors.mutedForeground : resolvedColor
        }
      >
        {children}
      </Text>
      {onRemove && <Text color={theme.colors.mutedForeground}>{" ×"}</Text>}
    </Box>
  );
};
