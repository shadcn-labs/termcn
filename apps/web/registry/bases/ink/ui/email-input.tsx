import { Box, Text } from "ink";
import React, { useEffect, useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";
import {
  deleteBackwardAt,
  deleteForwardAt,
  filterEmailInput,
  insertAt,
} from "@/registry/bases/ink/lib/input-utils";

export interface EmailInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
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
    const acceptedInput = filterEmailInput(value, input);
    if (!acceptedInput) {
      return;
    }
    applyChange(insertAt(value, cursorOffset, acceptedInput));
    setCursorOffset(cursorOffset + acceptedInput.length);
    setError(null);
  };

  useInput(
    (input, key) => {
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

      if (key.leftArrow) {
        setCursorOffset((offset) => Math.max(0, offset - 1));
        return;
      }

      if (key.rightArrow) {
        const hint =
          cursorOffset === value.length ? getSuggestion(value) : undefined;
        if (hint) {
          const completedValue = value + hint;
          applyChange(completedValue);
          setCursorOffset(completedValue.length);
        } else {
          setCursorOffset((offset) => Math.min(value.length, offset + 1));
        }
        return;
      }

      if (key.backspace) {
        const result = deleteBackwardAt(value, cursorOffset);
        applyChange(result.value);
        setCursorOffset(result.cursorOffset);
        setError(null);
        return;
      }

      if (key.delete) {
        applyChange(deleteForwardAt(value, cursorOffset));
        setError(null);
        return;
      }

      if (key.escape || key.upArrow || key.downArrow || key.tab) {
        return;
      }

      insertText(input);
    },
    { isActive: isFocused && !isDisabled }
  );

  const borderColor = getBorderColor(error, isFocused, theme);

  const suggestion =
    cursorOffset === value.length ? getSuggestion(value) : undefined;

  const renderValue = () => {
    if (!value) {
      return (
        <Text color={theme.colors.mutedForeground}>
          {placeholder}
          {isFocused && <Text color={theme.colors.focusRing}>█</Text>}
        </Text>
      );
    }

    if (!isFocused) {
      return <Text color={theme.colors.foreground}>{value}</Text>;
    }

    const before = value.slice(0, cursorOffset);
    const cursorChar = value[cursorOffset] ?? "█";
    const after = value.slice(
      cursorOffset < value.length ? cursorOffset + 1 : cursorOffset
    );

    return (
      <Text color={theme.colors.foreground}>
        {before}
        <Text inverse color={theme.colors.focusRing}>
          {cursorChar}
        </Text>
        {after}
        {suggestion && (
          <Text color={theme.colors.mutedForeground} dimColor>
            {suggestion}
          </Text>
        )}
      </Text>
    );
  };

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box
        borderStyle="round"
        borderColor={borderColor}
        width={width}
        paddingX={1}
      >
        {renderValue()}
      </Box>
      {error && <Text color={theme.colors.error}>{error}</Text>}
      {isFocused && suggestion && (
        <Text color={theme.colors.mutedForeground} dimColor>
          {"→ to complete: "}
          {value}
          {suggestion}
        </Text>
      )}
    </Box>
  );
};
