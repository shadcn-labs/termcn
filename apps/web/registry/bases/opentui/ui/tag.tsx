/* @jsxImportSource @opentui/react */
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export type TagVariant = "default" | "outline";

export interface TagProps {
  children: ReactNode;
  onRemove?: () => void;
  color?: string;
  variant?: TagVariant;
}

export const Tag = ({
  children,
  onRemove,
  color,
  variant = "default",
}: TagProps) => {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.primary;
  const borderColor =
    variant === "outline" ? theme.colors.mutedForeground : resolvedColor;

  return (
    <box
      borderStyle="rounded"
      borderColor={borderColor}
      paddingLeft={1}
      paddingRight={1}
      flexDirection="row"
    >
      <text
        fg={
          variant === "outline" ? theme.colors.mutedForeground : resolvedColor
        }
      >
        {children}
      </text>
      {onRemove && <text fg={theme.colors.mutedForeground}>{" ×"}</text>}
    </box>
  );
};
