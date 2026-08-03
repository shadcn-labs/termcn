/* @jsxImportSource @opentui/react */
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import {
  activationKey,
  useInteraction,
} from "@/registry/bases/opentui/hooks/use-interaction";

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
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void;
  isOpen?: boolean;
  isActive?: boolean;
  initialFocus?: "cancel" | "confirm";
}

export type DialogOpenChangeReason =
  | "action"
  | "close"
  | "escape"
  | "programmatic";

export interface DialogOpenChangeDetails {
  readonly cancelable: boolean;
  readonly defaultPrevented: boolean;
  readonly open: boolean;
  readonly reason: DialogOpenChangeReason;
  preventDefault: () => void;
}

interface PointerEventLike {
  button?: number;
  defaultPrevented?: boolean;
}

const isPrimaryPointer = (event: PointerEventLike): boolean =>
  !event.defaultPrevented && (event.button === undefined || event.button === 0);

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
  isActive = true,
  initialFocus = "cancel",
}: DialogProps) => {
  const theme = useTheme();
  const [focusedButton, setFocusedButton] = useState<0 | 1>(
    initialFocus === "confirm" ? 1 : 0
  );
  const pressedButtonRef = useRef<0 | 1 | null>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? isOpen ?? internalOpen;

  useEffect(() => {
    if (open) {
      setFocusedButton(initialFocus === "confirm" ? 1 : 0);
    }
  }, [initialFocus, open]);

  const setOpen = (
    nextOpen: boolean,
    reason: DialogOpenChangeReason,
    cancelable = false
  ) => {
    if (nextOpen === open) {
      return false;
    }
    let prevented = false;
    const details = Object.freeze<DialogOpenChangeDetails>({
      cancelable,
      get defaultPrevented() {
        return prevented;
      },
      open: nextOpen,
      preventDefault: () => {
        if (cancelable) {
          prevented = true;
        }
      },
      reason,
    });
    onOpenChange?.(nextOpen, details);
    if (prevented) {
      return false;
    }
    if (controlledOpen === undefined && isOpen === undefined) {
      setInternalOpen(nextOpen);
    }
    return true;
  };

  const cancel = () => {
    onCancel?.();
    setOpen(false, "close", true);
  };

  const confirm = () => {
    onConfirm?.();
    setOpen(false, "action", false);
  };

  const { interactionProps } = useInteraction({
    autoFocus: true,
    disabled: !open,
    isActive,
    onInput: (key) => {
      if (key.name === "tab" || key.name === "left" || key.name === "right") {
        setFocusedButton((prev) => (prev === 0 ? 1 : 0));
      } else if (activationKey(key)) {
        if (focusedButton === 1) {
          confirm();
        } else {
          cancel();
        }
      } else if (key.name === "escape") {
        onCancel?.();
        setOpen(false, "escape", true);
      }
    },
  });

  if (!open) {
    return null;
  }

  const confirmColor =
    variant === "danger" ? theme.colors.error : theme.colors.primary;

  return (
    <box
      {...interactionProps}
      flexDirection="column"
      borderStyle="rounded"
      borderColor={
        variant === "danger" ? theme.colors.error : theme.colors.primary
      }
      paddingLeft={1}
      paddingRight={1}
      paddingTop={0}
      paddingBottom={0}
    >
      {title && (
        <box marginBottom={1}>
          <text
            fg={
              variant === "danger" ? theme.colors.error : theme.colors.primary
            }
          >
            <b>{title}</b>
          </text>
        </box>
      )}
      <box marginBottom={1} flexDirection="column">
        {children}
      </box>
      <box flexDirection="row" gap={2} justifyContent="flex-end" marginTop={1}>
        <box
          onMouseDown={(event) => {
            if (isPrimaryPointer(event)) {
              pressedButtonRef.current = 0;
              setFocusedButton(0);
            }
          }}
          onMouseOut={() => {
            pressedButtonRef.current = null;
          }}
          onMouseUp={(event) => {
            const shouldCancel =
              pressedButtonRef.current === 0 && isPrimaryPointer(event);
            pressedButtonRef.current = null;
            if (shouldCancel) {
              cancel();
            }
          }}
        >
          <text
            fg={
              focusedButton === 0
                ? theme.colors.foreground
                : theme.colors.mutedForeground
            }
            inverse={focusedButton === 0}
          >
            {focusedButton === 0 ? (
              <b>{` ${cancelLabel} `}</b>
            ) : (
              ` ${cancelLabel} `
            )}
          </text>
        </box>
        <box
          onMouseDown={(event) => {
            if (isPrimaryPointer(event)) {
              pressedButtonRef.current = 1;
              setFocusedButton(1);
            }
          }}
          onMouseOut={() => {
            pressedButtonRef.current = null;
          }}
          onMouseUp={(event) => {
            const shouldConfirm =
              pressedButtonRef.current === 1 && isPrimaryPointer(event);
            pressedButtonRef.current = null;
            if (shouldConfirm) {
              confirm();
            }
          }}
        >
          <text
            fg={
              focusedButton === 1 ? confirmColor : theme.colors.mutedForeground
            }
            inverse={focusedButton === 1}
          >
            {focusedButton === 1 ? (
              <b>{` ${confirmLabel} `}</b>
            ) : (
              ` ${confirmLabel} `
            )}
          </text>
        </box>
      </box>
    </box>
  );
};
