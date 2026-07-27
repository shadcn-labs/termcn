import { Box, Text } from "ink";
import React, { useState, useCallback, useEffect } from "react";

import { useClipboard } from "@/hooks/use-clipboard";
import { isActivationKey, useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

export interface ClipboardProps extends InteractionProps {
  value: string;
  label?: string;
  successMessage?: string;
  timeout?: number;
  errorMessage?: string;
  "aria-label"?: string;
}

export const Clipboard = ({
  value,
  label,
  successMessage = "Copied!",
  timeout = 2000,
  errorMessage = "Copy failed",
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel,
}: ClipboardProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const { write } = useClipboard();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>();

  const doCopy = useCallback(async () => {
    try {
      await write(value);
      setCopied(true);
      setError(undefined);
    } catch {
      setCopied(false);
      setError(errorMessage);
    }
  }, [errorMessage, write, value]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), timeout);
    return () => clearTimeout(timer);
  }, [copied, timeout]);

  const { isFocused } = useInteraction(
    (input, key) => {
      if (input === "c" || isActivationKey(input, key)) {
        void doCopy();
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  return (
    <Box
      flexDirection="column"
      gap={0}
      aria-role="button"
      aria-label={
        ariaLabel ??
        `${label ?? "Copy value"}. ${copied ? successMessage : (error ?? "Press Enter or Space to copy.")}`
      }
      aria-state={{ disabled: disabled || undefined }}
    >
      {label && <Text color={theme.colors.mutedForeground}>{label}</Text>}
      <Box gap={2} alignItems="center">
        <Box
          borderStyle={resolveBorderStyle("round", unicode)}
          borderColor={theme.colors.border}
          paddingX={1}
        >
          <Text color={theme.colors.foreground}>{value}</Text>
        </Box>
        <Box
          borderStyle={resolveBorderStyle("round", unicode)}
          borderColor={
            error
              ? theme.colors.error
              : copied
                ? theme.colors.success
                : theme.colors.primary
          }
          paddingX={1}
        >
          <Text
            color={
              error
                ? theme.colors.error
                : copied
                  ? theme.colors.success
                  : theme.colors.primary
            }
            bold
          >
            {error ??
              (copied
                ? `${unicode ? "✓" : "v"} ${successMessage}`
                : `${isFocused ? "> " : ""}Copy`)}
          </Text>
        </Box>
      </Box>
      {!copied && (
        <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
          press c or space to copy
        </Text>
      )}
    </Box>
  );
};
