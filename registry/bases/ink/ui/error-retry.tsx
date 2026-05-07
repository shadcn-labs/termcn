import { Box, Text } from "ink";
import React from "react";

import { useTheme } from "@/components/ui/theme-provider";
import { useInput } from "@/hooks/use-input";

export interface ErrorRetryProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryCount?: number;
  maxRetries?: number;
  isActive?: boolean;
}

export function ErrorRetry({
  error,
  onRetry,
  onDismiss,
  retryCount = 0,
  maxRetries = 3,
  isActive = true,
}: ErrorRetryProps) {
  const theme = useTheme();
  const message = typeof error === "string" ? error : error.message;
  const maxReached = retryCount >= maxRetries;

  useInput(
    (input, key) => {
      if (!maxReached && (key.return || input === "r")) {
        onRetry?.();
      } else if (key.escape) {
        onDismiss?.();
      }
    },
    { isActive }
  );

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.colors.error ?? "red"}
      paddingX={1}
      paddingY={0}
    >
      <Box gap={1}>
        <Text color={theme.colors.error ?? "red"} bold>
          ✗
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
        <Text dimColor color={theme.colors.mutedForeground}>
          Enter / r — retry · Esc — dismiss
        </Text>
      )}
    </Box>
  );
}
