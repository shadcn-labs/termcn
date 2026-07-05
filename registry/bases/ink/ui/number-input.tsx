import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface NumberInputProps {
  value?: number;
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
}

export const NumberInput = ({
  value: controlledValue,
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
  cursor = "█",
  stepHint,
}: NumberInputProps) => {
  const [internalValue, setInternalValue] = useState<number | undefined>();
  const [buffer, setBuffer] = useState<string>("");
  const theme = useTheme();
  const { isFocused } = useFocus({ id });

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
    if (onChange) {
      onChange(clamped);
    } else {
      setInternalValue(clamped);
    }
  };

  const commitValue = (n: number) => {
    const clamped = clamp(n);
    applyValue(clamped);
    setBuffer(String(clamped));
  };

  useInput((input, key) => {
    if (!isFocused) {
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

    if (key.backspace || key.delete) {
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

    if (input && /^[\d.-]$/.test(input)) {
      if (input === "-" && buffer.length > 0) {
        return;
      }
      if (input === "." && buffer.includes(".")) {
        return;
      }

      const newBuffer = buffer + input;
      setBuffer(newBuffer);
      const parsed = Number.parseFloat(newBuffer);
      if (!Number.isNaN(parsed)) {
        applyValue(clamp(parsed));
      }
    }
  });

  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  let displayValue = "";
  if (isFocused && buffer !== "") {
    displayValue = buffer;
  } else if (value !== undefined) {
    displayValue = format ? format(value) : String(value);
  }

  const resolvedStepHint = stepHint ?? `↑ +${step}  ↓ -${step}`;

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box flexDirection="row" alignItems="center" gap={1}>
        <Box
          borderStyle={borderStyle}
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
          {isFocused && <Text color={theme.colors.focusRing}>{cursor}</Text>}
        </Box>
        {isFocused && (
          <Text color={theme.colors.mutedForeground}>{resolvedStepHint}</Text>
        )}
      </Box>
    </Box>
  );
};
