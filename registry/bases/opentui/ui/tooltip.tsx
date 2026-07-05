/* @jsxImportSource @opentui/react */
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

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
  arrowDown = "↓",
  arrowUp = "↑",
}: TooltipProps) => {
  const theme = useTheme();
  const resolvedBorderColor = borderColor ?? theme.colors.border;

  const tooltipBox = (
    <box
      borderColor={resolvedBorderColor}
      paddingLeft={paddingX}
      paddingRight={paddingX}
      paddingTop={paddingY}
      paddingBottom={paddingY}
    >
      <text fg={theme.colors.foreground}>{content}</text>
    </box>
  );

  if (!isVisible) {
    return <box>{children}</box>;
  }

  if (position === "top") {
    return (
      <box flexDirection="column" alignItems="flex-start">
        {tooltipBox}
        <text fg={theme.colors.mutedForeground}>{arrowDown}</text>
        <box>{children}</box>
      </box>
    );
  }

  if (position === "bottom") {
    return (
      <box flexDirection="column" alignItems="flex-start">
        <box>{children}</box>
        <text fg={theme.colors.mutedForeground}>{arrowUp}</text>
        {tooltipBox}
      </box>
    );
  }

  if (position === "left") {
    return (
      <box flexDirection="row" alignItems="center">
        {tooltipBox}
        <box>{children}</box>
      </box>
    );
  }

  return (
    <box flexDirection="row" alignItems="center">
      <box>{children}</box>
      {tooltipBox}
    </box>
  );
};
