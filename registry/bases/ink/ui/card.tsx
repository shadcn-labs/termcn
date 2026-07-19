import { useIsScreenReaderEnabled, Box, Text } from "ink";
import type { BoxProps } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface CardProps extends Omit<
  BoxProps,
  "children" | "title" | "width"
> {
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
  "aria-label"?: string;
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
  footerDividerChar,
  "aria-label": ariaLabel,
  ...props
}: CardProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
  const resolvedBorderColor = borderColor ?? theme.colors.border;
  const resolvedFooterDividerChar = footerDividerChar ?? (unicode ? "─" : "-");

  return (
    <Box
      {...props}
      flexDirection="column"
      borderStyle={resolveBorderStyle(
        isScreenReaderEnabled ? undefined : borderStyle,
        unicode
      )}
      borderColor={resolvedBorderColor}
      width={width}
      paddingX={paddingX}
      paddingY={paddingY}
    >
      {ariaLabel && <Text aria-label={ariaLabel}>{""}</Text>}
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
          <Text aria-hidden color={resolvedBorderColor}>
            {resolvedFooterDividerChar.repeat(30)}
          </Text>
          <Box marginTop={0}>{footer}</Box>
        </Box>
      )}
    </Box>
  );
};
