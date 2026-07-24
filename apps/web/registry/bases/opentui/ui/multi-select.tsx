/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface MultiSelectOption<T = string> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface MultiSelectProps<T = string> {
  options: MultiSelectOption<T>[];
  value?: T[];
  onChange?: (values: T[]) => void;
  onSubmit?: (values: T[]) => void;
  cursor?: string;
  checkmark?: string;
  height?: number;
}

export const MultiSelect = <T = string,>({
  options,
  value: controlledValue,
  onChange,
  onSubmit,
  cursor = "›",
  checkmark = "◉",
  height,
}: MultiSelectProps<T>) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [internalSelected, setInternalSelected] = useState<T[]>([]);

  const selected = controlledValue ?? internalSelected;

  const scrollOffset = (() => {
    if (!height) {
      return 0;
    }
    const half = Math.floor(height / 2);
    const maxOffset = options.length - height;
    const offset = activeIndex - half;
    if (offset < 0) {
      return 0;
    }
    if (offset > maxOffset) {
      return Math.max(0, maxOffset);
    }
    return offset;
  })();

  const visibleOptions = height
    ? options.slice(scrollOffset, scrollOffset + height)
    : options;

  useKeyboard((key) => {
    if (key.name === "up") {
      setActiveIndex((i) => {
        let next = i - 1;
        while (next >= 0 && options[next]?.disabled) {
          next -= 1;
        }
        return next < 0 ? i : next;
      });
    } else if (key.name === "down") {
      setActiveIndex((i) => {
        let next = i + 1;
        while (next < options.length && options[next]?.disabled) {
          next += 1;
        }
        return next >= options.length ? i : next;
      });
    } else if (key.name === " ") {
      const opt = options[activeIndex];
      if (!opt || opt.disabled) {
        return;
      }
      const isSelected = selected.includes(opt.value);
      const next = isSelected
        ? selected.filter((v) => v !== opt.value)
        : [...selected, opt.value];
      if (controlledValue === undefined) {
        setInternalSelected(next);
      }
      onChange?.(next);
    } else if (key.name === "return") {
      onSubmit?.(selected);
    }
  });

  return (
    <box flexDirection="column">
      {visibleOptions.map((opt, visibleIdx) => {
        const idx = scrollOffset + visibleIdx;
        const isActive = idx === activeIndex;
        const isSelected = selected.includes(opt.value);
        const icon = isSelected ? checkmark : "○";
        let iconColor: string;
        if (opt.disabled) {
          iconColor = theme.colors.mutedForeground;
        } else if (isSelected) {
          iconColor = theme.colors.primary;
        } else {
          iconColor = theme.colors.foreground;
        }
        let labelColor: string;
        if (opt.disabled) {
          labelColor = theme.colors.mutedForeground;
        } else if (isActive) {
          labelColor = theme.colors.primary;
        } else {
          labelColor = theme.colors.foreground;
        }
        return (
          <box key={idx} gap={1}>
            <text fg={isActive ? theme.colors.primary : undefined}>
              {isActive ? cursor : " "}
            </text>
            <text fg={opt.disabled ? "#666" : iconColor}>{icon}</text>
            <text fg={opt.disabled ? "#666" : labelColor}>
              {isActive ? <b>{opt.label}</b> : opt.label}
            </text>
            {opt.hint && <text fg="#666">{opt.hint}</text>}
          </box>
        );
      })}
    </box>
  );
};
