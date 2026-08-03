/* @jsxImportSource @opentui/react */
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useInteraction } from "@/registry/bases/opentui/hooks/use-interaction";
import type {
  InteractionProps,
  PressDetails,
} from "@/registry/bases/opentui/hooks/use-interaction";

export interface ButtonProps extends InteractionProps {
  children?: ReactNode;
  intent?: "neutral" | "primary" | "danger";
  label?: string;
  onPress?: (details: PressDetails) => void;
  size?: "compact" | "comfortable";
}

export const Button = ({
  autoFocus = false,
  children,
  disabled = false,
  id,
  intent = "primary",
  isActive = true,
  label,
  onPress,
  size = "compact",
}: ButtonProps) => {
  const theme = useTheme();
  const { interactionProps, isFocused, isPressed } = useInteraction({
    autoFocus,
    disabled,
    id,
    isActive,
    onPress,
  });
  const content = children ?? label ?? "";

  let backgroundColor = theme.colors.muted;
  let foregroundColor = theme.colors.foreground;
  if (intent === "primary") {
    backgroundColor = theme.colors.primary;
    foregroundColor = theme.colors.primaryForeground;
  } else if (intent === "danger") {
    backgroundColor = theme.colors.error;
    foregroundColor = theme.colors.errorForeground;
  }
  if (disabled) {
    backgroundColor = theme.colors.muted;
    foregroundColor = theme.colors.mutedForeground;
  } else if (isPressed) {
    backgroundColor = theme.colors.selection;
    foregroundColor = theme.colors.selectionForeground;
  } else if (isFocused) {
    backgroundColor = theme.colors.focusRing;
  }

  return (
    <box
      {...interactionProps}
      backgroundColor={backgroundColor}
      paddingLeft={size === "comfortable" ? 2 : 1}
      paddingRight={size === "comfortable" ? 2 : 1}
    >
      <text fg={foregroundColor}>{isFocused ? <b>{content}</b> : content}</text>
    </box>
  );
};
