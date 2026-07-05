import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  onLabel?: string;
  offLabel?: string;
  id?: string;
  disabled?: boolean;
  checkedIcon?: string;
  uncheckedIcon?: string;
  borderStyle?: BorderStyle;
  paddingX?: number;
}

export const Toggle = ({
  checked: controlledChecked,
  onChange,
  label,
  onLabel = "ON",
  offLabel = "OFF",
  id,
  disabled = false,
  checkedIcon = "●",
  uncheckedIcon = "○",
  borderStyle = "round",
  paddingX = 1,
}: ToggleProps) => {
  const theme = useTheme();
  const { isFocused } = useFocus({ id });
  const [internalChecked, setInternalChecked] = useState(false);
  const checked = controlledChecked ?? internalChecked;

  useInput((input) => {
    if (!isFocused || disabled) {
      return;
    }
    if (input === " ") {
      const next = !checked;
      if (onChange) {
        onChange(next);
      } else {
        setInternalChecked(next);
      }
    }
  });

  const trackColor = checked
    ? theme.colors.success
    : theme.colors.mutedForeground;
  const focusColor = isFocused ? theme.colors.focusRing : trackColor;
  const stateLabel = checked ? onLabel : offLabel;

  return (
    <Box gap={1} alignItems="center">
      <Box
        borderStyle={borderStyle}
        borderColor={focusColor}
        paddingX={paddingX}
      >
        <Text color={focusColor} bold={checked}>
          {checked ? checkedIcon : uncheckedIcon} {stateLabel}
        </Text>
      </Box>
      {label && (
        <Text
          color={
            disabled ? theme.colors.mutedForeground : theme.colors.foreground
          }
        >
          {label}
        </Text>
      )}
    </Box>
  );
};
