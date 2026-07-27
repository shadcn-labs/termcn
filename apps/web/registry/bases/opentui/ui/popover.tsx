/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
}

export const Popover = ({
  trigger,
  children,
  isOpen = false,
  onClose,
  title,
}: PopoverProps) => {
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
    return (
      <box flexDirection="column" alignItems="flex-start">
        <box>{trigger}</box>
      </box>
    );
  }

  return (
    <box flexDirection="column" alignItems="flex-start">
      <box>{trigger}</box>
      <box
        flexDirection="column"
        borderStyle="single"
        borderColor={theme.colors.border}
        paddingLeft={1}
        paddingRight={1}
        paddingTop={0}
        paddingBottom={0}
        marginTop={0}
      >
        {title && (
          <box marginBottom={1}>
            <text fg={theme.colors.primary}>
              <b>{title}</b>
            </text>
          </box>
        )}
        <box flexDirection="column">{children}</box>
        <box marginTop={1}>
          <text fg="#666">Press Esc to close</text>
        </box>
      </box>
    </box>
  );
};
