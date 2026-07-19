import { Box, Text } from "ink";
import { useId, useState } from "react";
import type { ReactNode } from "react";

import {
  FocusScope,
  isActivationKey,
  useInteraction,
} from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

interface DialogActionsProps {
  id: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DialogActions = ({
  id,
  confirmLabel,
  cancelLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: DialogActionsProps) => {
  const theme = useTheme();
  const [focusedButton, setFocusedButton] = useState<"cancel" | "confirm">(
    "cancel"
  );
  const { isFocused } = useInteraction(
    (input, key) => {
      if (key.leftArrow) {
        setFocusedButton("cancel");
      } else if (key.rightArrow) {
        setFocusedButton("confirm");
      } else if (key.home) {
        setFocusedButton("cancel");
      } else if (key.end) {
        setFocusedButton("confirm");
      } else if (isActivationKey(input, key)) {
        if (focusedButton === "confirm") {
          onConfirm();
        } else {
          onCancel();
        }
      }
    },
    { autoFocus: true, id }
  );

  return (
    <Box
      aria-role="toolbar"
      flexDirection="row"
      gap={2}
      justifyContent="flex-end"
      marginTop={1}
    >
      <Box
        aria-label={cancelLabel}
        aria-role="button"
        aria-state={{ selected: focusedButton === "cancel" }}
      >
        <Text
          aria-hidden
          color={
            isFocused && focusedButton === "cancel"
              ? theme.colors.foreground
              : theme.colors.mutedForeground
          }
          bold={isFocused && focusedButton === "cancel"}
          inverse={isFocused && focusedButton === "cancel"}
        >
          {` ${cancelLabel} `}
        </Text>
      </Box>
      <Box
        aria-label={confirmLabel}
        aria-role="button"
        aria-state={{ selected: focusedButton === "confirm" }}
      >
        <Text
          aria-hidden
          color={
            isFocused && focusedButton === "confirm"
              ? confirmColor
              : theme.colors.mutedForeground
          }
          bold={isFocused && focusedButton === "confirm"}
          inverse={isFocused && focusedButton === "confirm"}
        >
          {` ${confirmLabel} `}
        </Text>
      </Box>
    </Box>
  );
};

export interface DialogProps {
  title?: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: "default" | "danger";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
  initialFocusId?: string;
  returnFocusId?: string;
  "aria-label"?: string;
}

export const Dialog = ({
  title,
  children,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  isOpen,
  initialFocusId,
  returnFocusId,
  "aria-label": ariaLabel,
}: DialogProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const generatedId = useId();
  const actionsId = `dialog-actions-${generatedId}`;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? isOpen ?? internalOpen;

  const setOpen = (nextOpen: boolean) => {
    if (controlledOpen === undefined && isOpen === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const cancel = () => {
    onCancel?.();
    setOpen(false);
  };

  const confirm = () => {
    onConfirm?.();
    setOpen(false);
  };

  if (!open) {
    return null;
  }

  const confirmColor =
    variant === "danger" ? theme.colors.error : theme.colors.primary;

  return (
    <FocusScope
      active={open}
      initialFocusId={initialFocusId ?? actionsId}
      returnFocusId={returnFocusId}
      onEscapeKey={cancel}
    >
      <Box
        flexDirection="column"
        borderStyle={resolveBorderStyle("round", unicode)}
        borderColor={
          variant === "danger" ? theme.colors.error : theme.colors.primary
        }
        paddingX={1}
        paddingY={0}
      >
        {(title || ariaLabel) && (
          <Box marginBottom={1}>
            <Text
              aria-label={ariaLabel ?? `Dialog: ${title}`}
              bold
              color={
                variant === "danger" ? theme.colors.error : theme.colors.primary
              }
            >
              {title ?? ""}
            </Text>
          </Box>
        )}
        <Box marginBottom={1} flexDirection="column">
          {children}
        </Box>
        <DialogActions
          id={actionsId}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          confirmColor={confirmColor}
          onConfirm={confirm}
          onCancel={cancel}
        />
      </Box>
    </FocusScope>
  );
};
