import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { Box, Text } from "ink";
import React, { useEffect, useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveTerminalSymbol } from "@/registry/bases/ink/lib/accessibility";

export interface DirectoryTreeProps extends InteractionProps {
  rootPath?: string;
  onSelect?: (path: string) => void;
  maxDepth?: number;
  showHidden?: boolean;
  label?: string;
  "aria-label"?: string;
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
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = label ?? "Directory tree",
}: DirectoryTreeProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const [expanded, setExpanded] = useState<Set<string>>(new Set([rootPath]));
  const [cursor, setCursor] = useState(0);

  const entries = readEntries(rootPath, 0, maxDepth + 1, expanded, showHidden);

  const { isFocused } = useInteraction(
    (input, key) => {
      if (key.upArrow) {
        setCursor((c) => Math.max(0, c - 1));
      } else if (key.downArrow) {
        setCursor((c) => Math.min(entries.length - 1, c + 1));
      } else if (key.home) {
        setCursor(0);
      } else if (key.end) {
        setCursor(Math.max(0, entries.length - 1));
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
    },
    { autoFocus, disabled, id, isActive }
  );

  useEffect(() => {
    setCursor((current) => Math.min(current, Math.max(0, entries.length - 1)));
  }, [entries.length]);

  return (
    <Box flexDirection="column" aria-role="list">
      <Text aria-label={`${ariaLabel}. Root: ${rootPath}`}>{""}</Text>
      {label && <Text bold>{label}</Text>}
      <Text color={theme.colors.primary} bold>
        {rootPath}
      </Text>
      {entries.map((entry, idx) => {
        const isCursor = idx === cursor;
        const isExpanded = entry.isDir && expanded.has(entry.path);

        let icon: string;
        if (entry.isDir) {
          icon = isExpanded
            ? resolveTerminalSymbol(unicode, "▼ ", "v ")
            : resolveTerminalSymbol(unicode, "▶ ", "> ");
        } else {
          icon = resolveTerminalSymbol(unicode, "· ", "- ");
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
          <Box
            key={entry.path}
            aria-role="listitem"
            aria-label={`${entry.name}, ${entry.isDir ? "directory" : "file"}, level ${entry.depth + 1}${
              entry.isDir ? `, ${isExpanded ? "expanded" : "collapsed"}` : ""
            }${isCursor && isFocused ? ", current" : ""}`}
            aria-state={{
              expanded: entry.isDir ? isExpanded : undefined,
              selected: isCursor && isFocused,
            }}
          >
            <Text
              color={entryColor}
              backgroundColor={isCursor ? theme.colors.selection : undefined}
              bold={entry.isDir}
            >
              {indent}
              {isCursor && isFocused ? "[" : ""}
              {icon}
              {entry.name}
              {isCursor && isFocused ? "]" : ""}
            </Text>
          </Box>
        );
      })}
      <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
        {unicode
          ? "↑↓: navigate · Space/Enter: expand/select"
          : "up/down: navigate - Space/Enter: expand/select"}
      </Text>
    </Box>
  );
};
