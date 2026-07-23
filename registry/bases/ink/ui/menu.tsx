import { Box, Text } from "ink";
import React, { useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  children?: MenuItem[];
}

export interface MenuProps {
  items: MenuItem[];
  onSelect?: (item: MenuItem) => void;
  title?: string;
  id?: string;
  autoFocus?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}

export const Menu = ({
  items,
  onSelect,
  title,
  id,
  autoFocus = false,
  isActive = true,
  disabled = false,
  "aria-label": ariaLabel,
}: MenuProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const [focusIndex, setFocusIndex] = useState(0);
  const [submenuStack, setSubmenuStack] = useState<MenuItem[][]>([]);

  const activeItems = submenuStack.at(-1) ?? items;

  const selectableIndices = activeItems
    .map((item, idx) => ({ idx, item }))
    .filter(({ item }) => !item.separator && !item.disabled)
    .map(({ idx }) => idx);

  const moveFocus = (direction: 1 | -1) => {
    const currentPos = selectableIndices.indexOf(focusIndex);
    const nextPos = currentPos + direction;
    if (nextPos >= 0 && nextPos < selectableIndices.length) {
      setFocusIndex(selectableIndices[nextPos]);
    }
  };

  const openSubmenu = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      const { children } = item;
      setSubmenuStack((prev) => [...prev, children]);
      setFocusIndex(0);
    }
  };

  const closeSubmenu = () => {
    if (submenuStack.length > 0) {
      setSubmenuStack((prev) => prev.slice(0, -1));
      setFocusIndex(0);
    }
  };

  const activateItem = (item: MenuItem) => {
    if (item.disabled || item.separator) {
      return;
    }
    if (item.children && item.children.length > 0) {
      openSubmenu(item);
    } else {
      onSelect?.(item);
    }
  };

  const { isFocused: isMenuFocused } = useInteraction(
    (_input, key) => {
      if (key.upArrow) {
        moveFocus(-1);
      } else if (key.downArrow) {
        moveFocus(1);
      } else if (key.return) {
        const item = activeItems[focusIndex];
        if (item) {
          activateItem(item);
        }
      } else if (key.rightArrow) {
        const item = activeItems[focusIndex];
        if (item?.children && item.children.length > 0) {
          openSubmenu(item);
        }
      } else if (key.leftArrow) {
        closeSubmenu();
      } else if (key.escape) {
        closeSubmenu();
      } else if (key.home) {
        setFocusIndex(selectableIndices[0] ?? 0);
      } else if (key.end) {
        setFocusIndex(selectableIndices.at(-1) ?? 0);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const depth = submenuStack.length;

  return (
    <Box
      aria-role="menu"
      aria-state={{ disabled }}
      flexDirection="column"
      borderStyle={resolveBorderStyle("single", unicode)}
      borderColor={theme.colors.border}
      paddingX={1}
      paddingY={0}
      marginLeft={depth * 2}
    >
      {(title || ariaLabel) && (
        <Box marginBottom={1}>
          <Text
            aria-label={ariaLabel ?? title}
            bold
            color={theme.colors.primary}
          >
            {title ?? ""}
          </Text>
        </Box>
      )}
      {activeItems.map((item, idx) => {
        if (item.separator) {
          return (
            <Box key={item.key} aria-hidden>
              <Text color={theme.colors.mutedForeground}>
                {(unicode ? "─" : "-").repeat(20)}
              </Text>
            </Box>
          );
        }

        const isFocused = isMenuFocused && idx === focusIndex;

        let labelColor: string;
        if (item.disabled) {
          labelColor = theme.colors.mutedForeground;
        } else if (isFocused) {
          labelColor = theme.colors.primary;
        } else {
          labelColor = theme.colors.foreground;
        }

        return (
          <Box
            key={item.key}
            aria-label={
              item.shortcut ? `${item.label}, ${item.shortcut}` : item.label
            }
            aria-role="menuitem"
            aria-state={{
              disabled: disabled || item.disabled,
              expanded:
                item.children && item.children.length > 0
                  ? submenuStack.at(-1) === item.children
                  : undefined,
              selected: isFocused,
            }}
            justifyContent="space-between"
          >
            <Box aria-hidden flexDirection="row" gap={1}>
              <Text color={isFocused ? theme.colors.primary : "transparent"}>
                {isFocused ? (unicode ? "›" : ">") : " "}
              </Text>
              {item.icon && (
                <Text
                  color={
                    item.disabled
                      ? theme.colors.mutedForeground
                      : theme.colors.foreground
                  }
                >
                  {item.icon}
                </Text>
              )}
              <Text
                color={labelColor}
                bold={isFocused && !item.disabled}
                dimColor={item.disabled}
              >
                {item.label}
              </Text>
              {item.children && item.children.length > 0 && (
                <Text color={theme.colors.mutedForeground}>
                  {unicode ? "›" : ">"}
                </Text>
              )}
            </Box>
            {item.shortcut && (
              <Text aria-hidden color={theme.colors.mutedForeground}>
                {item.shortcut}
              </Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
