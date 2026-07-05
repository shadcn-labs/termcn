import { Box, Text } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export interface DialogProps {
  title?: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: "default" | "danger";
  isOpen?: boolean;
}

export const Dialog = ({
  title,
  children,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  isOpen = false,
}: DialogProps) => {
  const theme = useTheme();
  const [focusedButton, setFocusedButton] = useState<0 | 1>(0);

  useInput(
    (_input, key) => {
      if (!isOpen) {
        return;
      }
      if (key.tab || key.leftArrow || key.rightArrow) {
        setFocusedButton((prev) => (prev === 0 ? 1 : 0));
      } else if (key.return) {
        if (focusedButton === 1) {
          onConfirm?.();
        } else {
          onCancel?.();
        }
      } else if (key.escape) {
        onCancel?.();
      }
    },
    { isActive: isOpen }
  );

  if (!isOpen) {
    return null;
  }

  const confirmColor =
    variant === "danger" ? (theme.colors.error ?? "red") : theme.colors.primary;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={
        variant === "danger"
          ? (theme.colors.error ?? "red")
          : theme.colors.primary
      }
      paddingX={1}
      paddingY={0}
    >
      {title && (
        <Box marginBottom={1}>
          <Text
            bold
            color={
              variant === "danger"
                ? (theme.colors.error ?? "red")
                : theme.colors.primary
            }
          >
            {title}
          </Text>
        </Box>
      )}
      <Box marginBottom={1} flexDirection="column">
        {children}
      </Box>
      <Box flexDirection="row" gap={2} justifyContent="flex-end" marginTop={1}>
        <Text
          color={
            focusedButton === 0
              ? theme.colors.foreground
              : theme.colors.mutedForeground
          }
          bold={focusedButton === 0}
          inverse={focusedButton === 0}
        >
          {" "}
          {cancelLabel}{" "}
        </Text>
        <Text
          color={
            focusedButton === 1 ? confirmColor : theme.colors.mutedForeground
          }
          bold={focusedButton === 1}
          inverse={focusedButton === 1}
        >
          {" "}
          {confirmLabel}{" "}
        </Text>
      </Box>
    </Box>
  );
};
