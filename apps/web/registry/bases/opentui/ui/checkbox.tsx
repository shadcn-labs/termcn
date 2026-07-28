/* @jsxImportSource @opentui/react */
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useInteraction } from "@/registry/bases/opentui/hooks/use-interaction";
import type { PressDetails } from "@/registry/bases/opentui/hooks/use-interaction";

export interface CheckboxProps {
  autoFocus?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  onCheckedChange?: (checked: boolean, details: PressDetails) => void;
  label?: string;
  indeterminate?: boolean;
  disabled?: boolean;
  id?: string;
  isActive?: boolean;
  checkedIcon?: string;
  uncheckedIcon?: string;
  indeterminateIcon?: string;
}

export const Checkbox = ({
  autoFocus = false,
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  onCheckedChange,
  label,
  indeterminate = false,
  disabled = false,
  id,
  isActive = true,
  checkedIcon = "■",
  uncheckedIcon = "□",
  indeterminateIcon = "▪",
}: CheckboxProps) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const theme = useTheme();

  const checked = controlledChecked ?? internalChecked;

  const { interactionProps, isFocused } = useInteraction({
    autoFocus,
    disabled,
    id,
    isActive,
    onPress: (details) => {
      const next = !checked;
      if (controlledChecked === undefined) {
        setInternalChecked(next);
      }
      if (onCheckedChange) {
        onCheckedChange(next, details);
      } else {
        onChange?.(next);
      }
    },
  });

  const checkedIcon_ = checked ? checkedIcon : uncheckedIcon;
  const icon = indeterminate ? indeterminateIcon : checkedIcon_;
  const activeColor =
    checked || indeterminate ? theme.colors.primary : theme.colors.border;
  const iconColor = disabled ? theme.colors.mutedForeground : activeColor;

  return (
    <box {...interactionProps} gap={1}>
      <text fg={isFocused ? theme.colors.focusRing : iconColor}>
        {isFocused ? <b>{icon}</b> : icon}
      </text>
      {label && (
        <text
          fg={disabled ? theme.colors.mutedForeground : theme.colors.foreground}
        >
          {label}
        </text>
      )}
    </box>
  );
};
