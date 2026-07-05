import { Box, Text } from "ink";
import React, { useState, useCallback, useEffect } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useClipboard } from "@/hooks/use-clipboard";
import { useInput } from "@/hooks/use-input";

export interface ClipboardProps {
  value: string;
  label?: string;
  successMessage?: string;
  timeout?: number;
}

export const Clipboard = ({
  value,
  label,
  successMessage = "Copied!",
  timeout = 2000,
}: ClipboardProps) => {
  const theme = useTheme();
  const { write } = useClipboard();
  const [copied, setCopied] = useState(false);

  const doCopy = useCallback(() => {
    write(value);
    setCopied(true);
  }, [write, value]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), timeout);
    return () => clearTimeout(timer);
  }, [copied, timeout]);

  useInput((input) => {
    if (input === "c" || input === " ") {
      doCopy();
    }
  });

  return (
    <Box flexDirection="column" gap={0}>
      {label && <Text color={theme.colors.mutedForeground}>{label}</Text>}
      <Box gap={2} alignItems="center">
        <Box borderStyle="round" borderColor={theme.colors.border} paddingX={1}>
          <Text color={theme.colors.foreground}>{value}</Text>
        </Box>
        <Box
          borderStyle="round"
          borderColor={copied ? theme.colors.success : theme.colors.primary}
          paddingX={1}
        >
          <Text
            color={copied ? theme.colors.success : theme.colors.primary}
            bold
          >
            {copied ? `✓ ${successMessage}` : "Copy"}
          </Text>
        </Box>
      </Box>
      {!copied && (
        <Text color={theme.colors.mutedForeground} dimColor>
          press c or space to copy
        </Text>
      )}
    </Box>
  );
};
