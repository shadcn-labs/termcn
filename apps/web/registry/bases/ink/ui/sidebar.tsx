import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

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
): { item: SidebarItem; depth: number }[] => {
  const result: { item: SidebarItem; depth: number }[] = [];
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

  useInput((_input, key) => {
    if (key.upArrow) {
      setFocusIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setFocusIndex((prev) => Math.min(flatItems.length - 1, prev + 1));
    } else if (key.return) {
      const entry = flatItems[focusIndex];
      if (!entry) {
        return;
      }
      if (entry.item.children && entry.item.children.length > 0) {
        toggleExpand(entry.item.key);
      } else {
        onSelect?.(entry.item.key);
      }
    } else if (key.rightArrow) {
      const entry = flatItems[focusIndex];
      if (entry?.item.children && entry.item.children.length > 0) {
        setExpandedKeys((prev) => new Set([...prev, entry.item.key]));
      }
    } else if (key.leftArrow) {
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
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={theme.colors.border}
      width={effectiveWidth}
      paddingX={0}
      paddingY={0}
    >
      {title && !collapsed && (
        <Box paddingX={1} marginBottom={1}>
          <Text bold color={theme.colors.primary}>
            {title}
          </Text>
        </Box>
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
            <Box key={item.key} paddingX={0}>
              <Text color={collapsedColor} bold={isActive}>
                {item.icon ?? item.label.charAt(0)}
              </Text>
            </Box>
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
          <Box key={item.key} flexDirection="row" alignItems="center">
            <Text color={isActive ? theme.colors.primary : "transparent"}>
              {isActive ? "▌" : " "}
            </Text>
            {indent > 0 && <Text>{" ".repeat(indent)}</Text>}
            {hasChildren ? (
              <Text color={theme.colors.mutedForeground}>
                {isExpanded ? "▾ " : "▸ "}
              </Text>
            ) : (
              <Text>{"  "}</Text>
            )}
            {item.icon && (
              <Text
                color={
                  isActive ? theme.colors.primary : theme.colors.mutedForeground
                }
              >
                {item.icon}{" "}
              </Text>
            )}
            <Text color={labelColor} bold={isActive || isFocused}>
              {item.label}
            </Text>
            {item.badge !== undefined && (
              <Box marginLeft={1}>
                <Text color={theme.colors.primary}>{item.badge}</Text>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
