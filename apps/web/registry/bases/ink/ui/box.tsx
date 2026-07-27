import { Box as InkBox } from "ink";
import type { BoxProps as InkBoxProps } from "ink";
import React from "react";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

export type BorderVariant =
  | "default"
  | "muted"
  | "focus"
  | "success"
  | "error"
  | "warning";

export interface BoxProps extends InkBoxProps {
  border?: boolean;
  borderVariant?: BorderVariant;
  borderColor?: string;
  children?: React.ReactNode;
}

export const Box = ({
  border,
  borderVariant = "default",
  borderColor,
  children,
  ...props
}: BoxProps) => {
  const theme = useTheme();
  const unicode = useUnicode();

  const resolvedBorderColor =
    borderColor ??
    (() => {
      switch (borderVariant) {
        case "focus": {
          return theme.colors.focusRing;
        }
        case "success": {
          return theme.colors.success;
        }
        case "error": {
          return theme.colors.error;
        }
        case "warning": {
          return theme.colors.warning;
        }
        case "muted": {
          return theme.colors.mutedForeground;
        }
        default: {
          return theme.colors.border;
        }
      }
    })();

  return (
    <InkBox
      {...props}
      borderStyle={
        border
          ? resolveBorderStyle(props.borderStyle ?? theme.border.style, unicode)
          : undefined
      }
      borderColor={border ? resolvedBorderColor : undefined}
    >
      {children}
    </InkBox>
  );
};
