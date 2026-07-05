import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  borderColor?: string;
  width?: number;
  borderStyle?: BorderStyle;
  paddingX?: number;
  paddingY?: number;
  footerDividerChar?: string;
}

export const Card = ({
  title,
  subtitle,
  children,
  footer,
  borderColor,
  width,
  borderStyle = "round",
  paddingX = 1,
  paddingY = 0,
  footerDividerChar = "─",
}: CardProps) => {
  const theme = useTheme();
  const resolvedBorderColor = borderColor ?? theme.colors.border;

  return (
    <Box
      flexDirection="column"
      borderStyle={borderStyle}
      borderColor={resolvedBorderColor}
      width={width}
      paddingX={paddingX}
      paddingY={paddingY}
    >
      {(title || subtitle) && (
        <Box flexDirection="column" paddingBottom={1}>
          {title && (
            <Text bold color={theme.colors.foreground}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text dimColor color={theme.colors.mutedForeground}>
              {subtitle}
            </Text>
          )}
        </Box>
      )}
      <Box flexDirection="column">{children}</Box>
      {footer && (
        <Box flexDirection="column" marginTop={1} paddingTop={1}>
          <Text color={resolvedBorderColor}>
            {footerDividerChar.repeat(30)}
          </Text>
          <Box marginTop={0}>{footer}</Box>
        </Box>
      )}
    </Box>
  );
};
