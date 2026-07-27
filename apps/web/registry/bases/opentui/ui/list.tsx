/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState, useMemo } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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

  useKeyboard((key) => {
    if (key.name === "up") {
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (key.name === "down") {
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (key.name === "return") {
      const item = filtered[activeIndex];
      if (item) {
        onSelect?.(item);
      }
    } else if (filterable && key.name === "backspace") {
      setFilter((f) => f.slice(0, -1));
    } else if (
      filterable &&
      key.name !== "escape" &&
      key.name !== "return" &&
      key.name !== "up" &&
      key.name !== "down" &&
      key.name.length === 1
    ) {
      setFilter((f) => f + key.name);
    }
  });

  const visible = filtered.slice(0, height);

  return (
    <box flexDirection="column">
      {filterable ? (
        <box
          borderStyle="rounded"
          borderColor={theme.colors.border}
          paddingLeft={1}
          paddingRight={1}
          marginBottom={1}
        >
          <text fg={filter ? undefined : "#666"}>
            {filter || "Type to filter…"}
          </text>
        </box>
      ) : null}
      {visible.map((item, idx) => {
        const isActive = idx === activeIndex;
        const labelEl = isActive ? (
          <text fg={item.color ?? theme.colors.primary}>
            <b>{item.label}</b>
          </text>
        ) : (
          <text fg={item.color ?? theme.colors.foreground}>{item.label}</text>
        );
        return (
          <box key={item.key} gap={1}>
            <text fg={isActive ? theme.colors.primary : undefined}>
              {isActive ? cursor : " "}
            </text>
            {labelEl}
            {item.description ? (
              <text fg="#666">{item.description}</text>
            ) : null}
          </box>
        );
      })}
      {filtered.length > height ? (
        <text fg="#666">{`${filtered.length - height} more…`}</text>
      ) : null}
    </box>
  );
};
