/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  onLabel?: string;
  offLabel?: string;
  id?: string;
  disabled?: boolean;
  checkedIcon?: string;
  uncheckedIcon?: string;
  borderStyle?: BorderStyle;
  paddingX?: number;
}

export const Toggle = ({
  checked: controlledChecked,
  onChange,
  label,
  onLabel = "ON",
  offLabel = "OFF",
  id: _id,
  disabled = false,
  checkedIcon = "●",
  uncheckedIcon = "○",
  borderStyle = "rounded",
  paddingX = 1,
}: ToggleProps) => {
  const theme = useTheme();
  const [isFocused] = useState(true);
  const [internalChecked, setInternalChecked] = useState(false);
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

  const trackColor = checked
    ? theme.colors.success
    : theme.colors.mutedForeground;
  const focusColor = isFocused ? theme.colors.focusRing : trackColor;
  const stateLabel = checked ? onLabel : offLabel;

  return (
    <box gap={1} alignItems="center">
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
