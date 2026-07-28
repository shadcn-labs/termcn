/* @jsxImportSource @opentui/react */
import { useEffect, useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useInteraction } from "@/registry/bases/opentui/hooks/use-interaction";
import type {
  InteractionProps,
  KeyEvent,
  PasteEventLike,
} from "@/registry/bases/opentui/hooks/use-interaction";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

export type NumberInputChangeReason =
  | "input"
  | "input-clear"
  | "input-commit"
  | "keyboard";

export interface NumberInputChangeDetails {
  readonly key?:
    | "down"
    | "end"
    | "enter"
    | "home"
    | "pagedown"
    | "pageup"
    | "up";
  readonly reason: NumberInputChangeReason;
  readonly source: "input" | "keyboard";
}

export interface NumberInputProps extends InteractionProps {
  borderStyle?: BorderStyle;
  cursor?: string;
  defaultValue?: number | null;
  format?: (value: number) => string;
  label?: string;
  largeStep?: number;
  max?: number;
  min?: number;
  onChange?: (value: number) => void;
  onSubmit?: (value: number) => void;
  onValueChange?: (
    value: number | null,
    details: NumberInputChangeDetails
  ) => void;
  onValueCommit?: (
    value: number | null,
    details: NumberInputChangeDetails
  ) => void;
  paddingX?: number;
  placeholder?: string;
  readOnly?: boolean;
  smallStep?: number;
  step?: number;
  stepHint?: string;
  value?: number | null;
}

const assertPositiveStep = (name: string, value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`NumberInput ${name} must be a positive finite number`);
  }
};

const decimalPlaces = (value: number): number => {
  const text = value.toString().toLowerCase();
  const [coefficient = text, exponent = "0"] = text.split("e");
  const fractionLength = coefficient.split(".")[1]?.length ?? 0;
  return Math.max(0, fractionLength - Number(exponent));
};

const addDecimal = (value: number, delta: number): number => {
  const precision = Math.max(decimalPlaces(value), decimalPlaces(delta));
  return Number((value + delta).toFixed(Math.min(precision, 15)));
};

const isNumericDraft = (value: string): boolean => /^-?\d*\.?\d*$/.test(value);

