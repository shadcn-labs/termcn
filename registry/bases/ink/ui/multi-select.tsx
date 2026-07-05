import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

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

  useInput((input, key) => {
    if (key.upArrow) {
      setActiveIndex((i) => {
        let next = i - 1;
        while (next >= 0 && options[next]?.disabled) {
          next -= 1;
        }
        return next < 0 ? i : next;
      });
    } else if (key.downArrow) {
      setActiveIndex((i) => {
        let next = i + 1;
        while (next < options.length && options[next]?.disabled) {
          next += 1;
        }
        return next >= options.length ? i : next;
      });
    } else if (input === " ") {
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
    } else if (key.return) {
      onSubmit?.(selected);
    }
  });

  return (
    <Box flexDirection="column">
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
          <Box key={idx} gap={1}>
            <Text color={isActive ? theme.colors.primary : undefined}>
              {isActive ? cursor : " "}
            </Text>
            <Text color={iconColor} dimColor={opt.disabled}>
              {icon}
            </Text>
            <Text color={labelColor} bold={isActive} dimColor={opt.disabled}>
              {opt.label}
            </Text>
            {opt.hint && (
              <Text color={theme.colors.mutedForeground} dimColor>
                {opt.hint}
              </Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
