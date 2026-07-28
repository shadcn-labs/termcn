/* @jsxImportSource @opentui/react */
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useInteraction } from "@/registry/bases/opentui/hooks/use-interaction";
import type { PressDetails } from "@/registry/bases/opentui/hooks/use-interaction";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

export interface ToggleProps {
  autoFocus?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  pressed?: boolean;
  defaultPressed?: boolean;
  onChange?: (checked: boolean) => void;
  onCheckedChange?: (checked: boolean, details: PressDetails) => void;
  onPressedChange?: (pressed: boolean, details: PressDetails) => void;
  label?: string;
  onLabel?: string;
  offLabel?: string;
  id?: string;
  isActive?: boolean;
  disabled?: boolean;
  checkedIcon?: string;
  uncheckedIcon?: string;
  borderStyle?: BorderStyle;
  paddingX?: number;
}

export const Toggle = ({
  autoFocus = false,
  checked: controlledChecked,
  defaultChecked = false,
  pressed: controlledPressed,
  defaultPressed,
  onChange,
  onCheckedChange,
  onPressedChange,
  label,
  onLabel = "ON",
  offLabel = "OFF",
  id,
  isActive = true,
  disabled = false,
  checkedIcon = "●",
  uncheckedIcon = "○",
  borderStyle = "rounded",
  paddingX = 1,
}: ToggleProps) => {
  const theme = useTheme();
  const [internalChecked, setInternalChecked] = useState(
    defaultPressed ?? defaultChecked
  );
  const controlledValue = controlledPressed ?? controlledChecked;
  const checked = controlledValue ?? internalChecked;

  const { interactionProps, isFocused } = useInteraction({
    autoFocus,
    disabled,
    id,
    isActive,
    onPress: (details) => {
      const next = !checked;
      if (controlledValue === undefined) {
        setInternalChecked(next);
      }
      if (onPressedChange) {
        onPressedChange(next, details);
      } else if (onCheckedChange) {
        onCheckedChange(next, details);
      } else {
        onChange?.(next);
      }
    },
  });

  const trackColor = checked
    ? theme.colors.success
    : theme.colors.mutedForeground;
  const focusColor = isFocused ? theme.colors.focusRing : trackColor;
  const stateLabel = checked ? onLabel : offLabel;

  return (
    <box {...interactionProps} gap={1} alignItems="center">
      <box
        borderStyle={borderStyle}
        borderColor={focusColor}
        paddingLeft={paddingX}
        paddingRight={paddingX}
      >
        <text fg={focusColor}>
          {checked ? (
            <b>{`${checkedIcon} ${stateLabel}`}</b>
          ) : (
            `${uncheckedIcon} ${stateLabel}`
          )}
        </text>
      </box>
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
