import { Box, Text } from "ink";
import React, { useEffect, useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import type { BorderStyle } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";

export interface TextInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  mask?: string;
  showCursor?: boolean;
  highlightPastedText?: boolean;
  validate?: (value: string) => string | null;
  width?: number;
  label?: string;
  autoFocus?: boolean;
  id?: string;
  bordered?: boolean;
  borderStyle?: BorderStyle;
  paddingX?: number;
  cursor?: string;
}

export const TextInput = ({
  value: controlledValue,
  onChange,
  onSubmit,
  placeholder = "",
  mask,
  showCursor = true,
  highlightPastedText = false,
  validate,
  width = 40,
  label,
  autoFocus = false,
  id,
  bordered = true,
  borderStyle = "round",
  paddingX = 1,
  cursor = "█",
}: TextInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const [cursorOffset, setCursorOffset] = useState(0);
  const [cursorWidth, setCursorWidth] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { isFocused } = useFocus({ autoFocus, id });

  const value = controlledValue ?? internalValue;

  useEffect(() => {
    if (cursorOffset > value.length) {
      setCursorOffset(value.length);
    }
  }, [value, cursorOffset]);

  const setValue = (next: string) => {
    if (onChange) {
      onChange(next);
    } else {
      setInternalValue(next);
    }
  };

  useInput((input, key) => {
    if (!isFocused) {
      return;
    }

    if (
      key.upArrow ||
      key.downArrow ||
      (key.ctrl && input === "c") ||
      key.tab ||
      (key.shift && key.tab)
    ) {
      return;
    }

    if (key.return) {
      const err = validate ? validate(value) : null;
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      onSubmit?.(value);
      return;
    }

    if (key.escape) {
      return;
    }

    let nextOffset = cursorOffset;
    let nextValue = value;
    let nextCursorWidth = 0;

    if (key.leftArrow) {
      if (showCursor) {
        nextOffset = Math.max(0, nextOffset - 1);
      }
    } else if (key.rightArrow) {
      if (showCursor) {
        nextOffset = Math.min(value.length, nextOffset + 1);
      }
    } else if (key.backspace || key.delete) {
      if (cursorOffset > 0) {
        nextValue =
          value.slice(0, cursorOffset - 1) + value.slice(cursorOffset);
        nextOffset = cursorOffset - 1;
      }
    } else {
      nextValue =
        value.slice(0, cursorOffset) + input + value.slice(cursorOffset);
      nextOffset = cursorOffset + input.length;

      if (input.length > 1) {
        nextCursorWidth = input.length;
      }
    }

    setCursorOffset(nextOffset);
    setCursorWidth(nextCursorWidth);

    if (nextValue !== value) {
      setValue(nextValue);
    }
  });

  const displayValue = mask ? mask.repeat(value.length) : value;

  let borderColor: string;
  if (error) {
    borderColor = theme.colors.error;
  } else if (isFocused) {
    borderColor = theme.colors.focusRing;
  } else {
    borderColor = theme.colors.border;
  }

  const pasteWidth = highlightPastedText ? cursorWidth : 0;

  const renderValue = () => {
    if (!value && placeholder) {
      if (showCursor && isFocused) {
        return (
          <Text color={theme.colors.mutedForeground}>
            <Text inverse>{placeholder[0] ?? " "}</Text>
            {placeholder.slice(1)}
          </Text>
        );
      }
      return <Text color={theme.colors.mutedForeground}>{placeholder}</Text>;
    }

    if (!showCursor || !isFocused) {
      return <Text color={theme.colors.foreground}>{displayValue}</Text>;
    }

    const before = displayValue.slice(0, cursorOffset - pasteWidth);
    const highlighted = displayValue.slice(
      cursorOffset - pasteWidth,
      cursorOffset
    );
    const cursorChar =
      cursorOffset < displayValue.length ? displayValue[cursorOffset] : cursor;
    const after = displayValue.slice(cursorOffset + 1);

    return (
      <Text color={theme.colors.foreground}>
        {before}
        {highlighted && <Text inverse>{highlighted}</Text>}
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
      {bordered ? (
        <Box
          borderStyle={borderStyle}
          borderColor={borderColor}
          width={width}
          paddingX={paddingX}
        >
          {renderValue()}
        </Box>
      ) : (
        <Box width={width} paddingX={paddingX}>
          {renderValue()}
        </Box>
      )}
      {error && <Text color={theme.colors.error}>{error}</Text>}
    </Box>
  );
};
