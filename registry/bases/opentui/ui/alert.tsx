/* @jsxImportSource @opentui/react */
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/components/ui/opentui-theme-provider";

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
      <box gap={1}>
        <text fg={variantColor}>
          <b>{resolvedIcon}</b>
        </text>
        {title && (
          <text fg={variantColor}>
            <b>{title}</b>
          </text>
        )}
      </box>
      {children && <text>{children}</text>}
    </>
  );

  if (!bordered) {
    return (
      <box
        flexDirection="column"
        paddingBottom={paddingY}
        paddingLeft={paddingX}
        paddingRight={paddingX}
        paddingTop={paddingY}
      >
        {inner}
      </box>
    );
  }

  return (
    <box
      borderColor={variantColor}
      borderStyle={borderStyle ?? theme.border.style}
      flexDirection="column"
      paddingBottom={paddingY}
      paddingLeft={paddingX}
      paddingRight={paddingX}
      paddingTop={paddingY}
    >
      {inner}
    </box>
  );
};
