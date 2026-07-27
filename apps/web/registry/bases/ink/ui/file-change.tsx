import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

import { DiffView } from "./diff-view";

export type FileChangeType = "modify" | "create" | "delete";

export interface FileChangeItem {
  path: string;
  type: FileChangeType;
  diff?: string;
  content?: string;
}

export interface FileChangeProps {
  changes: FileChangeItem[];
  onAccept?: (path: string) => void;
  onReject?: (path: string) => void;
  onAcceptAll?: () => void;
}

const TYPE_ICON: Record<FileChangeType, string> = {
  create: "A",
  delete: "D",
  modify: "M",
};

/**
 * Parse a unified diff string into old and new text arrays for DiffView.
 * Handles simple unified diff format.
 */
const parseDiff = (
  diff: string
): {
  oldText: string;
  newText: string;
} => {
  const lines = diff.split("\n");
  const oldLines: string[] = [];
  const newLines: string[] = [];

  for (const line of lines) {
    if (
      line.startsWith("---") ||
      line.startsWith("+++") ||
      line.startsWith("@@")
    ) {
      continue;
    }
    if (line.startsWith("-")) {
      oldLines.push(line.slice(1));
    } else if (line.startsWith("+")) {
      newLines.push(line.slice(1));
    } else if (line.startsWith(" ")) {
      const content = line.slice(1);
      oldLines.push(content);
      newLines.push(content);
    } else {
      oldLines.push(line);
      newLines.push(line);
    }
  }

  return { newText: newLines.join("\n"), oldText: oldLines.join("\n") };
};

export const FileChange = ({
  changes,
  onAccept,
  onReject,
  onAcceptAll,
}: FileChangeProps) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [acceptedPaths, setAcceptedPaths] = useState<Set<string>>(new Set());
  const [rejectedPaths, setRejectedPaths] = useState<Set<string>>(new Set());

  useInput((input, key) => {
    if (key.upArrow) {
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setActiveIndex((i) => Math.min(changes.length - 1, i + 1));
    } else if (key.return || input === " ") {
      const item = changes[activeIndex];
      if (!item) {
        return;
      }
      setExpandedPaths((prev) => {
        const next = new Set(prev);
        if (next.has(item.path)) {
          next.delete(item.path);
        } else {
          next.add(item.path);
        }
        return next;
      });
    } else if (input === "y" || input === "Y") {
      const item = changes[activeIndex];
      if (!item) {
        return;
      }
      setAcceptedPaths((prev) => new Set([...prev, item.path]));
      setRejectedPaths((prev) => {
        const next = new Set(prev);
        next.delete(item.path);
        return next;
      });
      onAccept?.(item.path);
    } else if (input === "n" || input === "N") {
      const item = changes[activeIndex];
      if (!item) {
        return;
      }
      setRejectedPaths((prev) => new Set([...prev, item.path]));
      setAcceptedPaths((prev) => {
        const next = new Set(prev);
        next.delete(item.path);
        return next;
      });
      onReject?.(item.path);
    } else if (input === "a" || input === "A") {
      onAcceptAll?.();
    }
  });

  const typeColor = (type: FileChangeType): string => {
    switch (type) {
      case "create": {
        return theme.colors.success ?? "green";
      }
      case "delete": {
        return theme.colors.error ?? "red";
      }
      case "modify": {
        return theme.colors.warning ?? "yellow";
      }
      default: {
        return theme.colors.mutedForeground;
      }
    }
  };

  return (
    <Box flexDirection="column">
      <Box gap={2} marginBottom={1}>
        <Text bold color={theme.colors.foreground}>
          File Changes ({changes.length})
        </Text>
        <Text dimColor color={theme.colors.mutedForeground}>
          [↑↓] navigate [Enter/Space] expand [y] accept [n] reject [a] accept
          all
        </Text>
      </Box>

      {changes.map((item, idx) => {
        const isActive = idx === activeIndex;
        const isExpanded = expandedPaths.has(item.path);
        const isAccepted = acceptedPaths.has(item.path);
        const isRejected = rejectedPaths.has(item.path);

        const diffParts = item.diff ? parseDiff(item.diff) : null;

        return (
          <Box key={item.path} flexDirection="column">
            <Box gap={1}>
              <Text color={isActive ? theme.colors.primary : undefined}>
                {isActive ? "›" : " "}
              </Text>
              <Text bold color={typeColor(item.type)}>
                {TYPE_ICON[item.type]}
              </Text>
              <Text
                color={
                  isActive ? theme.colors.primary : theme.colors.foreground
                }
                bold={isActive}
              >
                {item.path}
              </Text>
              {isAccepted && (
                <Text color={theme.colors.success ?? "green"}>✓ accepted</Text>
              )}
              {isRejected && (
                <Text color={theme.colors.error ?? "red"}>✗ rejected</Text>
              )}
              {(item.diff || item.content) && (
                <Text dimColor color={theme.colors.mutedForeground}>
                  {isExpanded ? "▼" : "▶"}
                </Text>
              )}
            </Box>

            {isExpanded && (
              <Box paddingLeft={2} marginTop={1}>
                {item.diff && diffParts && (
                  <DiffView
                    oldText={diffParts.oldText}
                    newText={diffParts.newText}
                    filename={item.path}
                    showLineNumbers
                  />
                )}
                {!(item.diff && diffParts) && item.content && (
                  <Box flexDirection="column">
                    {item.content.split("\n").map((line, li) => (
                      <Text key={li} color={theme.colors.success ?? "green"}>
                        +{line}
                      </Text>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
