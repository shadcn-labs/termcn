import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { isActivationKey, useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

export type TagVariant = "default" | "outline";

export interface TagProps extends InteractionProps {
  children: ReactNode;
  onRemove?: () => void;
  color?: string;
  variant?: TagVariant;
  "aria-label"?: string;
}

export const Tag = ({
  children,
  onRemove,
  color,
  variant = "default",
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel,
}: TagProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.primary;
  const borderColor =
    variant === "outline" ? theme.colors.mutedForeground : resolvedColor;
  const { isFocused } = useInteraction(
    (input, key) => {
      if (isActivationKey(input, key) || key.delete || key.backspace) {
        onRemove?.();
      }
    },
    { autoFocus, disabled, id, isActive: isActive && Boolean(onRemove) }
  );

  return (
    <Box
      borderStyle={resolveBorderStyle("round", unicode)}
      borderColor={borderColor}
      paddingX={1}
      flexDirection="row"
      aria-role={onRemove ? "button" : "listitem"}
      aria-label={
        ariaLabel ??
        (typeof children === "string"
          ? `${children}${onRemove ? ", removable" : ""}`
          : onRemove
            ? "Removable tag"
            : "Tag")
      }
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text
        color={
          variant === "outline" ? theme.colors.mutedForeground : resolvedColor
        }
      >
        {children}
      </Text>
      {onRemove && (
        <Text aria-hidden color={theme.colors.mutedForeground}>
          {isFocused ? (unicode ? " [×]" : " [x]") : unicode ? " ×" : " x"}
        </Text>
      )}
    </Box>
  );
};
