import { Box, Text } from "ink";
import React, { useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  resolveBorderStyle,
  resolveTerminalSymbol,
} from "@/registry/bases/ink/lib/accessibility";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface NumberInputProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onChange?: (value: number) => void;
  onSubmit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  label?: string;
  id?: string;
  format?: (n: number) => string;
  borderStyle?: BorderStyle;
  paddingX?: number;
  cursor?: string;
  stepHint?: string;
  autoFocus?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  "aria-label"?: string;
}

export const NumberInput = ({
  value: controlledValue,
  defaultValue,
  onValueChange,
  onChange,
  onSubmit,
  min,
  max,
  step = 1,
  placeholder = "",
  label,
  id,
  format,
  borderStyle = "round",
  paddingX = 1,
  cursor,
  stepHint,
  autoFocus = false,
  isActive = true,
  disabled = false,
  readOnly = false,
  required = false,
  "aria-label": ariaLabel,
}: NumberInputProps) => {
  const unicode = useUnicode();
  const resolvedCursor = cursor ?? resolveTerminalSymbol(unicode, "█", "|");
  const [internalValue, setInternalValue] = useState<number | undefined>(
    defaultValue
  );
  const [buffer, setBuffer] = useState<string>(
    defaultValue === undefined ? "" : String(defaultValue)
  );
  const theme = useTheme();

  const value = controlledValue ?? internalValue;

  const clamp = (n: number): number => {
    let result = n;
    if (min !== undefined) {
      result = Math.max(min, result);
    }
    if (max !== undefined) {
      result = Math.min(max, result);
    }
    return result;
  };

  const applyValue = (clamped: number) => {
    const changeHandler = onValueChange ?? onChange;
    if (changeHandler) {
      changeHandler(clamped);
    } else {
      setInternalValue(clamped);
    }
  };

  const commitValue = (n: number) => {
    const clamped = clamp(n);
    applyValue(clamped);
    setBuffer(String(clamped));
  };

  const { isFocused } = useInteraction(
    (input, key) => {
      if (readOnly && !key.return) {
        return;
      }
      if (key.upArrow) {
        const current = value ?? 0;
        commitValue(current + step);
        return;
      }

      if (key.downArrow) {
        const current = value ?? 0;
        commitValue(current - step);
        return;
      }

      if (key.return) {
        const parsed = buffer === "" ? value : Number.parseFloat(buffer);
        if (parsed !== undefined && !Number.isNaN(parsed)) {
          const clamped = clamp(parsed);
          onSubmit?.(clamped);
        }
        return;
      }

      if (key.backspace) {
        const newBuffer = buffer.slice(0, -1);
        setBuffer(newBuffer);
        if (newBuffer === "" || newBuffer === "-") {
          return;
        }
        const parsed = Number.parseFloat(newBuffer);
        if (!Number.isNaN(parsed)) {
          applyValue(clamp(parsed));
        }
        return;
      }

      if (key.escape || key.tab) {
        return;
      }

      if (input && !(key.ctrl || key.meta)) {
        const newBuffer = buffer + input;
        if (!/^-?\d*\.?\d*$/.test(newBuffer)) {
          return;
        }
        setBuffer(newBuffer);
        const parsed = Number.parseFloat(newBuffer);
        if (!Number.isNaN(parsed)) {
          applyValue(clamp(parsed));
        }
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  let displayValue = "";
  if (isFocused && buffer !== "") {
    displayValue = buffer;
  } else if (value !== undefined) {
    displayValue = format ? format(value) : String(value);
  }

  const resolvedStepHint =
    stepHint ??
    resolveTerminalSymbol(
      unicode,
      `↑ +${step}  ↓ -${step}`,
      `up +${step}  down -${step}`
    );

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box flexDirection="row" alignItems="center" gap={1}>
        <Text aria-hidden>{isFocused ? ">" : " "}</Text>
        <Box
          aria-label={
            ariaLabel ??
            `${label ?? "Number input"}: ${displayValue || "empty"}${
              min === undefined ? "" : `. Minimum ${min}`
            }${max === undefined ? "" : `. Maximum ${max}`}`
          }
          aria-role="textbox"
          aria-state={{ disabled, readonly: readOnly, required }}
          borderStyle={resolveBorderStyle(borderStyle, unicode)}
          borderColor={borderColor}
          paddingX={paddingX}
        >
          <Text
            color={
              displayValue
                ? theme.colors.foreground
                : theme.colors.mutedForeground
            }
          >
            {displayValue || placeholder}
          </Text>
          {isFocused && (
            <Text aria-hidden color={theme.colors.focusRing}>
              {resolvedCursor}
            </Text>
          )}
        </Box>
        {isFocused && (
          <Text aria-hidden color={theme.colors.mutedForeground}>
            {resolvedStepHint}
          </Text>
        )}
      </Box>
    </Box>
  );
};
