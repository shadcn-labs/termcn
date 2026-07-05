import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";

export interface FilePickerProps {
  value?: string;
  onChange?: (path: string) => void;
  onSubmit?: (path: string) => void;
  label?: string;
  startDir?: string;
  extensions?: string[];
  dirsOnly?: boolean;
  autoFocus?: boolean;
  id?: string;
  width?: number;
  maxVisible?: number;
}

interface FileEntry {
  name: string;
  path: string;
  isDir: boolean;
}

const readDir = (
  dir: string,
  extensions?: string[],
  dirsOnly?: boolean
): FileEntry[] => {
  try {
    const entries = readdirSync(dir).filter((e) => !e.startsWith("."));
    const result: FileEntry[] = [];

    for (const name of entries) {
      const fullPath = join(dir, name);
      try {
        const stat = statSync(fullPath);
        const isDir = stat.isDirectory();
        if (dirsOnly && !isDir) {
          continue;
        }
        if (
          extensions &&
          !isDir &&
          !extensions.some((ext) => name.endsWith(ext))
        ) {
          continue;
        }
        result.push({ isDir, name, path: fullPath });
      } catch {
        /* noop */
      }
    }

    result.sort((a, b) => {
      if (a.isDir && !b.isDir) {
        return -1;
      }
      if (!a.isDir && b.isDir) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });

    return result;
  } catch {
    return [];
  }
};

export const FilePicker = ({
  value: controlledValue,
  onChange,
  onSubmit,
  label,
  startDir = process.cwd(),
  extensions,
  dirsOnly = false,
  autoFocus = false,
  id,
  width = 50,
  maxVisible = 8,
}: FilePickerProps) => {
  const theme = useTheme();
  const { isFocused } = useFocus({ autoFocus, id });
  const [currentDir, setCurrentDir] = useState(resolve(startDir));
  const [cursor, setCursor] = useState(0);
  const [internalValue, setInternalValue] = useState("");

  const selected = controlledValue ?? internalValue;
  const entries = readDir(currentDir, extensions, dirsOnly);

  const parentEntry: FileEntry = {
    isDir: true,
    name: "..",
    path: resolve(currentDir, ".."),
  };
  const allEntries: FileEntry[] = [parentEntry, ...entries];

  const visibleStart = Math.max(0, cursor - maxVisible + 1);
  const visible = allEntries.slice(visibleStart, visibleStart + maxVisible);

  useInput((input, key) => {
    if (!isFocused) {
      return;
    }

    if (key.upArrow) {
      setCursor((c) => Math.max(0, c - 1));
    } else if (key.downArrow) {
      setCursor((c) => Math.min(allEntries.length - 1, c + 1));
    } else if (key.return) {
      const entry = allEntries[cursor];
      if (!entry) {
        return;
      }
      if (entry.isDir) {
        setCurrentDir(entry.path);
        setCursor(0);
      } else {
        if (onChange) {
          onChange(entry.path);
        } else {
          setInternalValue(entry.path);
        }
        onSubmit?.(entry.path);
      }
    } else if (input === " ") {
      const entry = allEntries[cursor];
      if (entry && !entry.isDir) {
        if (onChange) {
          onChange(entry.path);
        } else {
          setInternalValue(entry.path);
        }
      }
    } else if (key.escape) {
      setCurrentDir((d) => resolve(d, ".."));
      setCursor(0);
    }
  });

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}

      <Box
        borderStyle="single"
        borderColor={isFocused ? theme.colors.focusRing : theme.colors.border}
        width={width}
        paddingX={1}
      >
        <Text color={theme.colors.primary} bold>
          {currentDir}
        </Text>
      </Box>

      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor={theme.colors.border}
        width={width}
      >
        {visible.map((entry, idx) => {
          const absIdx = visibleStart + idx;
          const isCursor = absIdx === cursor;
          const isSelected = entry.path === selected;

          let entryColor: string;
          if (entry.isDir) {
            entryColor = theme.colors.primary;
          } else if (isSelected) {
            entryColor = theme.colors.accent;
          } else {
            entryColor = theme.colors.foreground;
          }

          return (
            <Box key={entry.path} paddingX={1}>
              <Text
                color={isCursor ? theme.colors.selectionForeground : entryColor}
                backgroundColor={isCursor ? theme.colors.selection : undefined}
                bold={entry.isDir}
              >
                {entry.isDir ? "▶ " : "· "}
                {entry.name}
                {entry.isDir ? "/" : ""}
              </Text>
            </Box>
          );
        })}
        {allEntries.length > maxVisible && (
          <Box paddingX={1}>
            <Text color={theme.colors.mutedForeground} dimColor>
              ... {allEntries.length - maxVisible} more
            </Text>
          </Box>
        )}
      </Box>

      {selected && (
        <Box paddingX={1}>
          <Text color={theme.colors.mutedForeground}>Selected: </Text>
          <Text color={theme.colors.success}>{selected}</Text>
        </Box>
      )}

      {isFocused && (
        <Text color={theme.colors.mutedForeground} dimColor>
          ↑↓: navigate · Enter: open/select · Esc: up
        </Text>
      )}
    </Box>
  );
};
