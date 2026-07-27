import { useIsScreenReaderEnabled, Box, Text } from "ink";
import React, { useState, useEffect } from "react";

import { useInterval } from "@/hooks/use-interval";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  resolveBorderStyle,
  resolveStatusSymbol,
  resolveTerminalSymbol,
} from "@/registry/bases/ink/lib/accessibility";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss?: () => void;
  icon?: string;
  "aria-label"?: string;
}

const BAR_WIDTH = 20;
const TICK_MS = 100;

export const Toast = ({
  message,
  variant = "info",
  duration = 3000,
  onDismiss,
  icon,
  "aria-label": ariaLabel,
}: ToastProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
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
  const bar =
    resolveTerminalSymbol(unicode, "█", "#").repeat(filledChars) +
    resolveTerminalSymbol(unicode, "░", ".").repeat(emptyChars);

  const resolvedIcon = icon ?? resolveStatusSymbol(unicode, variant);

  return (
    <Box
      borderStyle={resolveBorderStyle(
        isScreenReaderEnabled ? undefined : "round",
        unicode
      )}
      borderColor={variantColor}
      paddingX={1}
      paddingY={0}
      flexDirection="column"
      aria-role="listitem"
    >
      <Text aria-label={ariaLabel ?? `${variant} notification: ${message}`}>
        {""}
      </Text>
      <Box gap={1}>
        <Text aria-hidden color={variantColor} bold>
          {resolvedIcon}
        </Text>
        <Text>{message}</Text>
      </Box>
      <Box aria-hidden gap={1}>
        <Text color={variantColor}>{bar}</Text>
        <Text color={theme.colors.muted}>{remainingSeconds}s</Text>
      </Box>
    </Box>
  );
};
