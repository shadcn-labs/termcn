/* @jsxImportSource @opentui/react */
import { useState, useEffect } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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

  useEffect(() => {
    if (dismissed) {
      return;
    }
    const id = setInterval(() => {
      setElapsed((e) => Math.min(e + TICK_MS, duration));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [dismissed, duration]);

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
    <box
      borderStyle="rounded"
      borderColor={variantColor}
      paddingLeft={1}
      paddingRight={1}
      paddingTop={0}
      paddingBottom={0}
      flexDirection="column"
    >
      <box gap={1}>
        <text fg={variantColor}>
          <b>{resolvedIcon}</b>
        </text>
        <text>{message}</text>
      </box>
      <box gap={1}>
        <text fg={variantColor}>{bar}</text>
        <text fg={theme.colors.muted}>{`${remainingSeconds}s`}</text>
      </box>
    </box>
  );
};
