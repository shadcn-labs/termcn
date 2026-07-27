import { useCursor, Box, Text } from "ink";
import React, { useEffect, useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  resolveBorderStyle,
  resolveTerminalSymbol,
} from "@/registry/bases/ink/lib/accessibility";
import {
  cursorCellOffset,
  graphemeLength,
  insertAtGrapheme,
  removeGraphemeAt,
  removeGraphemeBefore,
  sliceGraphemes,
  splitGraphemes,
} from "@/registry/bases/ink/lib/terminal-text";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface TextInputProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
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
  isActive?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  "aria-label"?: string;
  cursorOrigin?: { x: number; y: number };
  bordered?: boolean;
  borderStyle?: BorderStyle;
  paddingX?: number;
  cursor?: string;
}

export const TextInput = ({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
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
  isActive = true,
  disabled = false,
  readOnly = false,
  required = false,
  "aria-label": ariaLabel,
  cursorOrigin,
  bordered = true,
  borderStyle = "round",
  paddingX = 1,
  cursor,
}: TextInputProps) => {
  const unicode = useUnicode();
  const resolvedCursor = cursor ?? resolveTerminalSymbol(unicode, "█", "|");
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [cursorOffset, setCursorOffset] = useState(0);
  const [cursorWidth, setCursorWidth] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { setCursorPosition } = useCursor();

  const value = controlledValue ?? internalValue;
  const valueLength = graphemeLength(value);

  useEffect(() => {
    if (cursorOffset > valueLength) {
      setCursorOffset(valueLength);
    }
  }, [cursorOffset, valueLength]);

  const setValue = (next: string) => {
    const changeHandler = onValueChange ?? onChange;
    if (changeHandler) {
      changeHandler(next);
    } else {
      setInternalValue(next);
    }
  };

  const { isFocused } = useInteraction(
    (input, key) => {
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
          nextOffset = Math.min(valueLength, nextOffset + 1);
        }
      } else if (key.home) {
        nextOffset = 0;
      } else if (key.end) {
        nextOffset = valueLength;
      } else if (!readOnly && key.backspace) {
        const result = removeGraphemeBefore(value, cursorOffset);
        nextValue = result.value;
        nextOffset = result.cursor;
      } else if (!readOnly && key.delete) {
        const result = removeGraphemeAt(value, cursorOffset);
        nextValue = result.value;
        nextOffset = result.cursor;
      } else if (!readOnly && input) {
        nextValue = insertAtGrapheme(value, cursorOffset, input);
        const insertedLength = graphemeLength(input);
        nextOffset = cursorOffset + insertedLength;

        if (insertedLength > 1) {
          nextCursorWidth = insertedLength;
        }
      }

      setCursorOffset(nextOffset);
      setCursorWidth(nextCursorWidth);

      if (nextValue !== value) {
        setValue(nextValue);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const displayValue = mask ? mask.repeat(valueLength) : value;
  const useNativeCursor = Boolean(cursorOrigin && showCursor && isFocused);
  setCursorPosition(
    useNativeCursor && cursorOrigin
      ? {
          x: cursorOrigin.x + cursorCellOffset(displayValue, cursorOffset),
          y: cursorOrigin.y,
        }
      : undefined
  );

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
      if (showCursor && isFocused && !useNativeCursor) {
        const placeholderGraphemes = splitGraphemes(placeholder);
        return (
          <Text color={theme.colors.mutedForeground}>
            <Text inverse>{placeholderGraphemes[0] ?? " "}</Text>
            {placeholderGraphemes.slice(1)}
          </Text>
        );
      }
      return <Text color={theme.colors.mutedForeground}>{placeholder}</Text>;
    }

    if (!showCursor || !isFocused || useNativeCursor) {
      return <Text color={theme.colors.foreground}>{displayValue}</Text>;
    }

    const before = sliceGraphemes(displayValue, 0, cursorOffset - pasteWidth);
    const highlighted = sliceGraphemes(
      displayValue,
      cursorOffset - pasteWidth,
      cursorOffset
    );
    const cursorChar =
      cursorOffset < graphemeLength(displayValue)
        ? sliceGraphemes(displayValue, cursorOffset, cursorOffset + 1)
        : resolvedCursor;
    const after = sliceGraphemes(displayValue, cursorOffset + 1);

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
          aria-label={
            ariaLabel ??
            `${label ?? "Text input"}: ${
              mask ? `${valueLength} characters` : value || "empty"
            }${error ? `. Error: ${error}` : ""}`
          }
          aria-role="textbox"
          aria-state={{ disabled, readonly: readOnly, required }}
          borderStyle={resolveBorderStyle(borderStyle, unicode)}
          borderColor={borderColor}
          width={width}
          paddingX={paddingX}
        >
          {renderValue()}
        </Box>
      ) : (
        <Box
          aria-label={
            ariaLabel ??
            `${label ?? "Text input"}: ${
              mask ? `${valueLength} characters` : value || "empty"
            }${error ? `. Error: ${error}` : ""}`
          }
          aria-role="textbox"
          aria-state={{ disabled, readonly: readOnly, required }}
          width={width}
          paddingX={paddingX}
        >
          {renderValue()}
        </Box>
      )}
      {error && <Text color={theme.colors.error}>{error}</Text>}
    </Box>
  );
};
