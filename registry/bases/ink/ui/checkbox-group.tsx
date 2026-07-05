import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export interface CheckboxGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  label?: string;
  options: CheckboxGroupOption[];
  value?: string[];
  onChange?: (values: string[]) => void;
  min?: number;
  max?: number;
}

export const CheckboxGroup = ({
  label,
  options,
  value: controlledValue,
  onChange,
  min,
  max,
}: CheckboxGroupProps) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>();

  const selected = controlledValue ?? internalSelected;

  const validateAndUpdate = (next: string[]) => {
    if (min !== undefined && next.length < min) {
      setError(`Select at least ${min} option${min === 1 ? "" : "s"}.`);
    } else if (max !== undefined && next.length > max) {
      setError(`Select at most ${max} option${max === 1 ? "" : "s"}.`);
      return;
    } else {
      setError(undefined);
    }
    if (controlledValue === undefined) {
      setInternalSelected(next);
    }
    onChange?.(next);
  };

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
      validateAndUpdate(next);
    }
  });

  return (
    <Box flexDirection="column">
      {label && (
        <Text bold color={theme.colors.foreground}>
          {label}
        </Text>
      )}
      {options.map((opt, idx) => {
        const isActive = idx === activeIndex;
        const isSelected = selected.includes(opt.value);
        const icon = isSelected ? "◉" : "○";

        let iconColor: string;
        if (opt.disabled) {
          iconColor = theme.colors.mutedForeground;
        } else if (isSelected) {
          iconColor = theme.colors.primary;
        } else {
          iconColor = theme.colors.foreground;
        }

        let optLabelColor: string;
        if (opt.disabled) {
          optLabelColor = theme.colors.mutedForeground;
        } else if (isActive) {
          optLabelColor = theme.colors.primary;
        } else {
          optLabelColor = theme.colors.foreground;
        }

        return (
          <Box key={idx} gap={1}>
            <Text color={isActive ? theme.colors.primary : undefined}>
              {isActive ? "›" : " "}
            </Text>
            <Text color={iconColor} dimColor={opt.disabled}>
              {icon}
            </Text>
            <Text color={optLabelColor} bold={isActive} dimColor={opt.disabled}>
              {opt.label}
            </Text>
          </Box>
        );
      })}
      {error && <Text color={theme.colors.error}>{error}</Text>}
    </Box>
  );
};
