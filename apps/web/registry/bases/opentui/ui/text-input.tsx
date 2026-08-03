/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useInputPaste } from "@/registry/bases/opentui/lib/input-paste";
import {
  decodePaste,
  deleteBackwardAt,
  deleteForwardAt,
  getKeyText,
  insertAt,
  toSingleLine,
} from "@/registry/bases/opentui/lib/input-utils";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

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
  focused?: boolean;
  isDisabled?: boolean;
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
  focused,
  isDisabled = false,
  id,
  bordered = true,
  borderStyle = "rounded",
  paddingX = 1,
  cursor = "█",
}: TextInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const [cursorOffset, setCursorOffset] = useState(
    () => controlledValue?.length ?? 0
  );
  const [cursorWidth, setCursorWidth] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isFocused = !isDisabled && (focused ?? autoFocus);

  const value = controlledValue ?? internalValue;

  useEffect(() => {
    if (cursorOffset > value.length) {
      setCursorOffset(value.length);
    }
  }, [value, cursorOffset]);

  const setValue = (next: string) => {
    if (controlledValue === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const insertText = (input: string) => {
    if (!input) {
      return;
    }
    const nextValue = insertAt(value, cursorOffset, input);
    setCursorOffset(cursorOffset + input.length);
    setCursorWidth(input.length);
    setError(null);
    setValue(nextValue);
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
    } else if (key.name === "backspace") {
      const result = deleteBackwardAt(value, cursorOffset);
      nextValue = result.value;
      nextOffset = result.cursorOffset;
    } else if (key.name === "delete") {
      nextValue = deleteForwardAt(value, cursorOffset);
    } else {
      const input = getKeyText(key);
      if (input) {
        nextValue = insertAt(value, cursorOffset, input);
        nextOffset = cursorOffset + input.length;
        nextCursorWidth = input.length;
      }
    }
    setCursorOffset(nextOffset);
    setCursorWidth(nextCursorWidth);
    if (nextValue !== value) {
      setError(null);
      setValue(nextValue);
    }
  });

  useInputPaste((event) => {
    if (!isFocused) {
      return;
    }
    const input = toSingleLine(decodePaste(event.bytes));
    if (!input) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    insertText(input);
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
          <>
            <text fg={theme.colors.mutedForeground} reverse={true}>
              {placeholder[0] ?? " "}
            </text>
            <text fg={theme.colors.mutedForeground}>
              {placeholder.slice(1)}
            </text>
          </>
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
      <>
        {before && <text fg={theme.colors.foreground}>{before}</text>}
        {highlighted && (
          <text fg={theme.colors.foreground} reverse={true}>
            {highlighted}
          </text>
        )}
        <text reverse={true} fg={theme.colors.focusRing}>
          {cursorChar}
        </text>
        {after && <text fg={theme.colors.foreground}>{after}</text>}
      </>
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
    <box id={id} flexDirection="column">
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
