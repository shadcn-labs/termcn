import { Box, Text } from "ink";

import { useTheme } from "@/components/ui/ink-theme-provider";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "secondary";

export interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  color?: string;
  bold?: boolean;
  bordered?: boolean;
  borderStyle?: BorderStyle;
  paddingX?: number;
}

export const Badge = ({
  children,
  variant = "default",
  color,
  bold = false,
  bordered = true,
  borderStyle = "round",
  paddingX = 1,
}: BadgeProps) => {
  const theme = useTheme();

  const variantColor =
    color ??
    (() => {
      switch (variant) {
        case "success": {
          return theme.colors.success;
        }
        case "warning": {
          return theme.colors.warning;
        }
        case "error": {
          return theme.colors.error;
        }
        case "info": {
          return theme.colors.info;
        }
        case "secondary": {
          return theme.colors.secondary;
        }
        default: {
          return theme.colors.primary;
        }
      }
    })();

  if (!bordered) {
    return (
      <Text color={variantColor} bold={bold}>
        {children}
      </Text>
    );
  }

  return (
    <Box
      borderStyle={borderStyle}
      borderColor={variantColor}
      paddingX={paddingX}
    >
      <Text color={variantColor} bold={bold}>
        {children}
      </Text>
    </Box>
  );
};
