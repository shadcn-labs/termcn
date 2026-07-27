import { useIsScreenReaderEnabled, Box, Text } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  resolveStatusSymbol,
  resolveTerminalSymbol,
} from "@/registry/bases/ink/lib/accessibility";

export type BannerVariant =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "neutral";

export interface BannerProps extends InteractionProps {
  children: ReactNode;
  variant?: BannerVariant;
  icon?: string;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  color?: string;
  accentChar?: string;
  gap?: number;
  "aria-label"?: string;
}

export const Banner = ({
  children,
  variant = "info",
  icon,
  title,
  dismissible = false,
  onDismiss,
  color,
  accentChar,
  gap = 1,
  id,
  autoFocus,
  isActive = true,
  disabled,
  "aria-label": ariaLabel,
}: BannerProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
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

  const { isFocused } = useInteraction(
    (_, key) => {
      if (dismissible && key.escape) {
        setDismissed(true);
        onDismiss?.();
      }
    },
    { autoFocus, disabled, id, isActive: isActive && dismissible }
  );

  if (dismissed) {
    return null;
  }

  const resolvedIcon = icon ?? resolveStatusSymbol(unicode, variant);
  const resolvedAccentChar =
    accentChar ?? resolveTerminalSymbol(unicode, "┃", "|");

  return (
    <Box
      flexDirection="column"
      aria-role={dismissible ? "button" : "listitem"}
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text
        aria-label={
          ariaLabel ??
          `${variant} banner${title ? `: ${title}` : ""}${dismissible ? ". Press Escape to dismiss." : ""}`
        }
      >
        {""}
      </Text>
      <Box flexDirection="row" gap={gap}>
        {!isScreenReaderEnabled && (
          <Text aria-hidden color={variantColor}>
            {resolvedAccentChar}
          </Text>
        )}
        <Box flexDirection="column">
          <Box flexDirection="row" gap={1}>
            <Text aria-hidden color={variantColor}>
              {resolvedIcon}
            </Text>
            {isFocused && dismissible && <Text aria-hidden>[focused]</Text>}
            {title && (
              <Text bold color={variantColor}>
                {title}:
              </Text>
            )}
            <Text>{children}</Text>
          </Box>
          {dismissible && (
            <Text aria-hidden color={theme.colors.muted} dimColor>
              press Esc to dismiss
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};
