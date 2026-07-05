/* @jsxImportSource @opentui/react */
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

export type BorderVariant =
  | "default"
  | "muted"
  | "focus"
  | "success"
  | "error"
  | "warning";

export interface BoxProps {
  border?: boolean;
  borderVariant?: BorderVariant;
  borderColor?: string;
  borderStyle?: BorderStyle;
  children?: ReactNode;
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  flexGrow?: number;
  flexShrink?: number;
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  width?: number | string;
  height?: number | string;
  minWidth?: number;
  minHeight?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  gap?: number;
  [key: string]: unknown;
}

export const Box = ({
  border,
  borderVariant = "default",
  borderColor,
  children,
  ...props
}: BoxProps) => {
  const theme = useTheme();

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
    <box
      borderStyle={
        border ? (props.borderStyle ?? theme.border.style) : undefined
      }
      borderColor={border ? resolvedBorderColor : undefined}
    >
      {children}
    </box>
  );
};
