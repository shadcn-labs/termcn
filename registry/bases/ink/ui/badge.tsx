import { Box, Text } from "ink";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";
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
  "aria-label"?: string;
}

export const Badge = ({
  children,
  variant = "default",
  color,
  bold = false,
  bordered = true,
  borderStyle = "round",
  paddingX = 1,
  "aria-label": ariaLabel,
}: BadgeProps) => {
  const unicode = useUnicode();
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
      <Text
        aria-label={ariaLabel ?? `${variant}: ${children}`}
        color={variantColor}
        bold={bold}
      >
        {children}
      </Text>
    );
  }

  return (
    <Box
      borderStyle={resolveBorderStyle(borderStyle, unicode)}
      borderColor={variantColor}
      paddingX={paddingX}
      aria-label={ariaLabel ?? `${variant}: ${children}`}
    >
      <Text color={variantColor} bold={bold}>
        {children}
      </Text>
    </Box>
  );
};
