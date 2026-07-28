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

export interface EmailInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  focused?: boolean;
  isDisabled?: boolean;
  id?: string;
  width?: number;
  suggestions?: string[];
}

const isValidEmail = (email: string): boolean => {
  const atIdx = email.indexOf("@");
  if (atIdx < 1) {
    return false;
  }
  const domain = email.slice(atIdx + 1);
  return domain.includes(".");
};

const getBorderColor = (
  error: string | null,
  isFocused: boolean,
  theme: ReturnType<typeof useTheme>
): string => {
  if (error) {
    return theme.colors.error;
  }
  if (isFocused) {
    return theme.colors.focusRing;
  }
  return theme.colors.border;
};

export const EmailInput = ({
  value: controlledValue,
  onChange,
  onSubmit,
  label,
  placeholder = "you@example.com",
  autoFocus = false,
  focused,
  isDisabled = false,
  id,
  width = 40,
  suggestions = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"],
}: EmailInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const [error, setError] = useState<string | null>(null);
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

  const applyChange = (newVal: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newVal);
    }
    onChange?.(newVal);
  };

  const getSuggestion = (val: string): string | null => {
    const atIdx = val.indexOf("@");
    if (atIdx === -1) {
      return null;
    }
    const afterAt = val.slice(atIdx + 1);
    if (afterAt.length === 0) {
      return null;
    }
    const match = suggestions.find(
      (s) => s.startsWith(afterAt) && s !== afterAt
    );
    if (!match) {
      return null;
    }
    return match.slice(afterAt.length);
  };

  const insertText = (input: string) => {
    let hasAt = value.includes("@");
    const acceptedInput = [...input]
      .filter((character) => {
        if (character !== "@") {
          return true;
        }
        if (hasAt) {
          return false;
        }
        hasAt = true;
        return true;
      })
      .join("");

    if (!acceptedInput) {
      return;
    }

    applyChange(insertAt(value, cursorOffset, acceptedInput));
    setCursorOffset(cursorOffset + acceptedInput.length);
    setError(null);
  };

  useKeyboard((key) => {
    if (!isFocused) {
      return;
    }
    if (key.name === "return") {
      if (!isValidEmail(value)) {
        setError("Please enter a valid email address");
        return;
      }
      setError(null);
      onSubmit?.(value);
      return;
    }
    if (key.name === "tab") {
      const hint =
        cursorOffset === value.length ? getSuggestion(value) : undefined;
      if (hint) {
        const newVal = value + hint;
        applyChange(newVal);
        setCursorOffset(newVal.length);
      }
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
      setError(null);
      const result = deleteBackwardAt(value, cursorOffset);
      applyChange(result.value);
      setCursorOffset(result.cursorOffset);
      return;
    }
    if (key.name === "delete") {
      setError(null);
      applyChange(deleteForwardAt(value, cursorOffset));
      return;
    }
    if (key.name === "escape" || key.name === "up" || key.name === "down") {
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

  const borderColor = getBorderColor(error, isFocused, theme);

  const suggestion =
    cursorOffset === value.length ? getSuggestion(value) : undefined;

  return (
    <box id={id} flexDirection="column">
      {label && (
        <text>
          <b>{label}</b>
        </text>
      )}
      <box
        borderStyle="rounded"
        borderColor={borderColor}
        width={width}
        paddingLeft={1}
        paddingRight={1}
      >
        {value ? (
          isFocused ? (
            <>
              <text fg={theme.colors.foreground}>
                {value.slice(0, cursorOffset)}
              </text>
              {cursorOffset < value.length ? (
                <>
                  <text reverse fg={theme.colors.focusRing}>
                    {value[cursorOffset]}
                  </text>
                  <text fg={theme.colors.foreground}>
                    {value.slice(cursorOffset + 1)}
                  </text>
                </>
              ) : (
                <>
                  {suggestion && (
                    <text fg={theme.colors.mutedForeground}>{suggestion}</text>
                  )}
                  <text fg={theme.colors.focusRing}>█</text>
                </>
              )}
            </>
          ) : (
            <text fg={theme.colors.foreground}>{value}</text>
          )
        ) : (
          <>
            <text fg={theme.colors.mutedForeground}>{placeholder}</text>
            {isFocused && <text fg={theme.colors.focusRing}>█</text>}
          </>
        )}
      </box>
      {error && <text fg={theme.colors.error}>{error}</text>}
      {isFocused && suggestion && (
        <text fg={theme.colors.mutedForeground}>
          {"Tab to complete: "}
          {value}
          {suggestion}
        </text>
      )}
    </box>
  );
};
