import { Box, Text } from "ink";
import { useState } from "react";
import type { ReactNode } from "react";

import { FocusScope } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  initialFocusId?: string;
  returnFocusId?: string;
  "aria-label"?: string;
}

export const Popover = ({
  trigger,
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  isOpen,
  onClose,
  title,
  initialFocusId,
  returnFocusId,
  "aria-label": ariaLabel,
}: PopoverProps) => {
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

  return (
    <Box flexDirection="column" alignItems="flex-start">
      <Box
        aria-label={ariaLabel ?? title ?? "Popover trigger"}
        aria-role="button"
        aria-state={{ expanded: open }}
      >
        {trigger}
      </Box>
      {open && (
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
            paddingX={1}
            paddingY={0}
            marginTop={0}
          >
            {(title || ariaLabel) && (
              <Box marginBottom={1}>
                <Text
                  aria-label={`Popover: ${ariaLabel ?? title}`}
                  bold
                  color={theme.colors.primary}
                >
                  {title ?? ""}
                </Text>
              </Box>
            )}
            <Box flexDirection="column">{children}</Box>
            <Box aria-hidden marginTop={1}>
              <Text color={theme.colors.mutedForeground} dimColor>
                Press Esc to close
              </Text>
            </Box>
          </Box>
        </FocusScope>
      )}
    </Box>
  );
};
