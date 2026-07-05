import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface PasswordInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  mask?: string;
  showToggle?: boolean;
  label?: string;
  id?: string;
  borderStyle?: BorderStyle;
  paddingX?: number;
  width?: number;
  cursor?: string;
}

export const PasswordInput = ({
  value: controlledValue,
  onChange,
  onSubmit,
  placeholder = "",
  mask = "●",
  showToggle = false,
  label,
  id,
  borderStyle = "round",
  paddingX = 1,
  width,
  cursor = "█",
}: PasswordInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const { isFocused } = useFocus({ id });

  const value = controlledValue ?? internalValue;

  const setValue = (newVal: string) => {
    if (onChange) {
      onChange(newVal);
    } else {
      setInternalValue(newVal);
    }
  };

  useInput((input, key) => {
    if (!isFocused) {
      return;
    }

    if (showToggle && input === "\u0008") {
      setIsVisible((v) => !v);
      return;
    }

    if (key.return) {
      onSubmit?.(value);
      return;
    }

    if (key.backspace || key.delete) {
      setValue(value.slice(0, -1));
      return;
    }

    if (key.escape || key.upArrow || key.downArrow || key.tab) {
      return;
    }

    if (input && input.length > 0) {
      setValue(value + input);
    }
  });

  const displayValue = isVisible ? value : mask.repeat(value.length);
  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box flexDirection="row" alignItems="center" gap={1}>
        <Box
          borderStyle={borderStyle}
          borderColor={borderColor}
          paddingX={paddingX}
          width={width}
        >
          <Text
            color={
              value ? theme.colors.foreground : theme.colors.mutedForeground
            }
          >
            {displayValue || placeholder}
          </Text>
          {isFocused && <Text color={theme.colors.focusRing}>{cursor}</Text>}
        </Box>
        {showToggle && isFocused && (
          <Text color={theme.colors.mutedForeground}>
            {isVisible ? "Ctrl+H hide" : "Ctrl+H show"}
          </Text>
        )}
      </Box>
    </Box>
  );
};
