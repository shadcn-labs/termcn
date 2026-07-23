import { useIsScreenReaderEnabled, Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  resolveBorderStyle,
  resolveStatusSymbol,
} from "@/registry/bases/ink/lib/accessibility";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export type AlertVariant = "success" | "error" | "warning" | "info";

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
  "aria-label"?: string;
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
  "aria-label": ariaLabel,
}: AlertProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();

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

  const resolvedIcon = icon ?? resolveStatusSymbol(unicode, variant);

  const inner = (
    <>
      <Box gap={1}>
        <Text aria-hidden color={variantColor} bold>
          {resolvedIcon}
        </Text>
        <Text
          aria-label={
            ariaLabel ?? `${variant} alert${title ? `: ${title}` : ""}`
          }
        >
          {""}
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
      borderStyle={resolveBorderStyle(
        isScreenReaderEnabled ? undefined : (borderStyle ?? theme.border.style),
        unicode
      )}
      borderColor={variantColor}
      paddingX={paddingX}
      paddingY={paddingY}
      flexDirection="column"
    >
      {inner}
    </Box>
  );
};
