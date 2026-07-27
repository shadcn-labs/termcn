import { Box, Text } from "ink";
import React, { useState, useMemo } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export interface ListItem {
  key: string;
  label: string;
  description?: string;
  color?: string;
}

export interface ListProps {
  items: ListItem[];
  onSelect?: (item: ListItem) => void;
  filterable?: boolean;
  height?: number;
  cursor?: string;
}

export const List = ({
  items,
  onSelect,
  filterable = false,
  height = 10,
  cursor = "›",
}: ListProps) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter) {
      return items;
    }
    const q = filter.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, filter]);

  useInput((input, key) => {
    if (key.upArrow) {
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (key.return) {
      const item = filtered[activeIndex];
      if (item) {
        onSelect?.(item);
      }
    } else if (filterable && key.backspace) {
      setFilter((f) => f.slice(0, -1));
    } else if (
      filterable &&
      !key.escape &&
      !key.return &&
      !key.upArrow &&
      !key.downArrow
    ) {
      setFilter((f) => f + input);
    }
  });

  const visible = filtered.slice(0, height);

  return (
    <Box flexDirection="column">
      {filterable && (
        <Box
          borderStyle="round"
          borderColor={theme.colors.border}
          paddingX={1}
          marginBottom={1}
        >
          <Text dimColor={!filter}>{filter || "Type to filter…"}</Text>
        </Box>
      )}
      {visible.map((item, idx) => {
        const isActive = idx === activeIndex;
        return (
          <Box key={item.key} gap={1}>
            <Text color={isActive ? theme.colors.primary : undefined}>
              {isActive ? cursor : " "}
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
          {filtered.length - height} more…
        </Text>
      )}
    </Box>
  );
};
