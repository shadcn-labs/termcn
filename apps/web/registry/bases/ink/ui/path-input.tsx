import { readdirSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";

import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";

export interface PathInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  isDisabled?: boolean;
  id?: string;
  width?: number;
  filter?: string;
  dirsOnly?: boolean;
}

const getCompletions = (
  inputPath: string,
  filter?: string,
  dirsOnly?: boolean
): string[] => {
  try {
    let dir: string;
    let prefix: string;

    if (inputPath.endsWith("/")) {
      dir = inputPath;
      prefix = "";
    } else {
      dir = dirname(inputPath);
      prefix = basename(inputPath);
    }

    const entries = readdirSync(dir || "/");
    return entries
      .filter((e) => e.startsWith(prefix))
      .filter((e) => {
        try {
          const fullPath = join(dir, e);
          const stat = statSync(fullPath);
          if (dirsOnly && !stat.isDirectory()) {
            return false;
          }
          if (filter && !stat.isDirectory() && !e.endsWith(filter)) {
            return false;
          }
          return true;
        } catch {
          return false;
        }
      })
      .map((e) => {
        try {
          const fullPath = join(dir, e);
          const stat = statSync(fullPath);
          return stat.isDirectory() ? `${join(dir, e)}/` : join(dir, e);
        } catch {
          return join(dir, e);
        }
      })
      .slice(0, 5);
  } catch {
    return [];
  }
};

export const PathInput = ({
  value: controlledValue,
  onChange,
  onSubmit,
  label,
  placeholder = "/",
  autoFocus = false,
  isDisabled = false,
  id,
  width = 40,
  filter,
  dirsOnly = false,
}: PathInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const [completionIndex, setCompletionIndex] = useState(0);
  const theme = useTheme();
  const { isFocused } = useFocus({
    autoFocus,
    id,
    isActive: !isDisabled,
  });

  const value = controlledValue ?? internalValue;
  const completions =
    isFocused && value.length > 0
      ? getCompletions(value, filter, dirsOnly)
      : [];

  const setValue = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const insertText = (input: string) => {
    if (!input) {
      return;
    }
    setCompletionIndex(0);
    setValue(value + input);
  };

  useInput(
    (input, key) => {
      if (!isFocused) {
        return;
      }

      if (key.return) {
        onSubmit?.(value);
        return;
      }

      if (key.rightArrow) {
        if (completions.length > 0) {
          const selected = completions[completionIndex] ?? completions[0];
          setValue(selected);
          setCompletionIndex(0);
        }
        return;
      }

      if (key.upArrow) {
        setCompletionIndex((index) => Math.max(0, index - 1));
        return;
      }

      if (key.downArrow) {
        if (completions.length > 0) {
          setCompletionIndex((index) =>
            Math.min(completions.length - 1, index + 1)
          );
        }
        return;
      }

      if (key.backspace || key.delete) {
        setCompletionIndex(0);
        setValue(value.slice(0, -1));
        return;
      }

      if (key.escape || key.tab) {
        return;
      }

      insertText(input);
    },
    { isActive: isFocused && !isDisabled }
  );

  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

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
        {isFocused && <Text color={theme.colors.focusRing}>█</Text>}
      </Box>
      {isFocused && completions.length > 0 && (
        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor={theme.colors.border}
          width={width}
        >
          {completions.map((c, idx) => (
            <Box key={c} paddingX={1}>
              <Text
                color={
                  idx === completionIndex
                    ? theme.colors.selectionForeground
                    : theme.colors.foreground
                }
                backgroundColor={
                  idx === completionIndex ? theme.colors.selection : undefined
                }
              >
                {c}
              </Text>
            </Box>
          ))}
        </Box>
      )}
      {isFocused && completions.length > 0 && (
        <Text color={theme.colors.mutedForeground} dimColor>
          {"→: accept · ↑↓: navigate"}
        </Text>
      )}
    </Box>
  );
};
