import { Box, Text } from "ink";
import React, { useEffect, useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";
import {
  deleteBackwardAt,
  deleteForwardAt,
  insertAt,
} from "@/registry/bases/ink/lib/input-utils";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface PasswordInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  mask?: string;
  showToggle?: boolean;
  label?: string;
  autoFocus?: boolean;
  isDisabled?: boolean;
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
  autoFocus = false,
  isDisabled = false,
  id,
  borderStyle = "round",
  paddingX = 1,
  width,
  cursor = "█",
}: PasswordInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [cursorOffset, setCursorOffset] = useState(
    () => controlledValue?.length ?? 0
  );
  const theme = useTheme();
  const { isFocused } = useFocus({
    autoFocus,
    id,
    isActive: !isDisabled,
  });

  const value = controlledValue ?? internalValue;

  useEffect(() => {
    if (cursorOffset > value.length) {
      setCursorOffset(value.length);
    }
  }, [cursorOffset, value]);

  const setValue = (newVal: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newVal);
    }
    onChange?.(newVal);
  };

  const insertText = (input: string) => {
    if (!input) {
      return;
    }
    setValue(insertAt(value, cursorOffset, input));
    setCursorOffset(cursorOffset + input.length);
  };

  useInput(
    (input, key) => {
      if (!isFocused) {
        return;
      }

      if (showToggle && key.ctrl && input.toLowerCase() === "h") {
        setIsVisible((visible) => !visible);
        return;
      }

      if (key.return) {
        onSubmit?.(value);
        return;
      }

      if (key.leftArrow) {
        setCursorOffset((offset) => Math.max(0, offset - 1));
        return;
      }

      if (key.rightArrow) {
        setCursorOffset((offset) => Math.min(value.length, offset + 1));
        return;
      }

      if (key.backspace) {
        const result = deleteBackwardAt(value, cursorOffset);
        setValue(result.value);
        setCursorOffset(result.cursorOffset);
        return;
      }

      if (key.delete) {
        setValue(deleteForwardAt(value, cursorOffset));
        return;
      }

      if (key.escape || key.upArrow || key.downArrow || key.tab) {
        return;
      }

      insertText(input);
    },
    { isActive: isFocused && !isDisabled }
  );

  const displayValue = isVisible ? value : mask.repeat(value.length);
  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  const renderValue = () => {
    if (!value) {
      return (
        <Text color={theme.colors.mutedForeground}>
          {placeholder}
          {isFocused && <Text color={theme.colors.focusRing}>{cursor}</Text>}
        </Text>
      );
    }

    if (!isFocused) {
      return <Text color={theme.colors.foreground}>{displayValue}</Text>;
    }

    const before = displayValue.slice(0, cursorOffset);
    const cursorChar = displayValue[cursorOffset] ?? cursor;
    const after = displayValue.slice(
      cursorOffset < displayValue.length ? cursorOffset + 1 : cursorOffset
    );

    return (
      <Text color={theme.colors.foreground}>
        {before}
        <Text inverse color={theme.colors.focusRing}>
          {cursorChar}
        </Text>
        {after}
      </Text>
    );
  };

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
          {renderValue()}
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
