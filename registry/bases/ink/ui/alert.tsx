import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export type AlertVariant = "success" | "error" | "warning" | "info";

const ICONS: Record<AlertVariant, string> = {
  error: "✗",
  info: "ℹ",
  success: "✓",
  warning: "⚠",
};

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  icon?: string;
  bordered?: boolean;
  borderStyle?: BorderStyle;
  color?: string;
  paddingX?: number;
  paddingY?: number;
}

export const Alert = ({
  variant = "info",
  title,
  children,
  icon,
  bordered = true,
  borderStyle,
  color,
  paddingX = 1,
  paddingY = 0,
}: AlertProps) => {
  const theme = useTheme();

  const variantColor =
    color ??
    (() => {
      switch (variant) {
        case "success": {
          return theme.colors.success;
        }
        case "error": {
          return theme.colors.error;
        }
        case "warning": {
          return theme.colors.warning;
        }
        default: {
          return theme.colors.info;
        }
      }
    })();

  const resolvedIcon = icon ?? ICONS[variant];

  const inner = (
    <>
      <Box gap={1}>
        <Text color={variantColor} bold>
          {resolvedIcon}
        </Text>
        {title && (
          <Text bold color={variantColor}>
            {title}
          </Text>
        )}
      </Box>
      {children && <Text>{children}</Text>}
    </>
  );

  if (!bordered) {
    return (
      <Box flexDirection="column" paddingX={paddingX} paddingY={paddingY}>
        {inner}
      </Box>
    );
  }

  return (
    <Box
      borderStyle={borderStyle ?? theme.border.style}
      borderColor={variantColor}
      paddingX={paddingX}
      paddingY={paddingY}
      flexDirection="column"
    >
      {inner}
    </Box>
  );
};
