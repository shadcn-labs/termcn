import { Box, Text } from "ink";
import React, { useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveTerminalSymbol } from "@/registry/bases/ink/lib/accessibility";

export interface CheckboxGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  label?: string;
  options: CheckboxGroupOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (values: string[]) => void;
  onChange?: (values: string[]) => void;
  min?: number;
  max?: number;
  id?: string;
  autoFocus?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}

export const CheckboxGroup = ({
  label,
  options,
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  onChange,
  min,
  max,
  id,
  autoFocus = false,
  isActive = true,
  disabled = false,
  "aria-label": ariaLabel,
}: CheckboxGroupProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const [activeIndex, setActiveIndex] = useState(0);
  const [internalSelected, setInternalSelected] =
    useState<string[]>(defaultValue);
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
    (onValueChange ?? onChange)?.(next);
  };

  const { isFocused } = useInteraction(
    (input, key) => {
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
      } else if (key.home) {
        const firstEnabled = options.findIndex((option) => !option.disabled);
        if (firstEnabled !== -1) {
          setActiveIndex(firstEnabled);
        }
      } else if (key.end) {
        const lastEnabled = options.findLastIndex((option) => !option.disabled);
        if (lastEnabled !== -1) {
          setActiveIndex(lastEnabled);
        }
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
    },
    { autoFocus, disabled, id, isActive }
  );

  return (
    <Box
      aria-role="listbox"
      aria-state={{ disabled, multiselectable: true }}
      flexDirection="column"
    >
      <Text
        aria-label={ariaLabel ?? label ?? "Checkbox group"}
        bold={Boolean(label)}
        color={theme.colors.foreground}
      >
        {label ?? ""}
      </Text>
      {options.map((opt, idx) => {
        const isActive = idx === activeIndex;
        const isSelected = selected.includes(opt.value);
        const icon = isSelected
          ? resolveTerminalSymbol(unicode, "◉", "[x]")
          : resolveTerminalSymbol(unicode, "○", "[ ]");

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
          <Box
            key={idx}
            aria-label={opt.label}
            aria-role="option"
            aria-state={{
              disabled: disabled || opt.disabled,
              selected: isSelected,
            }}
            gap={1}
          >
            <Text
              aria-hidden
              color={isActive ? theme.colors.primary : undefined}
            >
              {isFocused && isActive
                ? resolveTerminalSymbol(unicode, "›", ">")
                : " "}
            </Text>
            <Text aria-hidden color={iconColor} dimColor={opt.disabled}>
              {icon}
            </Text>
            <Text
              aria-hidden
              color={optLabelColor}
              bold={isFocused && isActive}
              dimColor={opt.disabled}
            >
              {opt.label}
            </Text>
          </Box>
        );
      })}
      {error && <Text color={theme.colors.error}>{error}</Text>}
    </Box>
  );
};
