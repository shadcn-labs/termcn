import { useIsScreenReaderEnabled, Box, Text } from "ink";
import React from "react";

import { isActivationKey, useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

export interface ErrorRetryProps extends InteractionProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryCount?: number;
  maxRetries?: number;
  "aria-label"?: string;
}

export function ErrorRetry({
  error,
  onRetry,
  onDismiss,
  retryCount = 0,
  maxRetries = 3,
  isActive = true,
  id,
  autoFocus,
  disabled,
  "aria-label": ariaLabel,
}: ErrorRetryProps) {
  const unicode = useUnicode();
  const theme = useTheme();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
  const message = typeof error === "string" ? error : error.message;
  const maxReached = retryCount >= maxRetries;

  const { isFocused } = useInteraction(
    (input, key) => {
      if (!maxReached && (isActivationKey(input, key) || input === "r")) {
        onRetry?.();
      } else if (key.escape) {
        onDismiss?.();
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  return (
    <Box
      flexDirection="column"
      borderStyle={resolveBorderStyle(
        isScreenReaderEnabled ? undefined : "round",
        unicode
      )}
      borderColor={theme.colors.error ?? "red"}
      paddingX={1}
      paddingY={0}
      aria-role="button"
      aria-label={
        ariaLabel ??
        `Error: ${message}. ${maxReached ? "Maximum retries reached." : `Retry ${retryCount} of ${maxRetries}. Press Enter to retry or Escape to dismiss.`}`
      }
      aria-state={{ disabled: disabled || undefined }}
    >
      <Box gap={1}>
        <Text aria-hidden color={theme.colors.error ?? "red"} bold>
          {unicode ? "✗" : "x"}
        </Text>
        <Text>{message}</Text>
      </Box>

      {retryCount > 0 && (
        <Text dimColor color={theme.colors.mutedForeground}>
          Retry attempt {retryCount}
        </Text>
      )}

      {maxReached ? (
        <Text dimColor color={theme.colors.mutedForeground}>
          Max retries reached
        </Text>
      ) : (
        <Text aria-hidden dimColor color={theme.colors.mutedForeground}>
          {unicode
            ? "Enter / r — retry · Esc — dismiss"
            : "Enter / r - retry | Esc - dismiss"}
        </Text>
      )}
      {isFocused && <Text aria-hidden>[focused]</Text>}
    </Box>
  );
}
