import { Box, Text } from "ink";
import React, { useState, useMemo } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  resolveBorderStyle,
  resolveTerminalSymbol,
} from "@/registry/bases/ink/lib/accessibility";
import { removeGraphemeBefore } from "@/registry/bases/ink/lib/terminal-text";

export interface ListItem {
  key: string;
  label: string;
  description?: string;
  color?: string;
  disabled?: boolean;
}

export interface ListProps extends InteractionProps {
  items: ListItem[];
  onSelect?: (item: ListItem) => void;
  filterable?: boolean;
  height?: number;
  cursor?: string;
  "aria-label"?: string;
}

export const List = ({
  items,
  onSelect,
  filterable = false,
  height = 10,
  cursor,
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = "List",
}: ListProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const resolvedCursor = cursor ?? resolveTerminalSymbol(unicode, "›", ">");
  const [activeIndex, setActiveIndex] = useState(0);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter) {
      return items;
    }
    const q = filter.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, filter]);

  const { isFocused } = useInteraction(
    (input, key) => {
      const enabled = filtered
        .map((item, index) => ({ index, item }))
        .filter(({ item }) => !item.disabled);
      const currentEnabledIndex = enabled.findIndex(
        ({ index }) => index === activeIndex
      );
      if (key.upArrow) {
        setActiveIndex(
          enabled[Math.max(0, currentEnabledIndex - 1)]?.index ?? 0
        );
      } else if (key.downArrow) {
        setActiveIndex(
          enabled[Math.min(enabled.length - 1, currentEnabledIndex + 1)]
            ?.index ?? 0
        );
      } else if (key.home) {
        setActiveIndex(enabled[0]?.index ?? 0);
      } else if (key.end) {
        setActiveIndex(enabled.at(-1)?.index ?? 0);
      } else if (key.return) {
        const item = filtered[activeIndex];
        if (item && !item.disabled) {
          onSelect?.(item);
        }
      } else if (filterable && key.backspace) {
        setFilter(
          (f) => removeGraphemeBefore(f, Number.POSITIVE_INFINITY).value
        );
      } else if (
        filterable &&
        !key.escape &&
        !key.return &&
        !key.upArrow &&
        !key.downArrow
      ) {
        setFilter((f) => f + input);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const visible = filtered.slice(0, height);

  return (
    <Box
      flexDirection="column"
      aria-role="listbox"
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text aria-label={ariaLabel}>{""}</Text>
      {filterable && (
        <Box
          borderStyle={resolveBorderStyle("round", unicode)}
          borderColor={theme.colors.border}
          paddingX={1}
          marginBottom={1}
        >
          <Text dimColor={!filter}>
            {filter ||
              resolveTerminalSymbol(
                unicode,
                "Type to filter…",
                "Type to filter..."
              )}
          </Text>
        </Box>
      )}
      {visible.map((item, idx) => {
        const isActive = idx === activeIndex;
        return (
          <Box
            key={item.key}
            gap={1}
            aria-role="option"
            aria-label={`${item.label}${item.description ? `. ${item.description}` : ""}`}
            aria-state={{
              disabled: item.disabled || undefined,
              selected: isActive && isFocused,
            }}
          >
            <Text color={isActive ? theme.colors.primary : undefined}>
              {isActive && isFocused ? `[${resolvedCursor}]` : " "}
            </Text>
            <Text
              color={
                item.color ??
                (isActive ? theme.colors.primary : theme.colors.foreground)
              }
              bold={isActive}
            >
              {item.label}
            </Text>
            {item.description && (
              <Text color={theme.colors.mutedForeground} dimColor>
                {item.description}
              </Text>
            )}
          </Box>
        );
      })}
      {filtered.length > height && (
        <Text color={theme.colors.mutedForeground} dimColor>
          {filtered.length - height}{" "}
          {resolveTerminalSymbol(unicode, "more…", "more...")}
        </Text>
      )}
    </Box>
  );
};
