import { Box, Text } from "ink";
import { useState } from "react";
import type { ReactNode } from "react";

import { FocusScope } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

export type DrawerEdge = "left" | "right" | "top" | "bottom";

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
  edge?: DrawerEdge;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  width?: number;
  height?: number;
  initialFocusId?: string;
  returnFocusId?: string;
  "aria-label"?: string;
}

export const Drawer = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  isOpen,
  edge = "right",
  title,
  children,
  onClose,
  width = 40,
  height = 10,
  initialFocusId,
  returnFocusId,
  "aria-label": ariaLabel,
}: DrawerProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? isOpen ?? internalOpen;

  const close = () => {
    if (controlledOpen === undefined && isOpen === undefined) {
      setInternalOpen(false);
    }
    onOpenChange?.(false);
    onClose?.();
  };

  if (!open) {
    return null;
  }

  const isHorizontal = edge === "left" || edge === "right";

  return (
    <FocusScope
      active={open}
      initialFocusId={initialFocusId}
      returnFocusId={returnFocusId}
      onEscapeKey={close}
    >
      <Box
        flexDirection="column"
        borderStyle={resolveBorderStyle("single", unicode)}
        borderColor={theme.colors.border}
        width={isHorizontal ? width : undefined}
        height={isHorizontal ? undefined : height}
        paddingX={1}
        paddingY={0}
      >
        <Box justifyContent="space-between" marginBottom={1}>
          <Text
            aria-label={ariaLabel ?? `Drawer: ${title ?? edge}`}
            bold={Boolean(title)}
            color={theme.colors.primary}
          >
            {title ?? ""}
          </Text>
          <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
            Esc to close
          </Text>
        </Box>
        <Box flexDirection="column" flexGrow={1}>
          {children}
        </Box>
      </Box>
    </FocusScope>
  );
};
