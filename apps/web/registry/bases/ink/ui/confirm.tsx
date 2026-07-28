import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";

export interface ConfirmProps {
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  defaultValue?: boolean;
  variant?: "default" | "danger";
  autoFocus?: boolean;
  isDisabled?: boolean;
  id?: string;
}

export const Confirm = ({
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Yes",
  cancelLabel = "No",
  defaultValue = false,
  variant = "default",
  autoFocus = false,
  isDisabled = false,
  id,
}: ConfirmProps) => {
  const theme = useTheme();
  const [selected, setSelected] = useState<boolean>(defaultValue);
  const { isFocused } = useFocus({
    autoFocus,
    id,
    isActive: !isDisabled,
  });

  useInput(
    (input, key) => {
      if (key.leftArrow || key.rightArrow) {
        setSelected((current) => !current);
      } else if (key.return) {
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
    { isActive: isFocused && !isDisabled }
  );

  const yesColor =
    variant === "danger" ? theme.colors.error : theme.colors.primary;

  return (
    <Box flexDirection="column" gap={0}>
      <Text>
        <Text color={theme.colors.primary}>{"? "}</Text>
        {message}
      </Text>
      <Box gap={2} paddingLeft={2}>
        <Box gap={1}>
          {selected ? (
            <Text color={yesColor} bold>
              {"› "}
              {confirmLabel}
            </Text>
          ) : (
            <Text color={theme.colors.mutedForeground}>
              {"  "}
              {confirmLabel}
            </Text>
          )}
        </Box>
        <Box gap={1}>
          {selected ? (
            <Text color={theme.colors.mutedForeground}>
              {"  "}
              {cancelLabel}
            </Text>
          ) : (
            <Text bold>
              {"› "}
              {cancelLabel}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};
