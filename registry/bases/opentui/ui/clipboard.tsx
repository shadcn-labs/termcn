/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState, useCallback, useEffect } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useClipboard } from "@/hooks/use-clipboard";

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

  useKeyboard((key) => {
    if (key.name === "c" || key.name === " ") {
      doCopy();
    }
  });

  return (
    <box flexDirection="column" gap={0}>
      {label && <text fg={theme.colors.mutedForeground}>{label}</text>}
      <box gap={2} alignItems="center">
        <box
          borderStyle="rounded"
          borderColor={theme.colors.border}
          paddingLeft={1}
          paddingRight={1}
        >
          <text fg={theme.colors.foreground}>{value}</text>
        </box>
        <box
          borderStyle="rounded"
          borderColor={copied ? theme.colors.success : theme.colors.primary}
          paddingLeft={1}
          paddingRight={1}
        >
          <text fg={copied ? theme.colors.success : theme.colors.primary}>
            <b>{copied ? `✓ ${successMessage}` : "Copy"}</b>
          </text>
        </box>
      </box>
      {!copied && <text fg="#666">press c or space to copy</text>}
    </box>
  );
};
