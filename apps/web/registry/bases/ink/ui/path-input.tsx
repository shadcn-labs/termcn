import { readdirSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";

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

export interface PathInputProps {
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
  filter?: string;
  dirsOnly?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  "aria-label"?: string;
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
  defaultValue = "",
  onValueChange,
  onChange,
  onSubmit,
  label,
  placeholder = "/",
  autoFocus = false,
  id,
  width = 40,
  filter,
  dirsOnly = false,
  isActive = true,
  disabled = false,
  readOnly = false,
  required = false,
  "aria-label": ariaLabel,
}: PathInputProps) => {
  const unicode = useUnicode();
  const cursor = resolveTerminalSymbol(unicode, "█", "|");
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [completionIndex, setCompletionIndex] = useState(0);
  const theme = useTheme();

  const value = controlledValue ?? internalValue;
  const applyChange = (nextValue: string) => {
    const changeHandler = onValueChange ?? onChange;
    if (changeHandler) {
      changeHandler(nextValue);
    } else {
      setInternalValue(nextValue);
    }
  };

  const { isFocused } = useInteraction(
    (input, key) => {
      const completionOptions = getCompletions(value, filter, dirsOnly);

      if (key.return) {
        onSubmit?.(value);
        return;
      }

      if (key.rightArrow) {
        if (completionOptions.length > 0) {
          const selected =
            completionOptions[completionIndex] ?? completionOptions[0];
          applyChange(selected);
          setCompletionIndex(0);
        }
        return;
      }

      if (key.upArrow) {
        setCompletionIndex((c) => Math.max(0, c - 1));
        return;
      }

      if (key.downArrow) {
        setCompletionIndex((c) =>
          Math.min(completionOptions.length - 1, c + 1)
        );
        return;
      }

      if (readOnly) {
        return;
      }

      if (key.backspace) {
        const newVal = removeGraphemeBefore(value, graphemeLength(value)).value;
        setCompletionIndex(0);
        applyChange(newVal);
        return;
      }

      if (key.escape) {
        return;
      }

      if (input && !(key.ctrl || key.meta)) {
        setCompletionIndex(0);
        applyChange(value + input);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const completions =
    isFocused && value.length > 0
      ? getCompletions(value, filter, dirsOnly)
      : [];

  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box
        aria-label={ariaLabel ?? `${label ?? "Path"}: ${value || "empty"}`}
        aria-role="textbox"
        aria-state={{ disabled, readonly: readOnly, required }}
        borderStyle={resolveBorderStyle("round", unicode)}
        borderColor={borderColor}
        width={width}
        paddingX={1}
      >
        <Text
          aria-hidden
          color={value ? theme.colors.foreground : theme.colors.mutedForeground}
        >
          {value || placeholder}
        </Text>
        {isFocused && (
          <Text aria-hidden color={theme.colors.focusRing}>
            {cursor}
          </Text>
        )}
      </Box>
      {isFocused && completions.length > 0 && (
        <Box
          aria-role="listbox"
          flexDirection="column"
          borderStyle={resolveBorderStyle("single", unicode)}
          borderColor={theme.colors.border}
          width={width}
        >
          {completions.map((c, idx) => (
            <Box
              key={c}
              aria-label={c}
              aria-role="option"
              aria-state={{ selected: idx === completionIndex }}
              paddingX={1}
            >
              <Text
                aria-hidden
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
        <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
          {resolveTerminalSymbol(
            unicode,
            "Right arrow: accept · ↑↓: navigate",
            "Right arrow: accept | up/down: navigate"
          )}
        </Text>
      )}
    </Box>
  );
};
