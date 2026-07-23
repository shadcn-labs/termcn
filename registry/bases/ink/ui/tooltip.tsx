import { useIsScreenReaderEnabled, Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  isVisible?: boolean;
  borderStyle?: BorderStyle;
  borderColor?: string;
  paddingX?: number;
  paddingY?: number;
  gap?: number;
  arrowDown?: string;
  arrowUp?: string;
  "aria-label"?: string;
}

export const Tooltip = ({
  children,
  content,
  position = "top",
  isVisible = false,
  borderStyle = "single",
  borderColor,
  paddingX = 1,
  paddingY = 0,
  gap = 1,
  arrowDown,
  arrowUp,
  "aria-label": ariaLabel,
}: TooltipProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
  const resolvedBorderColor = borderColor ?? theme.colors.border;
  const resolvedArrowDown = arrowDown ?? (unicode ? "↓" : "v");
  const resolvedArrowUp = arrowUp ?? (unicode ? "↑" : "^");

  const tooltipBox = (
    <Box
      borderStyle={resolveBorderStyle(
        isScreenReaderEnabled ? undefined : borderStyle,
        unicode
      )}
      borderColor={resolvedBorderColor}
      paddingX={paddingX}
      paddingY={paddingY}
      aria-label={ariaLabel ?? `Tooltip: ${content}`}
    >
      <Text color={theme.colors.foreground}>{content}</Text>
    </Box>
  );

  if (!isVisible) {
    return <Box>{children}</Box>;
  }

  if (position === "top") {
    return (
      <Box flexDirection="column" alignItems="flex-start">
        {tooltipBox}
        <Text aria-hidden color={theme.colors.mutedForeground}>
          {resolvedArrowDown}
        </Text>
        <Box>{children}</Box>
      </Box>
    );
  }

  if (position === "bottom") {
    return (
      <Box flexDirection="column" alignItems="flex-start">
        <Box>{children}</Box>
        <Text aria-hidden color={theme.colors.mutedForeground}>
          {resolvedArrowUp}
        </Text>
        {tooltipBox}
      </Box>
    );
  }

  if (position === "left") {
    return (
      <Box flexDirection="row" alignItems="center" gap={gap}>
        {tooltipBox}
        <Box>{children}</Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="row" alignItems="center" gap={gap}>
      <Box>{children}</Box>
      {tooltipBox}
    </Box>
  );
};
