/* @jsxImportSource @opentui/react */
import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/components/ui/opentui-theme-provider";

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
}

export const Badge = ({
  children,
  variant = "default",
  color,
  bold = false,
  bordered = true,
  borderStyle = "rounded",
  paddingX = 1,
}: BadgeProps) => {
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

  const textContent = bold ? (
    <text fg={variantColor}>
      <b>{children}</b>
    </text>
  ) : (
    <text fg={variantColor}>{children}</text>
  );

  if (!bordered) {
    return textContent;
  }

  return (
    <box
      borderColor={variantColor}
      paddingLeft={paddingX}
      paddingRight={paddingX}
    >
      {textContent}
    </box>
  );
};
