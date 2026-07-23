import { useIsScreenReaderEnabled, Box, Text } from "ink";
import React, { useEffect, useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

export interface SidebarItem {
  key: string;
  label: string;
  icon?: string;
  badge?: string | number;
  children?: SidebarItem[];
  disabled?: boolean;
}

export interface SidebarProps extends InteractionProps {
  items: SidebarItem[];
  activeKey?: string;
  onSelect?: (key: string) => void;
  collapsed?: boolean;
  width?: number;
  title?: string;
  "aria-label"?: string;
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
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = title ?? "Sidebar navigation",
}: SidebarProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
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

  const enabledIndices = flatItems
    .map(({ item }, index) => ({ index, item }))
    .filter(({ item }) => !item.disabled);
  const { isFocused: hasFocus } = useInteraction(
    (_input, key) => {
      const enabledIndex = enabledIndices.findIndex(
        ({ index }) => index === focusIndex
      );
      if (key.upArrow) {
        setFocusIndex(
          enabledIndices[Math.max(0, enabledIndex - 1)]?.index ?? 0
        );
      } else if (key.downArrow) {
        setFocusIndex(
          enabledIndices[Math.min(enabledIndices.length - 1, enabledIndex + 1)]
            ?.index ?? 0
        );
      } else if (key.home) {
        setFocusIndex(enabledIndices[0]?.index ?? 0);
      } else if (key.end) {
        setFocusIndex(enabledIndices.at(-1)?.index ?? 0);
      } else if (key.return) {
        const entry = flatItems[focusIndex];
        if (!entry || entry.item.disabled) {
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
    },
    { autoFocus, disabled, id, isActive }
  );

  useEffect(() => {
    if (!flatItems[focusIndex] || flatItems[focusIndex]?.item.disabled) {
      setFocusIndex(enabledIndices[0]?.index ?? 0);
    }
  }, [enabledIndices, flatItems, focusIndex]);

  return (
    <Box
      flexDirection="column"
      borderStyle={resolveBorderStyle(
        isScreenReaderEnabled ? undefined : "single",
        unicode
      )}
      borderColor={theme.colors.border}
      width={effectiveWidth}
      paddingX={0}
      paddingY={0}
      aria-role="list"
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text aria-label={ariaLabel}>{""}</Text>
      {title && !collapsed && (
        <Box paddingX={1} marginBottom={1}>
          <Text bold color={theme.colors.primary}>
            {title}
          </Text>
        </Box>
      )}
      {flatItems.map(({ item, depth }, idx) => {
        const isFocused = idx === focusIndex && hasFocus;
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
            <Box
              key={item.key}
              paddingX={0}
              aria-role="listitem"
              aria-label={`${item.label}${item.badge === undefined ? "" : `, badge ${item.badge}`}`}
              aria-state={{
                disabled: item.disabled || undefined,
                selected: isActive,
              }}
            >
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
          <Box
            key={item.key}
            flexDirection="row"
            alignItems="center"
            aria-role="listitem"
            aria-label={`${item.label}${item.badge === undefined ? "" : `, badge ${item.badge}`}`}
            aria-state={{
              disabled: item.disabled || undefined,
              expanded: hasChildren ? isExpanded : undefined,
              selected: isActive,
            }}
          >
            <Text color={isActive ? theme.colors.primary : "transparent"}>
              {isActive ? (unicode ? "▌" : "|") : " "}
            </Text>
            {indent > 0 && <Text>{" ".repeat(indent)}</Text>}
            {hasChildren ? (
              <Text color={theme.colors.mutedForeground}>
                {isExpanded ? (unicode ? "▾ " : "v ") : unicode ? "▸ " : "> "}
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
