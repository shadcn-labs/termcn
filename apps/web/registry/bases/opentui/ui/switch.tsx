/* @jsxImportSource @opentui/react */
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useInteraction } from "@/registry/bases/opentui/hooks/use-interaction";
import type {
  InteractionProps,
  PressDetails,
} from "@/registry/bases/opentui/hooks/use-interaction";

export interface SwitchProps extends InteractionProps {
  checked?: boolean;
  defaultChecked?: boolean;
  label: string;
  onChange?: (checked: boolean) => void;
  onCheckedChange?: (checked: boolean, details: PressDetails) => void;
  symbols?: "round" | "ascii";
  width?: 3 | 5;
}

const symbolSets = {
  ascii: { thumb: "*", track: "-" },
  round: { thumb: "●", track: "─" },
} as const;

export const Switch = ({
  autoFocus = false,
  checked: controlledChecked,
  defaultChecked = false,
  disabled = false,
  id,
  isActive = true,
  label,
  onChange,
  onCheckedChange,
  symbols = "round",
  width = 3,
}: SwitchProps) => {
  const theme = useTheme();
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const checked = controlledChecked ?? internalChecked;
  const glyphs = symbolSets[symbols];

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

  const track = checked
    ? `${glyphs.track.repeat(width - 1)}${glyphs.thumb}`
    : `${glyphs.thumb}${glyphs.track.repeat(width - 1)}`;
  const activeColor = checked ? theme.colors.success : theme.colors.border;
  const trackColor = isFocused ? theme.colors.focusRing : activeColor;

  return (
    <box {...interactionProps} alignItems="center" gap={1}>
      <text fg={disabled ? theme.colors.mutedForeground : trackColor}>
        {isFocused ? <b>{track}</b> : track}
      </text>
      <text
        fg={disabled ? theme.colors.mutedForeground : theme.colors.foreground}
      >
        {label}
      </text>
    </box>
  );
};
