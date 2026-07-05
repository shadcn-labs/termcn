import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";

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
  autoFocus = false,
  id,
  width = 40,
  suggestions = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"],
}: EmailInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { isFocused } = useFocus({ autoFocus, id });

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

  useInput((input, key) => {
    if (!isFocused) {
      return;
    }

    if (key.return) {
      if (!isValidEmail(value)) {
        setError("Please enter a valid email address");
        return;
      }
      setError(null);
      onSubmit?.(value);
      return;
    }

    if (key.tab) {
      const hint = getSuggestion(value);
      if (hint) {
        const newVal = value + hint;
        applyChange(newVal);
      }
      return;
    }

    if (key.backspace || key.delete) {
      setError(null);
      const newVal = value.slice(0, -1);
      applyChange(newVal);
      return;
    }

    if (key.escape || key.upArrow || key.downArrow) {
      return;
    }

    setError(null);
    const newVal = value + input;
    applyChange(newVal);
  });

  const borderColor = getBorderColor(error, isFocused, theme);

  const suggestion = getSuggestion(value);

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box
        borderStyle="round"
        borderColor={borderColor}
        width={width}
        paddingX={1}
      >
        <Text
          color={value ? theme.colors.foreground : theme.colors.mutedForeground}
        >
          {value || placeholder}
        </Text>
        {isFocused && suggestion && (
          <Text color={theme.colors.mutedForeground} dimColor>
            {suggestion}
          </Text>
        )}
        {isFocused && <Text color={theme.colors.focusRing}>█</Text>}
      </Box>
      {error && <Text color={theme.colors.error}>{error}</Text>}
      {isFocused && suggestion && (
        <Text color={theme.colors.mutedForeground} dimColor>
          Tab to complete: {value}
          {suggestion}
        </Text>
      )}
    </Box>
  );
};
