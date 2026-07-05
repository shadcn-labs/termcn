import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";

import { Spinner } from "./spinner";

export type StatusVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "pending";

const ICONS: Record<Exclude<StatusVariant, "loading">, string> = {
  error: "✗",
  info: "ℹ",
  pending: "○",
  success: "✓",
  warning: "⚠",
};

export interface StatusMessageProps {
  variant?: StatusVariant;
  children: ReactNode;
  icon?: string;
}

export const StatusMessage = ({
  variant = "info",
  children,
  icon,
}: StatusMessageProps) => {
  const theme = useTheme();

  const variantColor = (() => {
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
      case "loading": {
        return theme.colors.primary;
      }
      case "pending": {
        return theme.colors.muted;
      }
      default: {
        return theme.colors.info;
      }
    }
  })();

  return (
    <Box gap={1} flexDirection="row">
      {variant === "loading" ? (
        <Spinner type="dots" color={variantColor} />
      ) : (
        <Text color={variantColor}>
          {icon ?? ICONS[variant as Exclude<StatusVariant, "loading">]}
        </Text>
      )}
      <Text>{children}</Text>
    </Box>
  );
};
