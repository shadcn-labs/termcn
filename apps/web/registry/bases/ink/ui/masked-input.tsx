import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";

export interface MaskedInputProps {
  mask: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  isDisabled?: boolean;
  id?: string;
  width?: number;
}

/**
 * Returns true if the literal at `pos` "closes" a digit group, meaning there
 * exists a literal at some position j < pos such that every character strictly
 * between j and pos is '#'.  e.g. ')' at position 4 in '(###) ###-####'.
 */
const isClosingLiteral = (mask: string, pos: number): boolean => {
  for (let j = pos - 1; j >= 0; j -= 1) {
    if (mask[j] === "#") {
      continue;
    }
    const between = mask.slice(j + 1, pos);
    return between.length > 0 && [...between].every((c) => c === "#");
  }
  return false;
};

/**
 * Apply a mask to raw digits. '#' in the mask is a digit placeholder.
 * Returns the formatted display string.
 */
const applyMask = (raw: string, mask: string): string => {
  let rawIdx = 0;
  let result = "";

  for (let i = 0; i < mask.length; i += 1) {
    const maskChar = mask[i];

    if (rawIdx >= raw.length) {
      if (maskChar !== "#" && isClosingLiteral(mask, i)) {
        result += maskChar;
      }
      break;
    }

    if (maskChar === "#") {
      result += raw[rawIdx];
      rawIdx += 1;
    } else if (mask.includes("#", i + 1)) {
      result += maskChar;
    }
  }

  return result;
};

const maxDigits = (mask: string): number =>
  [...mask].filter((c) => c === "#").length;

export const MaskedInput = ({
  mask,
  value: controlledValue,
  onChange,
  onSubmit,
  label,
  placeholder,
  autoFocus = false,
  isDisabled = false,
  id,
  width = 40,
}: MaskedInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const theme = useTheme();
  const { isFocused } = useFocus({
    autoFocus,
    id,
    isActive: !isDisabled,
  });

  const raw = controlledValue ?? internalValue;
  const max = maxDigits(mask);

  const setValue = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const insertDigits = (input: string) => {
    const available = max - raw.length;
    const digits = [...input].filter((character) => /\d/u.test(character));
    const inserted = digits.slice(0, available).join("");
    if (inserted) {
      setValue(raw + inserted);
    }
  };

  useInput(
    (input, key) => {
      if (!isFocused) {
        return;
      }

      if (key.return) {
        onSubmit?.(raw);
        return;
      }

      if (key.backspace || key.delete) {
        setValue(raw.slice(0, -1));
        return;
      }

      if (key.escape || key.upArrow || key.downArrow || key.tab) {
        return;
      }

      insertDigits(input);
    },
    { isActive: isFocused && !isDisabled }
  );

  const display = raw.length > 0 ? applyMask(raw, mask) : "";
  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  const remainingMask = mask.slice(display.length);

  const displayPlaceholder = placeholder ? (
    <Text color={theme.colors.mutedForeground}>{placeholder}</Text>
  ) : null;

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box
        borderStyle="round"
        borderColor={borderColor}
        width={width}
        paddingX={1}
      >
        {display.length > 0 ? (
          <Text color={theme.colors.foreground}>{display}</Text>
        ) : (
          displayPlaceholder
        )}
        {isFocused && display.length < mask.length && (
          <Text color={theme.colors.focusRing}>█</Text>
        )}
        {display.length > 0 && display.length < mask.length && (
          <Text color={theme.colors.mutedForeground} dimColor>
            {remainingMask}
          </Text>
        )}
      </Box>
    </Box>
  );
};
