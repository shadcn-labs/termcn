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

export interface PasswordInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  mask?: string;
  showToggle?: boolean;
  label?: string;
  autoFocus?: boolean;
  focused?: boolean;
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
  focused,
  isDisabled = false,
  id,
  borderStyle = "rounded",
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
  const isFocused = !isDisabled && (focused ?? autoFocus);

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

  useKeyboard((key) => {
    if (!isFocused) {
      return;
    }
    if (showToggle && key.ctrl && key.name === "h") {
      setIsVisible((v) => !v);
      return;
    }
    if (key.name === "return") {
      onSubmit?.(value);
      return;
    }
    if (key.name === "left") {
      setCursorOffset((offset) => Math.max(0, offset - 1));
      return;
    }
    if (key.name === "right") {
      setCursorOffset((offset) => Math.min(value.length, offset + 1));
      return;
    }
    if (key.name === "backspace") {
      const result = deleteBackwardAt(value, cursorOffset);
      setValue(result.value);
      setCursorOffset(result.cursorOffset);
      return;
    }
    if (key.name === "delete") {
      setValue(deleteForwardAt(value, cursorOffset));
      return;
    }
    if (
      key.name === "escape" ||
      key.name === "up" ||
      key.name === "down" ||
      key.name === "tab"
    ) {
      return;
    }
    insertText(getKeyText(key));
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

  const displayValue = isVisible ? value : mask.repeat(value.length);
  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  return (
    <box id={id} flexDirection="column">
      {label && (
        <text>
          <b>{label}</b>
        </text>
      )}
      <box flexDirection="row" alignItems="center" gap={1}>
        <box
          borderStyle={borderStyle}
          borderColor={borderColor}
          paddingLeft={paddingX}
          paddingRight={paddingX}
          width={width}
        >
          {value && isFocused ? (
            <>
              <text fg={theme.colors.foreground}>
                {displayValue.slice(0, cursorOffset)}
              </text>
              {isFocused && (
                <text reverse fg={theme.colors.focusRing}>
                  {displayValue[cursorOffset] ?? cursor}
                </text>
              )}
              <text fg={theme.colors.foreground}>
                {displayValue.slice(
                  cursorOffset < displayValue.length
                    ? cursorOffset + 1
                    : cursorOffset
                )}
              </text>
            </>
          ) : value ? (
            <text fg={theme.colors.foreground}>{displayValue}</text>
          ) : (
            <>
              <text fg={theme.colors.mutedForeground}>{placeholder}</text>
              {isFocused && <text fg={theme.colors.focusRing}>{cursor}</text>}
            </>
          )}
        </box>
        {showToggle && isFocused && (
          <text fg={theme.colors.mutedForeground}>
            {isVisible ? "Ctrl+H hide" : "Ctrl+H show"}
          </text>
        )}
      </box>
    </box>
  );
};
