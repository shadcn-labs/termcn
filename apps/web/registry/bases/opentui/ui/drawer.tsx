/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export type DrawerEdge = "left" | "right" | "top" | "bottom";

export interface DrawerProps {
  isOpen?: boolean;
  edge?: DrawerEdge;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  width?: number;
  height?: number;
}

export const Drawer = ({
  isOpen = false,
  edge = "right",
  title,
  children,
  onClose,
  width = 40,
  height = 10,
}: DrawerProps) => {
  const theme = useTheme();

  useKeyboard((key) => {
    if (!isOpen) {
      return;
    }
    if (key.name === "escape") {
      onClose?.();
    }
  });

  if (!isOpen) {
    return null;
  }

  const isHorizontal = edge === "left" || edge === "right";

  return (
    <box
      flexDirection="column"
      borderStyle="single"
      borderColor={theme.colors.border}
      width={isHorizontal ? width : undefined}
      height={isHorizontal ? undefined : height}
      paddingLeft={1}
      paddingRight={1}
      paddingTop={0}
      paddingBottom={0}
    >
      <box justifyContent="space-between" marginBottom={1}>
        {title ? (
          <text fg={theme.colors.primary}>
            <b>{title}</b>
          </text>
        ) : (
          <text> </text>
        )}
        <text fg="#666">Esc to close</text>
      </box>
      <box flexDirection="column" flexGrow={1}>
        {children}
      </box>
    </box>
  );
};
