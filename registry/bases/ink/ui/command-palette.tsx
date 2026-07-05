import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  onSelect?: () => void;
  group?: string;
}

export interface CommandPaletteProps {
  commands: Command[];
  isOpen: boolean;
  onClose?: () => void;
  placeholder?: string;
  maxItems?: number;
}

/**
 * Fuzzy match: returns true if query is a subsequence of str (case insensitive).
 */
const fuzzyMatch = (str: string, query: string): boolean => {
  if (!query) {
    return true;
  }
  const s = str.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < s.length && qi < q.length; i += 1) {
    if (s[i] === q[qi]) {
      qi += 1;
    }
  }
  return qi === q.length;
};

/**
 * Score fuzzy match: lower = better. Consecutive matches score better.
 */
const fuzzyScore = (str: string, query: string): number => {
  if (!query) {
    return 0;
  }
  const s = str.toLowerCase();
  const q = query.toLowerCase();
  let score = 0;
  let qi = 0;
  let lastMatchIdx = -1;

  for (let i = 0; i < s.length && qi < q.length; i += 1) {
    if (s[i] === q[qi]) {
      score += i - lastMatchIdx - 1;
      lastMatchIdx = i;
      qi += 1;
    }
  }

  return score;
};

export const CommandPalette = ({
  commands,
  isOpen,
  onClose,
  placeholder = "Type a command...",
  maxItems = 8,
}: CommandPaletteProps) => {
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const filtered = commands
    .filter((c) => fuzzyMatch(c.label, query))
    .toSorted((a, b) => fuzzyScore(a.label, query) - fuzzyScore(b.label, query))
    .slice(0, maxItems);

  useInput((input, key) => {
    if (!isOpen) {
      return;
    }

    if (key.escape) {
      setQuery("");
      setCursor(0);
      onClose?.();
      return;
    }

    if (key.upArrow) {
      setCursor((c) => Math.max(0, c - 1));
      return;
    }

    if (key.downArrow) {
      setCursor((c) => Math.min(filtered.length - 1, c + 1));
      return;
    }

    if (key.return) {
      const cmd = filtered[cursor];
      if (cmd) {
        cmd.onSelect?.();
        setQuery("");
        setCursor(0);
        onClose?.();
      }
      return;
    }

    if (key.backspace || key.delete) {
      setQuery((q) => q.slice(0, -1));
      setCursor(0);
      return;
    }

    if (key.tab) {
      return;
    }

    setQuery((q) => q + input);
    setCursor(0);
  });

  if (!isOpen) {
    return null;
  }

  const groups = new Map<string | undefined, typeof filtered>();
  for (const cmd of filtered) {
    const g = cmd.group;
    if (!groups.has(g)) {
      groups.set(g, []);
    }
    groups.get(g)?.push(cmd);
  }

  let flatIdx = 0;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.colors.focusRing}
      paddingX={1}
    >
      <Box borderStyle="single" borderColor={theme.colors.border} paddingX={1}>
        <Text color={theme.colors.mutedForeground}>⌘ </Text>
        <Text
          color={query ? theme.colors.foreground : theme.colors.mutedForeground}
        >
          {query || placeholder}
        </Text>
        <Text color={theme.colors.focusRing}>█</Text>
      </Box>

      {filtered.length === 0 ? (
        <Box paddingX={1} paddingY={0}>
          <Text color={theme.colors.mutedForeground} dimColor>
            No commands found
          </Text>
        </Box>
      ) : (
        <Box flexDirection="column">
          {[...groups.entries()].map(([group, cmds]) => (
            <Box key={group ?? "_"} flexDirection="column">
              {group && (
                <Box paddingX={1}>
                  <Text color={theme.colors.mutedForeground} dimColor bold>
                    {group}
                  </Text>
                </Box>
              )}
              {cmds.map((cmd) => {
                const idx = (flatIdx += 1);
                const isCursor = idx === cursor;
                return (
                  <Box key={cmd.id} paddingX={1}>
                    <Box flexGrow={1}>
                      <Text
                        color={
                          isCursor
                            ? theme.colors.selectionForeground
                            : theme.colors.foreground
                        }
                        bold={isCursor}
                        inverse={isCursor}
                      >
                        {cmd.label}
                      </Text>
                      {cmd.description && (
                        <Text color={theme.colors.mutedForeground} dimColor>
                          {" — "}
                          {cmd.description}
                        </Text>
                      )}
                    </Box>
                    {cmd.shortcut && (
                      <Text color={theme.colors.accent} dimColor>
                        {cmd.shortcut}
                      </Text>
                    )}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      )}

      <Text color={theme.colors.mutedForeground} dimColor>
        ↑↓: navigate · Enter: run · Esc: close
      </Text>
    </Box>
  );
};
