import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

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

  useInput((input, key) => {
    if (key.upArrow) {
      setCursor((c) => Math.max(0, c - 1));
    } else if (key.downArrow) {
      setCursor((c) => Math.min(entries.length - 1, c + 1));
    } else if (key.return || input === " ") {
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
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Text color={theme.colors.primary} bold>
        {rootPath}
      </Text>
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

        return (
          <Box key={entry.path}>
            <Text
              color={entryColor}
              backgroundColor={isCursor ? theme.colors.selection : undefined}
              bold={entry.isDir}
            >
              {indent}
              {icon}
              {entry.name}
            </Text>
          </Box>
        );
      })}
      <Text color={theme.colors.mutedForeground} dimColor>
        ↑↓: navigate · Space/Enter: expand/select
      </Text>
    </Box>
  );
};
