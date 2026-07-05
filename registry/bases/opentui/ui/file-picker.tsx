/* @jsxImportSource @opentui/react */
import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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
  autoFocus: _autoFocus = false,
  id: _id,
  width = 50,
  maxVisible = 8,
}: FilePickerProps) => {
  const theme = useTheme();
  const [isFocused] = useState(true);
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

  useKeyboard((key) => {
    if (!isFocused) {
      return;
    }
    if (key.name === "up") {
      setCursor((c) => Math.max(0, c - 1));
    } else if (key.name === "down") {
      setCursor((c) => Math.min(allEntries.length - 1, c + 1));
    } else if (key.name === "return") {
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
    } else if (key.name === " ") {
      const entry = allEntries[cursor];
      if (entry && !entry.isDir) {
        if (onChange) {
          onChange(entry.path);
        } else {
          setInternalValue(entry.path);
        }
      }
    } else if (key.name === "escape") {
      setCurrentDir((d) => resolve(d, ".."));
      setCursor(0);
    }
  });

  return (
    <box flexDirection="column">
      {label && (
        <text>
          <b>{label}</b>
        </text>
      )}

      <box
        borderStyle="single"
        borderColor={isFocused ? theme.colors.focusRing : theme.colors.border}
        paddingLeft={1}
        paddingRight={1}
      >
        <text fg={theme.colors.primary}>
          <b>{currentDir}</b>
        </text>
      </box>

      <box
        flexDirection="column"
        borderStyle="single"
        borderColor={theme.colors.border}
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
            <box key={entry.path} paddingLeft={1} paddingRight={1}>
              <text
                fg={isCursor ? theme.colors.selectionForeground : entryColor}
                bg={isCursor ? theme.colors.selection : undefined}
              >
                {entry.isDir ? (
                  <b>
                    {"▶ "}
                    {entry.name}/
                  </b>
                ) : (
                  `· ${entry.name}`
                )}
              </text>
            </box>
          );
        })}
        {allEntries.length > maxVisible && (
          <box paddingLeft={1} paddingRight={1}>
            <text fg="#666">{`... ${allEntries.length - maxVisible} more`}</text>
          </box>
        )}
      </box>

      {selected && (
        <box paddingLeft={1} paddingRight={1}>
          <text fg={theme.colors.mutedForeground}>{"Selected: "}</text>
          <text fg={theme.colors.success}>{selected}</text>
        </box>
      )}

      {isFocused && (
        <text fg="#666">↑↓: navigate · Enter: open/select · Esc: up</text>
      )}
    </box>
  );
};
