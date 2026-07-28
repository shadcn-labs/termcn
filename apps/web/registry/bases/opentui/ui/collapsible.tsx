/* @jsxImportSource @opentui/react */
import * as React from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useInteraction } from "@/registry/bases/opentui/hooks/use-interaction";
import type {
  InteractionProps,
  PressDetails,
} from "@/registry/bases/opentui/hooks/use-interaction";

interface CollapsibleContextValue {
  disabled: boolean;
  open: boolean;
  setOpen: (open: boolean, details: PressDetails) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(
  null
);

const useCollapsible = () => {
  const value = React.useContext(CollapsibleContext);
  if (!value) {
    throw new Error("Collapsible parts must be rendered inside <Collapsible>.");
  }
  return value;
};

export interface CollapsibleProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean, details: PressDetails) => void;
  open?: boolean;
}

export const Collapsible = ({
  children,
  defaultOpen = false,
  disabled = false,
  onOpenChange,
  open: controlledOpen,
}: CollapsibleProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean, details: PressDetails) => {
      if (nextOpen === open) {
        return;
      }
      if (controlledOpen === undefined) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen, details);
    },
    [controlledOpen, onOpenChange, open]
  );

  const contextValue = React.useMemo(
    () => ({ disabled, open, setOpen }),
    [disabled, open, setOpen]
  );

  return (
    <CollapsibleContext.Provider value={contextValue}>
      <box flexDirection="column" gap={1}>
        {children}
      </box>
    </CollapsibleContext.Provider>
  );
};

export interface CollapsibleTriggerProps extends InteractionProps {
  closedMark?: string;
  label: string;
  openMark?: string;
}

export const CollapsibleTrigger = ({
  autoFocus = false,
  closedMark = "›",
  disabled = false,
  id,
  isActive = true,
  label,
  openMark = "⌄",
}: CollapsibleTriggerProps) => {
  const theme = useTheme();
  const collapsible = useCollapsible();
  const effectivelyDisabled = collapsible.disabled || disabled;
  const { interactionProps, isFocused } = useInteraction({
    autoFocus,
    disabled: effectivelyDisabled,
    id,
    isActive,
    onPress: (details) => collapsible.setOpen(!collapsible.open, details),
  });

  return (
    <box {...interactionProps} flexDirection="row" gap={1}>
      <text fg={isFocused ? theme.colors.focusRing : theme.colors.primary}>
        {collapsible.open ? openMark : closedMark}
      </text>
      <text
        fg={
          effectivelyDisabled
            ? theme.colors.mutedForeground
            : theme.colors.foreground
        }
      >
        {isFocused ? <b>{label}</b> : label}
      </text>
    </box>
  );
};

export interface CollapsibleContentProps {
  children: React.ReactNode;
  keepMounted?: boolean;
  paddingLeft?: number;
}

export const CollapsibleContent = ({
  children,
  keepMounted = false,
  paddingLeft = 2,
}: CollapsibleContentProps) => {
  const { open } = useCollapsible();
  if (!(open || keepMounted)) {
    return null;
  }
  return (
    <box
      display={open ? "flex" : "none"}
      flexDirection="column"
      paddingLeft={paddingLeft}
    >
      {children}
    </box>
  );
};

export const CollapsiblePanel = CollapsibleContent;
