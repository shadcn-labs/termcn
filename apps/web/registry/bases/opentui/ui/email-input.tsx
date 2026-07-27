/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface EmailInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
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
  autoFocus: _autoFocus = false,
  id: _id,
  width = 40,
  suggestions = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"],
}: EmailInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const [isFocused] = useState(true);

  const value = controlledValue ?? internalValue;

  const applyChange = (newVal: string) => {
    if (onChange) {
      onChange(newVal);
    } else {
      setInternalValue(newVal);
    }
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
      const hint = getSuggestion(value);
      if (hint) {
        const newVal = value + hint;
        applyChange(newVal);
      }
      return;
    }
    if (key.name === "backspace" || key.name === "delete") {
      setError(null);
      const newVal = value.slice(0, -1);
      applyChange(newVal);
      return;
    }
    if (key.name === "escape" || key.name === "up" || key.name === "down") {
      return;
    }
    if (key.name.length === 1) {
      setError(null);
      const newVal = value + key.name;
      applyChange(newVal);
    }
  });

  const borderColor = getBorderColor(error, isFocused, theme);

  const suggestion = getSuggestion(value);

  return (
    <box flexDirection="column">
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
        <text
          fg={value ? theme.colors.foreground : theme.colors.mutedForeground}
        >
          {value || placeholder}
        </text>
        {isFocused && suggestion && <text fg="#666">{suggestion}</text>}
        {isFocused && <text fg={theme.colors.focusRing}>█</text>}
      </box>
      {error && <text fg={theme.colors.error}>{error}</text>}
      {isFocused && suggestion && (
        <text fg="#666">
          {"Tab to complete: "}
          {value}
          {suggestion}
        </text>
      )}
    </box>
  );
};
