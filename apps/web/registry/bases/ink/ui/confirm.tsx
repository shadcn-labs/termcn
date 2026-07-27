import { Box, Text } from "ink";
import React, { useState } from "react";

import { isActivationKey, useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveTerminalSymbol } from "@/registry/bases/ink/lib/accessibility";

export interface ConfirmProps extends InteractionProps {
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  defaultValue?: boolean;
  variant?: "default" | "danger";
  "aria-label"?: string;
}

export const Confirm = ({
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Yes",
  cancelLabel = "No",
  defaultValue = false,
  variant = "default",
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel,
}: ConfirmProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const cursor = resolveTerminalSymbol(unicode, "›", ">");
  const [selected, setSelected] = useState<boolean>(defaultValue);

  const { isFocused } = useInteraction(
    (input, key) => {
      if (key.leftArrow || key.rightArrow) {
        setSelected((s) => !s);
      } else if (isActivationKey(input, key)) {
        if (selected) {
          onConfirm?.();
        } else {
          onCancel?.();
        }
      } else if (input === "y" || input === "Y") {
        onConfirm?.();
      } else if (input === "n" || input === "N") {
        onCancel?.();
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const yesColor =
    variant === "danger" ? theme.colors.error : theme.colors.primary;

  return (
    <Box flexDirection="column" gap={0} aria-role="toolbar">
      <Text aria-label={ariaLabel ?? `Confirmation: ${message}`}>{""}</Text>
      <Text>
        <Text color={theme.colors.primary}>{"? "}</Text>
        {message}
      </Text>
      <Box gap={2} paddingLeft={2}>
        <Box
          gap={1}
          aria-role="button"
          aria-label={confirmLabel}
          aria-state={{ disabled: disabled || undefined }}
        >
          {selected ? (
            <Text color={yesColor} bold>
              {isFocused ? `[${cursor}] ` : `${cursor} `}
              {confirmLabel}
            </Text>
          ) : (
            <Text color={theme.colors.mutedForeground}>
              {"  "}
              {confirmLabel}
            </Text>
          )}
        </Box>
        <Box
          gap={1}
          aria-role="button"
          aria-label={cancelLabel}
          aria-state={{ disabled: disabled || undefined }}
        >
          {selected ? (
            <Text color={theme.colors.mutedForeground}>
              {"  "}
              {cancelLabel}
            </Text>
          ) : (
            <Text bold>
              {isFocused ? `[${cursor}] ` : `${cursor} `}
              {cancelLabel}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};
