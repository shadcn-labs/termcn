/* @jsxImportSource @opentui/react */
import { useRef, useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useInteraction } from "@/registry/bases/opentui/hooks/use-interaction";
import type {
  InteractionProps,
  PressDetails,
} from "@/registry/bases/opentui/hooks/use-interaction";

export interface RadioOption<T = string> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface RadioGroupChangeDetails {
  readonly reason: "activation" | "navigation";
  readonly source: PressDetails["source"];
}

export interface RadioGroupProps<T = string> extends InteractionProps {
  options: RadioOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  onValueChange?: (value: T, details: RadioGroupChangeDetails) => void;
  name?: string;
  cursor?: string;
  loopFocus?: boolean;
}

const getOptionColor = (
  disabled: boolean | undefined,
  isHighlighted: boolean,
  theme: ReturnType<typeof useTheme>
): string => {
  if (disabled) {
    return theme.colors.mutedForeground;
  }
  if (isHighlighted) {
    return theme.colors.primary;
  }
  return theme.colors.foreground;
};

export const RadioGroup = <T = string,>({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  onValueChange,
  name,
  cursor = "›",
  loopFocus = true,
  autoFocus = false,
  disabled = false,
  id,
  isActive = true,
}: RadioGroupProps<T>) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(() => {
    const initialValue = controlledValue ?? defaultValue;
    if (initialValue === undefined) {
      return Math.max(
        0,
        options.findIndex((option) => !option.disabled)
      );
    }
    const idx = options.findIndex((o) => o.value === initialValue);
    return Math.max(idx, 0);
  });
  const [internalValue, setInternalValue] = useState<T | undefined>(
    defaultValue
  );
  const pointerIndexRef = useRef<number | null>(null);

  const selected = controlledValue ?? internalValue;

  const select = (idx: number, details: RadioGroupChangeDetails) => {
    if (disabled) {
      return;
    }
    const opt = options[idx];
    if (!opt || opt.disabled) {
      return;
    }
    if (selected !== undefined && Object.is(opt.value, selected)) {
      return;
    }
    if (controlledValue === undefined) {
      setInternalValue(opt.value);
    }
    if (onValueChange) {
      onValueChange(opt.value, details);
    } else {
      onChange?.(opt.value);
    }
  };

  const move = (direction: -1 | 1): number | undefined => {
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
        return nextIndex;
      }
    }
  };

  const navigateTo = (index: number) => {
    setActiveIndex(index);
    select(index, Object.freeze({ reason: "navigation", source: "keyboard" }));
  };

  const interaction = useInteraction({
    autoFocus,
    disabled,
    id: id ?? name,
    isActive,
    onInput: (key) => {
      if (key.name === "up" || key.name === "left") {
        const next = move(-1);
        if (next !== undefined) {
          select(
            next,
            Object.freeze({ reason: "navigation", source: "keyboard" })
          );
        }
      } else if (key.name === "down" || key.name === "right") {
        const next = move(1);
        if (next !== undefined) {
          select(
            next,
            Object.freeze({ reason: "navigation", source: "keyboard" })
          );
        }
      } else if (key.name === "home") {
        const first = options.findIndex((option) => !option.disabled);
        if (first !== -1) {
          navigateTo(first);
        }
      } else if (key.name === "end") {
        const last = options.findLastIndex((option) => !option.disabled);
        if (last !== -1) {
          navigateTo(last);
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
      select(
        targetIndex,
        Object.freeze({
          reason: "activation",
          source: details.source,
        })
      );
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
      {options.map((opt, idx) => {
        const isActiveOption = idx === activeIndex;
        const isSelected = selected !== undefined && opt.value === selected;
        const icon = isSelected ? "◉" : "○";
        return (
          <box
            key={idx}
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
              {isActiveOption && isFocused ? cursor : " "}
            </text>
            <text
              fg={
                opt.disabled || disabled
                  ? theme.colors.mutedForeground
                  : getOptionColor(opt.disabled, isSelected, theme)
              }
            >
              {icon}
            </text>
            <text
              fg={
                opt.disabled || disabled
                  ? theme.colors.mutedForeground
                  : getOptionColor(
                      opt.disabled,
                      isActiveOption && isFocused,
                      theme
                    )
              }
            >
              {(isActiveOption && isFocused) || isSelected ? (
                <b>{opt.label}</b>
              ) : (
                opt.label
              )}
            </text>
            {opt.hint && (
              <text fg={theme.colors.mutedForeground}>{opt.hint}</text>
            )}
          </box>
        );
      })}
    </box>
  );
};
