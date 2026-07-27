/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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

  useKeyboard((key) => {
    if (!isOpen) {
      return;
    }
    if (key.name === "escape") {
      setQuery("");
      setCursor(0);
      onClose?.();
      return;
    }
    if (key.name === "up") {
      setCursor((c) => Math.max(0, c - 1));
      return;
    }
    if (key.name === "down") {
      setCursor((c) => Math.min(filtered.length - 1, c + 1));
      return;
    }
    if (key.name === "return") {
      const cmd = filtered[cursor];
      if (cmd) {
        cmd.onSelect?.();
        setQuery("");
        setCursor(0);
        onClose?.();
      }
      return;
    }
    if (key.name === "backspace" || key.name === "delete") {
      setQuery((q) => q.slice(0, -1));
      setCursor(0);
      return;
    }
    if (key.name === "tab") {
      return;
    }
    if (key.name.length > 1) {
      return;
    }
    setQuery((q) => q + key.name);
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
    <box
      flexDirection="column"
      borderStyle="rounded"
      borderColor={theme.colors.focusRing}
      paddingLeft={1}
      paddingRight={1}
    >
      <box
        borderStyle="single"
        borderColor={theme.colors.border}
        paddingLeft={1}
        paddingRight={1}
      >
        <text fg={theme.colors.mutedForeground}>{"⌘ "}</text>
        <text
          fg={query ? theme.colors.foreground : theme.colors.mutedForeground}
        >
          {query || placeholder}
        </text>
        <text fg={theme.colors.focusRing}>█</text>
      </box>

      {filtered.length === 0 ? (
        <box paddingLeft={1} paddingRight={1} paddingTop={0} paddingBottom={0}>
          <text fg="#666">No commands found</text>
        </box>
      ) : (
        <box flexDirection="column">
          {[...groups.entries()].map(([group, cmds]) => (
            <box key={group ?? "_"} flexDirection="column">
              {group && (
                <box paddingLeft={1} paddingRight={1}>
                  <text fg="#666">
                    <b>{group}</b>
                  </text>
                </box>
              )}
              {cmds.map((cmd) => {
                const idx = (flatIdx += 1);
                const isCursor = idx === cursor;
                return (
                  <box key={cmd.id} paddingLeft={1} paddingRight={1}>
                    <box flexGrow={1}>
                      <text
                        fg={
                          isCursor
                            ? theme.colors.selectionForeground
                            : theme.colors.foreground
                        }
                        inverse={isCursor}
                      >
                        {isCursor ? <b>{cmd.label}</b> : cmd.label}
                      </text>
                      {cmd.description && (
                        <text fg="#666">{` — ${cmd.description}`}</text>
                      )}
                    </box>
                    {cmd.shortcut && (
                      <text fg={theme.colors.accent}>{cmd.shortcut}</text>
                    )}
                  </box>
                );
              })}
            </box>
          ))}
        </box>
      )}

      <text fg="#666">↑↓: navigate · Enter: run · Esc: close</text>
    </box>
  );
};
