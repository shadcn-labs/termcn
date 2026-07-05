/* @jsxImportSource @opentui/react */
import { readdirSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";

import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface PathInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
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
  autoFocus: _autoFocus = false,
  id: _id,
  width = 40,
  filter,
  dirsOnly = false,
}: PathInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const [completionIndex, setCompletionIndex] = useState(0);
  const theme = useTheme();
  const [isFocused] = useState(true);

  const value = controlledValue ?? internalValue;
  const completions =
    isFocused && value.length > 0
      ? getCompletions(value, filter, dirsOnly)
      : [];

  useKeyboard((key) => {
    if (!isFocused) {
      return;
    }
    if (key.name === "return") {
      onSubmit?.(value);
      return;
    }
    if (key.name === "tab") {
      if (completions.length > 0) {
        const selected = completions[completionIndex] ?? completions[0];
        if (onChange) {
          onChange(selected);
        } else {
          setInternalValue(selected);
        }
        setCompletionIndex(0);
      }
      return;
    }
    if (key.name === "up") {
      setCompletionIndex((c) => Math.max(0, c - 1));
      return;
    }
    if (key.name === "down") {
      setCompletionIndex((c) => Math.min(completions.length - 1, c + 1));
      return;
    }
    if (key.name === "backspace" || key.name === "delete") {
      const newVal = value.slice(0, -1);
      setCompletionIndex(0);
      if (onChange) {
        onChange(newVal);
      } else {
        setInternalValue(newVal);
      }
      return;
    }
    if (key.name === "escape") {
      return;
    }
    if (key.name.length === 1) {
      const newVal = value + key.name;
      setCompletionIndex(0);
      if (onChange) {
        onChange(newVal);
      } else {
        setInternalValue(newVal);
      }
    }
  });

  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  return (
    <box flexDirection="column">
      {label && (
        <text>
          <b>{label}</b>
        </text>
      )}
      <box borderStyle="rounded" paddingLeft={1} paddingRight={1}>
        <text
          fg={value ? theme.colors.foreground : theme.colors.mutedForeground}
        >
          {value || placeholder}
        </text>
        {isFocused && <text fg={theme.colors.focusRing}>█</text>}
      </box>
      {isFocused && completions.length > 0 && (
        <box
          flexDirection="column"
          borderStyle="single"
          borderColor={theme.colors.border}
        >
          {completions.map((c, idx) => (
            <box key={c} paddingLeft={1} paddingRight={1}>
              <text
                fg={
                  idx === completionIndex
                    ? theme.colors.selectionForeground
                    : theme.colors.foreground
                }
                bg={
                  idx === completionIndex ? theme.colors.selection : undefined
                }
              >
                {c}
              </text>
            </box>
          ))}
        </box>
      )}
      {isFocused && completions.length > 0 && (
        <text fg="#666">Tab: accept · ↑↓: navigate</text>
      )}
    </box>
  );
};
