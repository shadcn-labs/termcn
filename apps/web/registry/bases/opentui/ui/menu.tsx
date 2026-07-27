/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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
}

export const Menu = ({ items, onSelect, title }: MenuProps) => {
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

  useKeyboard((key) => {
    if (key.name === "up") {
      moveFocus(-1);
    } else if (key.name === "down") {
      moveFocus(1);
    } else if (key.name === "return") {
      const item = activeItems[focusIndex];
      if (item) {
        activateItem(item);
      }
    } else if (key.name === "right") {
      const item = activeItems[focusIndex];
      if (item?.children && item.children.length > 0) {
        openSubmenu(item);
      }
    } else if (key.name === "left") {
      closeSubmenu();
    } else if (key.name === "escape") {
      closeSubmenu();
    }
  });

  const depth = submenuStack.length;

  return (
    <box
      flexDirection="column"
      borderStyle="single"
      borderColor={theme.colors.border}
      paddingLeft={1}
      paddingRight={1}
      paddingTop={0}
      paddingBottom={0}
      marginLeft={depth * 2}
    >
      {title && (
        <box marginBottom={1}>
          <text fg={theme.colors.primary}>
            <b>{title}</b>
          </text>
        </box>
      )}
      {activeItems.map((item, idx) => {
        if (item.separator) {
          return (
            <box key={item.key}>
              <text fg={theme.colors.mutedForeground}>{"─".repeat(20)}</text>
            </box>
          );
        }
        const isFocused = idx === focusIndex;
        let labelColor: string;
        if (item.disabled) {
          labelColor = theme.colors.mutedForeground;
        } else if (isFocused) {
          labelColor = theme.colors.primary;
        } else {
          labelColor = theme.colors.foreground;
        }
        return (
          <box key={item.key} justifyContent="space-between">
            <box flexDirection="row" gap={1}>
              <text fg={isFocused ? theme.colors.primary : "transparent"}>
                {isFocused ? "›" : " "}
              </text>
              {item.icon && (
                <text
                  fg={
                    item.disabled
                      ? theme.colors.mutedForeground
                      : theme.colors.foreground
                  }
                >
                  {item.icon}
                </text>
              )}
              <text fg={labelColor}>
                {isFocused && !item.disabled ? <b>{item.label}</b> : item.label}
              </text>
              {item.children && item.children.length > 0 && (
                <text fg={theme.colors.mutedForeground}>›</text>
              )}
            </box>
            {item.shortcut && (
              <text fg={theme.colors.mutedForeground}>{item.shortcut}</text>
            )}
          </box>
        );
      })}
    </box>
  );
};
