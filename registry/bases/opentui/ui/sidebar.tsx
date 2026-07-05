/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface SidebarItem {
  key: string;
  label: string;
  icon?: string;
  badge?: string | number;
  children?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  activeKey?: string;
  onSelect?: (key: string) => void;
  collapsed?: boolean;
  width?: number;
  title?: string;
}

const flattenItems = (
  items: SidebarItem[],
  expandedKeys: Set<string>,
  depth = 0
): {
  item: SidebarItem;
  depth: number;
}[] => {
  const result: {
    item: SidebarItem;
    depth: number;
  }[] = [];
  for (const item of items) {
    result.push({ depth, item });
    if (item.children && expandedKeys.has(item.key)) {
      result.push(...flattenItems(item.children, expandedKeys, depth + 1));
    }
  }
  return result;
};

export const Sidebar = ({
  items,
  activeKey,
  onSelect,
  collapsed = false,
  width = 20,
  title,
}: SidebarProps) => {
  const theme = useTheme();
  const [focusIndex, setFocusIndex] = useState(0);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const effectiveWidth = collapsed ? 3 : width;
  const flatItems = flattenItems(items, expandedKeys);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  useKeyboard((key) => {
    if (key.name === "up") {
      setFocusIndex((prev) => Math.max(0, prev - 1));
    } else if (key.name === "down") {
      setFocusIndex((prev) => Math.min(flatItems.length - 1, prev + 1));
    } else if (key.name === "return") {
      const entry = flatItems[focusIndex];
      if (!entry) {
        return;
      }
      if (entry.item.children && entry.item.children.length > 0) {
        toggleExpand(entry.item.key);
      } else {
        onSelect?.(entry.item.key);
      }
    } else if (key.name === "right") {
      const entry = flatItems[focusIndex];
      if (entry?.item.children && entry.item.children.length > 0) {
        setExpandedKeys((prev) => new Set([...prev, entry.item.key]));
      }
    } else if (key.name === "left") {
      const entry = flatItems[focusIndex];
      if (entry?.item.children && expandedKeys.has(entry.item.key)) {
        setExpandedKeys((prev) => {
          const next = new Set(prev);
          next.delete(entry.item.key);
          return next;
        });
      }
    }
  });

  return (
    <box
      flexDirection="column"
      borderStyle="single"
      borderColor={theme.colors.border}
      width={effectiveWidth}
      paddingLeft={0}
      paddingRight={0}
      paddingTop={0}
      paddingBottom={0}
    >
      {title && !collapsed && (
        <box paddingLeft={1} paddingRight={1} marginBottom={1}>
          <text fg={theme.colors.primary}>
            <b>{title}</b>
          </text>
        </box>
      )}
      {flatItems.map(({ item, depth }, idx) => {
        const isFocused = idx === focusIndex;
        const isActive = item.key === activeKey;
        const indent = collapsed ? 0 : depth * 2;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedKeys.has(item.key);
        if (collapsed) {
          let collapsedColor: string;
          if (isActive) {
            collapsedColor = theme.colors.primary;
          } else if (isFocused) {
            collapsedColor = theme.colors.foreground;
          } else {
            collapsedColor = theme.colors.mutedForeground;
          }
          return (
            <box key={item.key} paddingLeft={0} paddingRight={0}>
              <text fg={collapsedColor}>
                {isActive ? (
                  <b>{item.icon ?? item.label.charAt(0)}</b>
                ) : (
                  (item.icon ?? item.label.charAt(0))
                )}
              </text>
            </box>
          );
        }
        let labelColor: string;
        if (isActive) {
          labelColor = theme.colors.primary;
        } else if (isFocused) {
          labelColor = theme.colors.foreground;
        } else {
          labelColor = theme.colors.mutedForeground;
        }
        return (
          <box key={item.key} flexDirection="row" alignItems="center">
            <text fg={isActive ? theme.colors.primary : "transparent"}>
              {isActive ? "▌" : " "}
            </text>
            {indent > 0 && <text>{" ".repeat(indent)}</text>}
            {hasChildren ? (
              <text fg={theme.colors.mutedForeground}>
                {isExpanded ? "▾ " : "▸ "}
              </text>
            ) : (
              <text>{"  "}</text>
            )}
            {item.icon && (
              <text
                fg={
                  isActive ? theme.colors.primary : theme.colors.mutedForeground
                }
              >{`${item.icon} `}</text>
            )}
            <text fg={labelColor}>
              {isActive || isFocused ? <b>{item.label}</b> : item.label}
            </text>
            {item.badge !== undefined && (
              <box marginLeft={1}>
                <text fg={theme.colors.primary}>{item.badge}</text>
              </box>
            )}
          </box>
        );
      })}
    </box>
  );
};
