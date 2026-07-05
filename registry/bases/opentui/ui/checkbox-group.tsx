/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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
      validateAndUpdate(next);
    }
  });

  return (
    <box flexDirection="column">
      {label && (
        <text fg={theme.colors.foreground}>
          <b>{label}</b>
        </text>
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
          <box key={idx} gap={1}>
            <text fg={isActive ? theme.colors.primary : undefined}>
              {isActive ? "›" : " "}
            </text>
            <text fg={opt.disabled ? "#666" : iconColor}>{icon}</text>
            <text fg={opt.disabled ? "#666" : optLabelColor}>
              {isActive ? <b>{opt.label}</b> : opt.label}
            </text>
          </box>
        );
      })}
      {error && <text fg={theme.colors.error}>{error}</text>}
    </box>
  );
};
