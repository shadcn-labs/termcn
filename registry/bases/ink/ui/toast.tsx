import { Box, Text } from "ink";
import React, { useState, useEffect } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInterval } from "@/hooks/use-interval";

export type ToastVariant = "success" | "error" | "warning" | "info";

const ICONS: Record<ToastVariant, string> = {
  error: "✗",
  info: "ℹ",
  success: "✓",
  warning: "⚠",
};

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss?: () => void;
  icon?: string;
}

const BAR_WIDTH = 20;
const TICK_MS = 100;

export const Toast = ({
  message,
  variant = "info",
  duration = 3000,
  onDismiss,
  icon,
}: ToastProps) => {
  const theme = useTheme();
  const [elapsed, setElapsed] = useState(0);
  const [dismissed, setDismissed] = useState(false);

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
      default: {
        return theme.colors.info;
      }
    }
  })();

  useEffect(() => {
    const id = setTimeout(() => {
      setDismissed(true);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(id);
  }, [duration, onDismiss]);

  useInterval(
    () => {
      setElapsed((e) => Math.min(e + TICK_MS, duration));
    },
    dismissed ? null : TICK_MS
  );

  if (dismissed) {
    return null;
  }

  const remaining = Math.max(0, duration - elapsed);
  const remainingSeconds = (remaining / 1000).toFixed(1);
  const progress = remaining / duration;
  const filledChars = Math.round(progress * BAR_WIDTH);
  const emptyChars = BAR_WIDTH - filledChars;
  const bar = "█".repeat(filledChars) + "░".repeat(emptyChars);

  const resolvedIcon = icon ?? ICONS[variant];

  return (
    <Box
      borderStyle="round"
      borderColor={variantColor}
      paddingX={1}
      paddingY={0}
      flexDirection="column"
    >
      <Box gap={1}>
        <Text color={variantColor} bold>
          {resolvedIcon}
        </Text>
        <Text>{message}</Text>
      </Box>
      <Box gap={1}>
        <Text color={variantColor}>{bar}</Text>
        <Text color={theme.colors.muted}>{remainingSeconds}s</Text>
      </Box>
    </Box>
  );
};
