import { Box, Text } from "ink";
import React, { useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  resolveBorderStyle,
  resolveTerminalSymbol,
} from "@/registry/bases/ink/lib/accessibility";
import {
  graphemeLength,
  removeGraphemeBefore,
} from "@/registry/bases/ink/lib/terminal-text";

export interface EmailInputProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  id?: string;
  width?: number;
  suggestions?: string[];
  isActive?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  "aria-label"?: string;
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
  defaultValue = "",
  onValueChange,
  onChange,
  onSubmit,
  label,
  placeholder = "you@example.com",
  autoFocus = false,
  id,
  width = 40,
  suggestions = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"],
  isActive = true,
  disabled = false,
  readOnly = false,
  required = false,
  "aria-label": ariaLabel,
}: EmailInputProps) => {
  const unicode = useUnicode();
  const cursor = resolveTerminalSymbol(unicode, "█", "|");
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  const value = controlledValue ?? internalValue;

  const applyChange = (newVal: string) => {
    const changeHandler = onValueChange ?? onChange;
    if (changeHandler) {
      changeHandler(newVal);
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

  const { isFocused } = useInteraction(
    (input, key) => {
      if (key.return) {
        if (!isValidEmail(value)) {
          setError("Please enter a valid email address");
          return;
        }
        setError(null);
        onSubmit?.(value);
        return;
      }

      if (key.rightArrow) {
        const hint = getSuggestion(value);
        if (hint) {
          const newVal = value + hint;
          applyChange(newVal);
        }
        return;
      }

      if (readOnly) {
        return;
      }

      if (key.backspace) {
        setError(null);
        const newVal = removeGraphemeBefore(value, graphemeLength(value)).value;
        applyChange(newVal);
        return;
      }

      if (key.escape || key.upArrow || key.downArrow) {
        return;
      }

      setError(null);
      if (input && !(key.ctrl || key.meta)) {
        applyChange(value + input);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const borderColor = getBorderColor(error, isFocused, theme);

  const suggestion = getSuggestion(value);

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box
        aria-label={
          ariaLabel ??
          `${label ?? "Email"}: ${value || "empty"}${
            error ? `. Error: ${error}` : ""
          }`
        }
        aria-role="textbox"
        aria-state={{ disabled, readonly: readOnly, required }}
        borderStyle={resolveBorderStyle("round", unicode)}
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
          <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
            {suggestion}
          </Text>
        )}
        {isFocused && (
          <Text aria-hidden color={theme.colors.focusRing}>
            {cursor}
          </Text>
        )}
      </Box>
      {error && <Text color={theme.colors.error}>{error}</Text>}
      {isFocused && suggestion && (
        <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
          Right arrow to complete: {value}
          {suggestion}
        </Text>
      )}
    </Box>
  );
};
