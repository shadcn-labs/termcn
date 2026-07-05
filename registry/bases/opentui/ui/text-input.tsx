/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/components/ui/opentui-theme-provider";

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
  autoFocus: _autoFocus = false,
  id: _id,
  bordered = true,
  borderStyle = "rounded",
  paddingX = 1,
  cursor = "█",
}: TextInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const [cursorOffset, setCursorOffset] = useState(0);
  const [cursorWidth, setCursorWidth] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const [isFocused] = useState(true);

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

  useKeyboard((key) => {
    if (!isFocused) {
      return;
    }
    if (
      key.name === "up" ||
      key.name === "down" ||
      (key.ctrl && key.name === "c") ||
      key.name === "tab"
    ) {
      return;
    }
    if (key.name === "return") {
      const err = validate ? validate(value) : null;
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      onSubmit?.(value);
      return;
    }
    if (key.name === "escape") {
      return;
    }
    let nextOffset = cursorOffset;
    let nextValue = value;
    let nextCursorWidth = 0;
    if (key.name === "left") {
      if (showCursor) {
        nextOffset = Math.max(0, nextOffset - 1);
      }
    } else if (key.name === "right") {
      if (showCursor) {
        nextOffset = Math.min(value.length, nextOffset + 1);
      }
    } else if (key.name === "backspace" || key.name === "delete") {
      if (cursorOffset > 0) {
        nextValue =
          value.slice(0, cursorOffset - 1) + value.slice(cursorOffset);
        nextOffset = cursorOffset - 1;
      }
    } else if (key.name.length === 1) {
      nextValue =
        value.slice(0, cursorOffset) + key.name + value.slice(cursorOffset);
      nextOffset = cursorOffset + key.name.length;
      if (key.name.length > 1) {
        nextCursorWidth = key.name.length;
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
          <text fg={theme.colors.mutedForeground}>
            <text reverse={true}>{placeholder[0] ?? " "}</text>
            {placeholder.slice(1)}
          </text>
        );
      }
      return <text fg={theme.colors.mutedForeground}>{placeholder}</text>;
    }

    if (!showCursor || !isFocused) {
      return <text fg={theme.colors.foreground}>{displayValue}</text>;
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
      <text fg={theme.colors.foreground}>
        {before}
        {highlighted && <text reverse={true}>{highlighted}</text>}
        <text reverse={true} fg={theme.colors.focusRing}>
          {cursorChar}
        </text>
        {after}
      </text>
    );
  };
  const boxProps = bordered
    ? {
        borderColor,
        borderStyle,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        width,
      }
    : { paddingLeft: paddingX, paddingRight: paddingX, width };

  return (
    <box flexDirection="column">
      {label && (
        <text>
          <b>{label}</b>
        </text>
      )}
      <box {...boxProps}>{renderValue()}</box>
      {error && <text fg={theme.colors.error}>{error}</text>}
    </box>
  );
};
