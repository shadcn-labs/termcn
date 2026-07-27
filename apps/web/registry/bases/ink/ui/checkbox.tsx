import { Box, Text } from "ink";
import React, { useState } from "react";

import { isActivationKey, useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveTerminalSymbol } from "@/registry/bases/ink/lib/accessibility";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (checked: boolean) => void;
  label?: string;
  indeterminate?: boolean;
  disabled?: boolean;
  id?: string;
  autoFocus?: boolean;
  isActive?: boolean;
  "aria-label"?: string;
  checkedIcon?: string;
  uncheckedIcon?: string;
  indeterminateIcon?: string;
}

export const Checkbox = ({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  onChange,
  label,
  indeterminate = false,
  disabled = false,
  id,
  autoFocus = false,
  isActive = true,
  "aria-label": ariaLabel,
  checkedIcon,
  uncheckedIcon,
  indeterminateIcon,
}: CheckboxProps) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const theme = useTheme();
  const unicode = useUnicode();

  const checked = controlledChecked ?? internalChecked;

  const { isFocused } = useInteraction(
    (input, key) => {
      if (disabled) {
        return;
      }
      if (isActivationKey(input, key)) {
        const next = !checked;
        const changeHandler = onCheckedChange ?? onChange;
        if (changeHandler) {
          changeHandler(next);
        } else {
          setInternalChecked(next);
        }
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const resolvedCheckedIcon =
    checkedIcon ?? resolveTerminalSymbol(unicode, "■", "[x]");
  const resolvedUncheckedIcon =
    uncheckedIcon ?? resolveTerminalSymbol(unicode, "□", "[ ]");
  const resolvedIndeterminateIcon =
    indeterminateIcon ?? resolveTerminalSymbol(unicode, "▪", "[-]");
  const checkedIcon_ = checked ? resolvedCheckedIcon : resolvedUncheckedIcon;
  const icon = indeterminate ? resolvedIndeterminateIcon : checkedIcon_;
  const activeColor =
    checked || indeterminate ? theme.colors.primary : theme.colors.border;
  const iconColor = disabled ? theme.colors.mutedForeground : activeColor;

  return (
    <Box
      aria-label={ariaLabel ?? label ?? "Checkbox"}
      aria-role="checkbox"
      aria-state={{ checked: checked || indeterminate, disabled }}
      gap={1}
    >
      <Text aria-hidden>{isFocused ? ">" : " "}</Text>
      <Text
        aria-hidden
        color={isFocused ? theme.colors.focusRing : iconColor}
        bold={isFocused}
        inverse={isFocused}
      >
        {icon}
      </Text>
      {label && (
        <Text
          aria-hidden
          color={
            disabled ? theme.colors.mutedForeground : theme.colors.foreground
          }
          dimColor={disabled}
        >
          {label}
        </Text>
      )}
    </Box>
  );
};
