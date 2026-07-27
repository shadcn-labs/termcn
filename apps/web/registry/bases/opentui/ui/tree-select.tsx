/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface TreeSelectNode<T = string> {
  value: T;
  label: string;
  children?: TreeSelectNode<T>[];
  disabled?: boolean;
}

export interface TreeSelectProps<T = string> {
  nodes: TreeSelectNode<T>[];
  value?: T;
  onChange?: (value: T) => void;
  onSubmit?: (value: T) => void;
  label?: string;
  expandedByDefault?: boolean;
}

interface FlatNode<T> {
  node: TreeSelectNode<T>;
  depth: number;
  path: string;
  hasChildren: boolean;
}

const flatten = <T,>(
  nodes: TreeSelectNode<T>[],
  depth: number,
  expanded: Set<string>,
  pathPrefix: string,
  expandedByDefault: boolean
): FlatNode<T>[] => {
  const result: FlatNode<T>[] = [];

  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    const path = `${pathPrefix}/${i}`;
    const hasChildren = !!(node.children && node.children.length > 0);
    result.push({ depth, hasChildren, node, path });
    if (hasChildren) {
      const isExpanded =
        expanded.has(path) ||
        (expandedByDefault && !expanded.has(`${path}:collapsed`));
      if (isExpanded) {
        result.push(
          ...flatten(
            node.children ?? [],
            depth + 1,
            expanded,
            path,
            expandedByDefault
          )
        );
      }
    }
  }

  return result;
};

const getNodeColor = (
  disabled: boolean | undefined,
  isCursor: boolean,
  isSelected: boolean,
  theme: ReturnType<typeof useTheme>
): string => {
  if (disabled) {
    return theme.colors.mutedForeground;
  }
  if (isCursor) {
    return theme.colors.primary;
  }
  if (isSelected) {
    return theme.colors.accent;
  }
  return theme.colors.foreground;
};

export const TreeSelect = <T = string,>({
  nodes,
  value: controlledValue,
  onChange,
  onSubmit,
  label,
  expandedByDefault = false,
}: TreeSelectProps<T>) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState(0);
  const [internalValue, setInternalValue] = useState<T | undefined>();

  const selected = controlledValue ?? internalValue;
  const flat = flatten(nodes, 0, expanded, "", expandedByDefault);

  useKeyboard((key) => {
    if (key.name === "up") {
      setCursor((c) => Math.max(0, c - 1));
    } else if (key.name === "down") {
      setCursor((c) => Math.min(flat.length - 1, c + 1));
    } else if (key.name === "left") {
      const item = flat[cursor];
      if (item && item.hasChildren) {
        const isExpanded =
          expanded.has(item.path) ||
          (expandedByDefault && !expanded.has(`${item.path}:collapsed`));
        if (isExpanded) {
          setExpanded((prev) => {
            const next = new Set(prev);
            next.delete(item.path);
            if (expandedByDefault) {
              next.add(`${item.path}:collapsed`);
            }
            return next;
          });
        }
      }
    } else if (key.name === "right" || key.name === " ") {
      const item = flat[cursor];
      if (item && item.hasChildren) {
        const isExpanded =
          expanded.has(item.path) ||
          (expandedByDefault && !expanded.has(`${item.path}:collapsed`));
        setExpanded((prev) => {
          const next = new Set(prev);
          if (isExpanded) {
            next.delete(item.path);
            if (expandedByDefault) {
              next.add(`${item.path}:collapsed`);
            }
          } else {
            next.add(item.path);
            next.delete(`${item.path}:collapsed`);
          }
          return next;
        });
      }
    } else if (key.name === "return") {
      const item = flat[cursor];
      if (item && !item.node.disabled) {
        onChange?.(item.node.value);
        onSubmit?.(item.node.value);
        setInternalValue(item.node.value);
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
      {flat.map((item, idx) => {
        const isCursor = idx === cursor;
        const isSelected =
          selected !== undefined && item.node.value === selected;
        const isExpanded =
          item.hasChildren &&
          (expanded.has(item.path) ||
            (expandedByDefault && !expanded.has(`${item.path}:collapsed`)));
        const prefix = "  ".repeat(item.depth);
        let icon = "";
        if (item.hasChildren) {
          icon = isExpanded ? "▼ " : "▶ ";
        } else {
          icon = "· ";
        }
        const color = getNodeColor(
          item.node.disabled,
          isCursor,
          isSelected,
          theme
        );
        const content = `${prefix}${icon}${item.node.label}`;
        return (
          <box key={`${item.path}-${idx}`}>
            <text
              fg={item.node.disabled ? "#666" : color}
              bg={isCursor ? theme.colors.selection : undefined}
            >
              {isCursor || isSelected ? <b>{content}</b> : content}
            </text>
          </box>
        );
      })}
    </box>
  );
};
