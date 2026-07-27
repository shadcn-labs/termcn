import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export interface SelectOption<T = string> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  options: SelectOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  onSubmit?: (value: T) => void;
  label?: string;
  cursor?: string;
  cursorColor?: string;
}

export const Select = <T = string,>({
  options,
  value: controlledValue,
  onChange,
  onSubmit,
  label,
  cursor = "›",
  cursorColor,
}: SelectProps<T>) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  const resolvedCursorColor = cursorColor ?? theme.colors.primary;

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
    } else if (key.return) {
      const opt = options[activeIndex];
      if (opt && !opt.disabled) {
        onChange?.(opt.value);
        onSubmit?.(opt.value);
      }
    }
  });

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      {options.map((opt, idx) => {
        const isActive = idx === activeIndex;
        const isSelected =
          controlledValue !== undefined && opt.value === controlledValue;

        let optColor: string;
        if (opt.disabled) {
          optColor = theme.colors.mutedForeground;
        } else if (isActive) {
          optColor = resolvedCursorColor;
        } else {
          optColor = theme.colors.foreground;
        }

        return (
          <Box key={idx} gap={1}>
            <Text color={isActive ? resolvedCursorColor : undefined}>
              {isActive ? cursor : " "}
            </Text>
            <Text
              color={optColor}
              bold={isActive || isSelected}
              dimColor={opt.disabled}
            >
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
