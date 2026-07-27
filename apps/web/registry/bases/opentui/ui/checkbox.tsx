/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  indeterminate?: boolean;
  disabled?: boolean;
  id?: string;
  checkedIcon?: string;
  uncheckedIcon?: string;
  indeterminateIcon?: string;
}

export const Checkbox = ({
  checked: controlledChecked,
  onChange,
  label,
  indeterminate = false,
  disabled = false,
  id: _id,
  checkedIcon = "■",
  uncheckedIcon = "□",
  indeterminateIcon = "▪",
}: CheckboxProps) => {
  const [internalChecked, setInternalChecked] = useState(false);
  const theme = useTheme();
  const [isFocused] = useState(true);

  const checked = controlledChecked ?? internalChecked;

  useKeyboard((key) => {
    if (!isFocused || disabled) {
      return;
    }
    if (key.name === " ") {
      const next = !checked;
      if (onChange) {
        onChange(next);
      } else {
        setInternalChecked(next);
      }
    }
  });

  const checkedIcon_ = checked ? checkedIcon : uncheckedIcon;
  const icon = indeterminate ? indeterminateIcon : checkedIcon_;
  const activeColor =
    checked || indeterminate ? theme.colors.primary : theme.colors.border;
  const iconColor = disabled ? theme.colors.mutedForeground : activeColor;

  return (
    <box gap={1}>
      <text fg={isFocused ? theme.colors.focusRing : iconColor}>
        {isFocused ? <b>{icon}</b> : icon}
      </text>
      {label && (
        <text fg={disabled ? "#666" : theme.colors.foreground}>{label}</text>
      )}
    </box>
  );
};
