/* @jsxImportSource @opentui/react */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface DirectoryTreeProps {
  rootPath?: string;
  onSelect?: (path: string) => void;
  maxDepth?: number;
  showHidden?: boolean;
  label?: string;
}

interface TreeEntry {
  path: string;
  name: string;
  depth: number;
  isDir: boolean;
  isLast: boolean;
}

const readEntries = (
  dir: string,
  depth: number,
  maxDepth: number,
  expanded: Set<string>,
  showHidden: boolean
): TreeEntry[] => {
  const result: TreeEntry[] = [];
  let entries: string[];

  try {
    entries = readdirSync(dir).filter((e) =>
      showHidden ? true : !e.startsWith(".")
    );
  } catch {
    return result;
  }

  entries.sort((a, b) => {
    try {
      const aIsDir = statSync(join(dir, a)).isDirectory();
      const bIsDir = statSync(join(dir, b)).isDirectory();
      if (aIsDir && !bIsDir) {
        return -1;
      }
      if (!aIsDir && bIsDir) {
        return 1;
      }
    } catch {
      /* noop */
    }
    return a.localeCompare(b);
  });

  for (let i = 0; i < entries.length; i += 1) {
    const name = entries[i];
    const fullPath = join(dir, name);
    const isLast = i === entries.length - 1;
    let isDir = false;
    try {
      isDir = statSync(fullPath).isDirectory();
    } catch {
      /* noop */
    }
    result.push({ depth, isDir, isLast, name, path: fullPath });
    if (isDir && depth < maxDepth && expanded.has(fullPath)) {
      result.push(
        ...readEntries(fullPath, depth + 1, maxDepth, expanded, showHidden)
      );
    }
  }

  return result;
};

export const DirectoryTree = ({
  rootPath = process.cwd(),
  onSelect,
  maxDepth = 2,
  showHidden = false,
  label,
}: DirectoryTreeProps) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<Set<string>>(new Set([rootPath]));
  const [cursor, setCursor] = useState(0);

  const entries = readEntries(rootPath, 0, maxDepth + 1, expanded, showHidden);

  useKeyboard((key) => {
    if (key.name === "up") {
      setCursor((c) => Math.max(0, c - 1));
    } else if (key.name === "down") {
      setCursor((c) => Math.min(entries.length - 1, c + 1));
    } else if (key.name === "return" || key.name === "space") {
      const entry = entries[cursor];
      if (!entry) {
        return;
      }
      if (entry.isDir) {
        setExpanded((prev) => {
          const next = new Set(prev);
          if (next.has(entry.path)) {
            next.delete(entry.path);
          } else {
            next.add(entry.path);
          }
          return next;
        });
      } else {
        onSelect?.(entry.path);
      }
    }
  });

  return (
    <box flexDirection="column">
      {label && (
        <text>
          <b>{label}</b>
        </text>
      )}
      <text fg={theme.colors.primary}>
        <b>{rootPath}</b>
      </text>
      {entries.map((entry, idx) => {
        const isCursor = idx === cursor;
        const isExpanded = entry.isDir && expanded.has(entry.path);
        let icon: string;
        if (entry.isDir) {
          icon = isExpanded ? "▼ " : "▶ ";
        } else {
          icon = "· ";
        }
        const indent = "  ".repeat(entry.depth);
        let entryColor: string;
        if (isCursor) {
          entryColor = theme.colors.selectionForeground;
        } else if (entry.isDir) {
          entryColor = theme.colors.primary;
        } else {
          entryColor = theme.colors.foreground;
        }
        const textContent = `${indent}${icon}${entry.name}`;
        return (
          <box key={entry.path}>
            <text
              fg={entryColor}
              bg={isCursor ? theme.colors.selection : undefined}
            >
              {entry.isDir ? <b>{textContent}</b> : textContent}
            </text>
          </box>
        );
      })}
      <text fg={theme.colors.mutedForeground}>
        ↑↓: navigate · Space/Enter: expand/select
      </text>
    </box>
  );
};
