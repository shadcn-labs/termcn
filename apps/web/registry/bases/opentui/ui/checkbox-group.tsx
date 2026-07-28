/* @jsxImportSource @opentui/react */
import { useRef, useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useInteraction } from "@/registry/bases/opentui/hooks/use-interaction";
import type {
  InteractionProps,
  PressDetails,
} from "@/registry/bases/opentui/hooks/use-interaction";

export interface CheckboxGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps extends InteractionProps {
  label?: string;
  options: CheckboxGroupOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  onValueChange?: (values: string[], details: PressDetails) => void;
  min?: number;
  max?: number;
  loopFocus?: boolean;
  orientation?: "horizontal" | "vertical";
}

export const CheckboxGroup = ({
  label,
  options,
  value: controlledValue,
  defaultValue = [],
  onChange,
  onValueChange,
  min,
  max,
  loopFocus = true,
  orientation = "vertical",
  autoFocus = false,
  disabled = false,
  id,
  isActive = true,
}: CheckboxGroupProps) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      options.findIndex((option) => !option.disabled)
    )
  );
  const [internalSelected, setInternalSelected] =
    useState<string[]>(defaultValue);
  const [error, setError] = useState<string | undefined>();
  const pointerIndexRef = useRef<number | null>(null);

  const selected = controlledValue ?? internalSelected;

  const validateAndUpdate = (next: string[], details: PressDetails) => {
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
    if (onValueChange) {
      onValueChange(next, details);
    } else {
      onChange?.(next);
    }
  };

  const move = (direction: -1 | 1) => {
    if (options.length === 0) {
      return;
    }
    let nextIndex = activeIndex;
    for (const _option of options) {
      const candidate = nextIndex + direction;
      if (!loopFocus && (candidate < 0 || candidate >= options.length)) {
        return;
      }
      nextIndex = (candidate + options.length) % options.length;
      if (!options[nextIndex]?.disabled) {
        setActiveIndex(nextIndex);
        return;
      }
    }
  };

  const toggle = (index: number, details: PressDetails) => {
    if (disabled) {
      return;
    }
    const opt = options[index];
    if (!opt || opt.disabled) {
      return;
    }
    const isSelected = selected.includes(opt.value);
    const next = isSelected
      ? selected.filter((v) => v !== opt.value)
      : [...selected, opt.value];
    validateAndUpdate(next, details);
  };

  const interaction = useInteraction({
    autoFocus,
    disabled,
    id,
    isActive,
    onInput: (key) => {
      const previousKey = orientation === "horizontal" ? "left" : "up";
      const nextKey = orientation === "horizontal" ? "right" : "down";
      if (key.name === previousKey) {
        move(-1);
      } else if (key.name === nextKey) {
        move(1);
      } else if (key.name === "home") {
        const first = options.findIndex((option) => !option.disabled);
        if (first !== -1) {
          setActiveIndex(first);
        }
      } else if (key.name === "end") {
        const last = options.findLastIndex((option) => !option.disabled);
        if (last !== -1) {
          setActiveIndex(last);
        }
      }
    },
    onPress: (details) => {
      const targetIndex =
        details.source === "pointer" ? pointerIndexRef.current : activeIndex;
      pointerIndexRef.current = null;
      if (targetIndex === null) {
        return;
      }
      setActiveIndex(targetIndex);
      toggle(targetIndex, details);
    },
  });
  const { onMouseOut, ...interactionProps } = interaction.interactionProps;
  const { isFocused } = interaction;

  return (
    <box
      {...interactionProps}
      flexDirection="column"
      onMouseOut={() => {
        pointerIndexRef.current = null;
        onMouseOut();
      }}
    >
      {label && (
        <text fg={theme.colors.foreground}>
          <b>{label}</b>
        </text>
      )}
      <box
        flexDirection={orientation === "horizontal" ? "row" : "column"}
        gap={orientation === "horizontal" ? 2 : 0}
      >
        {options.map((opt, idx) => {
          const isActiveOption = idx === activeIndex;
          const isSelected = selected.includes(opt.value);
          const icon = isSelected ? "◉" : "○";
          let iconColor: string;
          if (opt.disabled || disabled) {
            iconColor = theme.colors.mutedForeground;
          } else if (isSelected) {
            iconColor = theme.colors.primary;
          } else {
            iconColor = theme.colors.foreground;
          }
          let optLabelColor: string;
          if (opt.disabled || disabled) {
            optLabelColor = theme.colors.mutedForeground;
          } else if (isActiveOption && isFocused) {
            optLabelColor = theme.colors.primary;
          } else {
            optLabelColor = theme.colors.foreground;
          }
          return (
            <box
              key={opt.value}
              gap={1}
              onMouseDown={(event) => {
                pointerIndexRef.current =
                  event.defaultPrevented ||
                  (event.button !== undefined && event.button !== 0) ||
                  opt.disabled ||
                  disabled
                    ? null
                    : idx;
              }}
            >
              <text
                fg={
                  isActiveOption && isFocused ? theme.colors.primary : undefined
                }
              >
                {isActiveOption && isFocused ? "›" : " "}
              </text>
              <text fg={iconColor}>{icon}</text>
              <text fg={optLabelColor}>
                {isActiveOption && isFocused ? <b>{opt.label}</b> : opt.label}
              </text>
            </box>
          );
        })}
      </box>
      {error && <text fg={theme.colors.error}>{error}</text>}
    </box>
  );
};
