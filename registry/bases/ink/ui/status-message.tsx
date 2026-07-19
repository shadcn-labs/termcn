import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveStatusSymbol } from "@/registry/bases/ink/lib/accessibility";

import { Spinner } from "./spinner";

export type StatusVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "pending";

export interface StatusMessageProps {
  variant?: StatusVariant;
  children: ReactNode;
  icon?: string;
  "aria-label"?: string;
}

export const StatusMessage = ({
  variant = "info",
  children,
  icon,
  "aria-label": ariaLabel,
}: StatusMessageProps) => {
  const theme = useTheme();
  const unicode = useUnicode();

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
      <Text aria-label={ariaLabel ?? `${variant} status`}>{""}</Text>
      {variant === "loading" ? (
        <Spinner type="dots" color={variantColor} aria-label="Loading" />
      ) : (
        <Text aria-hidden color={variantColor}>
          {icon ??
            resolveStatusSymbol(
              unicode,
              variant as Exclude<StatusVariant, "loading">
            )}
        </Text>
      )}
      <Text>{children}</Text>
    </Box>
  );
};
