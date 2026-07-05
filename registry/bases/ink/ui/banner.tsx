import { Box, Text, useInput } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";

export type BannerVariant =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "neutral";

const ICONS: Record<BannerVariant, string> = {
  error: "✗",
  info: "ℹ",
  neutral: "·",
  success: "✓",
  warning: "⚠",
};

export interface BannerProps {
  children: ReactNode;
  variant?: BannerVariant;
  icon?: string;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  color?: string;
  accentChar?: string;
  gap?: number;
}

export const Banner = ({
  children,
  variant = "info",
  icon,
  title,
  dismissible = false,
  onDismiss,
  color,
  accentChar = "┃",
  gap = 1,
}: BannerProps) => {
  const theme = useTheme();
  const [dismissed, setDismissed] = useState(false);

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
        case "neutral": {
          return theme.colors.muted;
        }
        default: {
          return theme.colors.info;
        }
      }
    })();

  useInput((_, key) => {
    if (dismissible && key.escape) {
      setDismissed(true);
      onDismiss?.();
    }
  });

  if (dismissed) {
    return null;
  }

  const resolvedIcon = icon ?? ICONS[variant];

  return (
    <Box flexDirection="column">
      <Box flexDirection="row" gap={gap}>
        <Text color={variantColor}>{accentChar}</Text>
        <Box flexDirection="column">
          <Box flexDirection="row" gap={1}>
            <Text color={variantColor}>{resolvedIcon}</Text>
            {title && (
              <Text bold color={variantColor}>
                {title}:
              </Text>
            )}
            <Text>{children}</Text>
          </Box>
          {dismissible && (
            <Text color={theme.colors.muted} dimColor>
              press Esc to dismiss
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};
