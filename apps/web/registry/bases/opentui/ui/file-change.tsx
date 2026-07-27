/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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

  useKeyboard((key) => {
    if (key.name === "up") {
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (key.name === "down") {
      setActiveIndex((i) => Math.min(changes.length - 1, i + 1));
    } else if (key.name === "return" || key.name === " ") {
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
    } else if (key.name === "y" || key.name === "Y") {
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
    } else if (key.name === "n" || key.name === "N") {
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
    } else if (key.name === "a" || key.name === "A") {
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
    <box flexDirection="column">
      <box gap={2} marginBottom={1}>
        <text fg={theme.colors.foreground}>
          <b>{`File Changes (${changes.length})`}</b>
        </text>
        <text fg="#666">
          [↑↓] navigate [Enter/Space] expand [y] accept [n] reject [a] accept
          all
        </text>
      </box>

      {changes.map((item, idx) => {
        const isActive = idx === activeIndex;
        const isExpanded = expandedPaths.has(item.path);
        const isAccepted = acceptedPaths.has(item.path);
        const isRejected = rejectedPaths.has(item.path);
        const diffParts = item.diff ? parseDiff(item.diff) : null;
        return (
          <box key={item.path} flexDirection="column">
            <box gap={1}>
              <text fg={isActive ? theme.colors.primary : undefined}>
                {isActive ? "›" : " "}
              </text>
              <text fg={typeColor(item.type)}>
                <b>{TYPE_ICON[item.type]}</b>
              </text>
              <text
                fg={isActive ? theme.colors.primary : theme.colors.foreground}
              >
                {isActive ? <b>{item.path}</b> : item.path}
              </text>
              {isAccepted && (
                <text fg={theme.colors.success ?? "green"}>✓ accepted</text>
              )}
              {isRejected && (
                <text fg={theme.colors.error ?? "red"}>✗ rejected</text>
              )}
              {(item.diff || item.content) && (
                <text fg="#666">{isExpanded ? "▼" : "▶"}</text>
              )}
            </box>
            {isExpanded && (
              <box paddingLeft={2} marginTop={1}>
                {item.diff && diffParts ? (
                  <DiffView
                    oldText={diffParts.oldText}
                    newText={diffParts.newText}
                    filename={item.path}
                    showLineNumbers={true}
                  />
                ) : (
                  item.content && (
                    <box flexDirection="column">
                      {...item.content
                        .split("\n")
                        .map((line, li) => (
                          <text
                            key={li}
                            fg={theme.colors.success ?? "green"}
                          >{`+${line}`}</text>
                        ))}
                    </box>
                  )
                )}
              </box>
            )}
          </box>
        );
      })}
    </box>
  );
};