const parseCompleteNumber = (value: string): number | undefined => {
  if (value === "" || value === "-" || value === "." || value === "-.") {
    return;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const decodePaste = (event: PasteEventLike): string =>
  new TextDecoder().decode(event.bytes).trim();

export const NumberInput = ({
  autoFocus = false,
  borderStyle = "rounded",
  cursor = "█",
  defaultValue = null,
  disabled = false,
  format,
  id,
  isActive = true,
  label,
  largeStep = 10,
  max,
  min,
  onChange,
  onSubmit,
  onValueChange,
  onValueCommit,
  paddingX = 1,
  placeholder = "",
  readOnly = false,
  smallStep = 0.1,
  step = 1,
  stepHint,
  value: controlledValue,
}: NumberInputProps) => {
  assertPositiveStep("step", step);
  assertPositiveStep("smallStep", smallStep);
  assertPositiveStep("largeStep", largeStep);
  if (min !== undefined && max !== undefined && min > max) {
    throw new Error("NumberInput min cannot exceed max");
  }

  const [internalValue, setInternalValue] = useState<number | null>(
    defaultValue
  );
  const [buffer, setBuffer] = useState(
    defaultValue === null ? "" : String(defaultValue)
  );
  const [dirty, setDirty] = useState(false);
  const theme = useTheme();
  const value = controlledValue === undefined ? internalValue : controlledValue;

  useEffect(() => {
    if (controlledValue !== undefined) {
      setBuffer(controlledValue === null ? "" : String(controlledValue));
      setDirty(false);
    }
  }, [controlledValue]);

  const clamp = (next: number): number => {
    let result = next;
    if (min !== undefined) {
      result = Math.max(min, result);
    }
    if (max !== undefined) {
      result = Math.min(max, result);
    }
    return result;
  };

  const requestValue = (
    next: number | null,
    details: NumberInputChangeDetails
  ) => {
    if (controlledValue === undefined) {
      setInternalValue(next);
    }
    if (onValueChange) {
      onValueChange(next, Object.freeze(details));
    } else if (next !== null) {
      onChange?.(next);
    }
  };

  const commit = (key?: NumberInputChangeDetails["key"]) => {
    const parsed = buffer === "" ? null : parseCompleteNumber(buffer);
    const next =
      parsed === undefined ? value : parsed === null ? null : clamp(parsed);
    const details = Object.freeze<NumberInputChangeDetails>({
      key,
      reason: "input-commit",
      source: "input",
    });
    if (!Object.is(next, value)) {
      requestValue(next, details);
    }
    setBuffer(next === null ? "" : String(next));
    setDirty(false);
    onValueCommit?.(next, details);
    if (next !== null && key === "enter") {
      onSubmit?.(next);
    }
  };

  const editBuffer = (nextBuffer: string) => {
    if (!isNumericDraft(nextBuffer)) {
      return;
    }
    setBuffer(nextBuffer);
    setDirty(true);
    if (nextBuffer === "") {
      if (value !== null) {
        requestValue(
          null,
          Object.freeze({ reason: "input-clear", source: "input" })
        );
      }
      return;
    }
    const parsed = parseCompleteNumber(nextBuffer);
    if (
      parsed !== undefined &&
      (min === undefined || parsed >= min) &&
      (max === undefined || parsed <= max) &&
      !Object.is(parsed, value)
    ) {
      requestValue(parsed, Object.freeze({ reason: "input", source: "input" }));
    }
  };

  const stepByKey = (key: KeyEvent): boolean => {
    let next: number;
    if (key.name === "home" && min !== undefined) {
      next = min;
    } else if (key.name === "end" && max !== undefined) {
      next = max;
    } else {
      const direction =
        key.name === "up" || key.name === "pageup"
          ? 1
          : key.name === "down" || key.name === "pagedown"
            ? -1
            : 0;
      if (direction === 0) {
        return false;
      }
      const amount =
        key.name === "pageup" || key.name === "pagedown" || key.shift
          ? largeStep
          : key.option
            ? smallStep
            : step;
      next = clamp(addDecimal(value ?? 0, direction * amount));
    }
    const keyName = key.name as NumberInputChangeDetails["key"];
    const details = Object.freeze<NumberInputChangeDetails>({
      key: keyName,
      reason: "keyboard",
      source: "keyboard",
    });
    if (!Object.is(next, value)) {
      requestValue(next, details);
    }
    setBuffer(String(next));
    setDirty(false);
    onValueCommit?.(next, details);
    return true;
  };

  const { interactionProps, isFocused } = useInteraction({
    autoFocus,
    disabled,
    id,
    isActive,
    onFocusChange: (focused) => {
      if (!focused && dirty && !readOnly && !disabled) {
        commit();
      }
    },
    onInput: (key) => {
      if (readOnly) {
        return;
      }
      if (stepByKey(key)) {
        return;
      }
      if (key.name === "return" || key.name === "enter") {
        commit("enter");
        return;
      }
      if (key.name === "backspace" || key.name === "delete") {
        editBuffer(buffer.slice(0, -1));
        return;
      }
      const nextCharacter =
        key.name.length === 1
          ? key.shift
            ? key.name.toUpperCase()
            : key.name
          : undefined;
      if (nextCharacter && /^[\d.-]$/.test(nextCharacter)) {
        editBuffer(buffer + nextCharacter);
      }
    },
    onPaste: (event) => {
      if (readOnly) {
        return;
      }
      const pasted = decodePaste(event);
      if (isNumericDraft(pasted)) {
        event.preventDefault?.();
        editBuffer(pasted);
      }
    },
  });

  const borderColor = disabled
    ? theme.colors.muted
    : isFocused
      ? theme.colors.focusRing
      : theme.colors.border;
  const textColor = disabled
    ? theme.colors.mutedForeground
    : theme.colors.foreground;

  let displayValue = "";
  if (isFocused) {
    displayValue = buffer;
  } else if (value !== null) {
    displayValue = format ? format(value) : String(value);
  }

  const resolvedStepHint = stepHint ?? `↑ +${step}  ↓ -${step}`;

  return (
    <box flexDirection="column">
      {label && (
        <text fg={disabled ? theme.colors.mutedForeground : undefined}>
          <b>{label}</b>
        </text>
      )}
      <box flexDirection="row" alignItems="center" gap={1}>
        <box
          {...interactionProps}
          borderStyle={borderStyle}
          borderColor={borderColor}
          paddingLeft={paddingX}
          paddingRight={paddingX}
        >
          <text fg={displayValue ? textColor : theme.colors.mutedForeground}>
            {displayValue || placeholder}
          </text>
          {isFocused && !disabled && (
            <text fg={theme.colors.focusRing}>{cursor}</text>
          )}
        </box>
        {isFocused && !disabled && (
          <text fg={theme.colors.mutedForeground}>{resolvedStepHint}</text>
        )}
      </box>
    </box>
  );
};
