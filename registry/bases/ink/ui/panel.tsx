import { useIsScreenReaderEnabled, Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface PanelProps {
  title?: string;
  titleColor?: string;
  borderColor?: string;
  borderStyle?: BorderStyle;
  bordered?: boolean;
  width?: number;
  height?: number;
  paddingX?: number;
  paddingY?: number;
  children?: ReactNode;
  "aria-label"?: string;
}

export const Panel = ({
  title,
  titleColor,
  borderColor,
  borderStyle,
  bordered = true,
  width,
  height,
  paddingX = 1,
  paddingY = 0,
  children,
  "aria-label": ariaLabel,
}: PanelProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();

  const inner = (
    <>
      {title && (
        <Box
          paddingX={paddingX}
          borderStyle={resolveBorderStyle("single", unicode)}
          borderColor={borderColor ?? theme.colors.border}
        >
          <Text bold color={titleColor ?? theme.colors.primary}>
            {title}
          </Text>
        </Box>
      )}
      <Box flexDirection="column" paddingX={paddingX} paddingY={paddingY}>
        {children}
      </Box>
    </>
  );

  if (!bordered) {
    return (
      <Box flexDirection="column" width={width} height={height}>
        {ariaLabel && <Text aria-label={ariaLabel}>{""}</Text>}
        {inner}
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      borderStyle={resolveBorderStyle(
        isScreenReaderEnabled ? undefined : (borderStyle ?? theme.border.style),
        unicode
      )}
      borderColor={borderColor ?? theme.colors.border}
      width={width}
      height={height}
    >
      {ariaLabel && <Text aria-label={ariaLabel}>{""}</Text>}
      {inner}
    </Box>
  );
};
