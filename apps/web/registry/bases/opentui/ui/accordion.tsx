/* @jsxImportSource @opentui/react */
import * as React from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useInteraction } from "@/registry/bases/opentui/hooks/use-interaction";
import type {
  InteractionProps,
  PressDetails,
} from "@/registry/bases/opentui/hooks/use-interaction";

interface TriggerRegistration {
  disabled: boolean;
  focus: () => void;
  id: string;
}

interface AccordionContextValue {
  disabled: boolean;
  isOpen: (value: string) => boolean;
  moveFocus: (currentId: string, target: -1 | 1 | "first" | "last") => void;
  registerTrigger: (trigger: TriggerRegistration) => () => void;
  toggle: (value: string, details: PressDetails) => void;
}

interface AccordionItemContextValue {
  disabled: boolean;
  onOpenChange?: (open: boolean, details: PressDetails) => void;
  open: boolean;
  value: string;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(
  null
);
const AccordionItemContext =
  React.createContext<AccordionItemContextValue | null>(null);

const useAccordion = () => {
  const value = React.useContext(AccordionContext);
  if (!value) {
    throw new Error("Accordion parts must be rendered inside <Accordion>.");
  }
  return value;
};

const useAccordionItem = () => {
  const value = React.useContext(AccordionItemContext);
  if (!value) {
    throw new Error(
      "AccordionTrigger and AccordionContent must be rendered inside <AccordionItem>."
    );
  }
  return value;
};

export interface AccordionProps {
  children: React.ReactNode;
  defaultValue?: readonly string[];
  disabled?: boolean;
  multiple?: boolean;
  onValueChange?: (value: readonly string[], details: PressDetails) => void;
  value?: readonly string[];
}

const unique = (values: readonly string[]): string[] => [...new Set(values)];

export const Accordion = ({
  children,
  defaultValue = [],
  disabled = false,
  multiple = false,
  onValueChange,
  value: controlledValue,
}: AccordionProps) => {
  const [internalValue, setInternalValue] = React.useState(() =>
    unique(multiple ? defaultValue : defaultValue.slice(0, 1))
  );
  const value = controlledValue ?? internalValue;
  const triggersRef = React.useRef<TriggerRegistration[]>([]);

  const registerTrigger = React.useCallback((trigger: TriggerRegistration) => {
    const existing = triggersRef.current.findIndex(
      (entry) => entry.id === trigger.id
    );
    if (existing === -1) {
      triggersRef.current.push(trigger);
    } else {
      triggersRef.current[existing] = trigger;
    }
    return () => {
      triggersRef.current = triggersRef.current.filter(
        (entry) => entry.id !== trigger.id
      );
    };
  }, []);

  const moveFocus = React.useCallback(
    (currentId: string, target: -1 | 1 | "first" | "last") => {
      const enabled = triggersRef.current.filter(
        (trigger) => !trigger.disabled
      );
      if (enabled.length === 0) {
        return;
      }
      if (target === "first") {
        enabled[0]?.focus();
        return;
      }
      if (target === "last") {
        enabled.at(-1)?.focus();
        return;
      }
      const currentIndex = enabled.findIndex(
        (trigger) => trigger.id === currentId
      );
      const nextIndex = Math.max(
        0,
        Math.min(enabled.length - 1, currentIndex + target)
      );
      enabled[nextIndex]?.focus();
    },
    []
  );

  const toggle = React.useCallback(
    (itemValue: string, details: PressDetails) => {
      if (disabled) {
        return;
      }
      const open = value.includes(itemValue);
      const next = open
        ? value.filter((entry) => entry !== itemValue)
        : multiple
          ? unique([...value, itemValue])
          : [itemValue];
      if (controlledValue === undefined) {
        setInternalValue(next);
      }
      onValueChange?.(next, details);
    },
    [controlledValue, disabled, multiple, onValueChange, value]
  );

  const contextValue = React.useMemo<AccordionContextValue>(
    () => ({
      disabled,
      isOpen: (itemValue) => value.includes(itemValue),
      moveFocus,
      registerTrigger,
      toggle,
    }),
    [disabled, moveFocus, registerTrigger, toggle, value]
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <box flexDirection="column">{children}</box>
    </AccordionContext.Provider>
  );
};

export interface AccordionItemProps {
  children: React.ReactNode;
  disabled?: boolean;
  onOpenChange?: (open: boolean, details: PressDetails) => void;
  value: string;
}

export const AccordionItem = ({
  children,
  disabled = false,
  onOpenChange,
  value,
}: AccordionItemProps) => {
  const accordion = useAccordion();
  const open = accordion.isOpen(value);
  const contextValue = React.useMemo<AccordionItemContextValue>(
    () => ({
      disabled: accordion.disabled || disabled,
      onOpenChange,
      open,
      value,
    }),
    [accordion.disabled, disabled, onOpenChange, open, value]
  );
  return (
    <AccordionItemContext.Provider value={contextValue}>
      <box flexDirection="column" gap={1}>
        {children}
      </box>
    </AccordionItemContext.Provider>
  );
};

export interface AccordionTriggerProps extends InteractionProps {
  closedMark?: string;
  label: string;
  openMark?: string;
}

export const AccordionTrigger = ({
  autoFocus = false,
  closedMark = "›",
  disabled = false,
  id,
  isActive = true,
  label,
  openMark = "⌄",
}: AccordionTriggerProps) => {
  const accordion = useAccordion();
  const item = useAccordionItem();
  const { moveFocus, registerTrigger, toggle } = accordion;
  const theme = useTheme();
  const generatedId = React.useId();
  const interactionId = id ?? `accordion-trigger-${generatedId}`;
  const effectivelyDisabled = item.disabled || disabled;
  const interaction = useInteraction({
    autoFocus,
    disabled: effectivelyDisabled,
    id: interactionId,
    isActive,
    onInput: (key) => {
      if (key.name === "up") {
        moveFocus(interactionId, -1);
      } else if (key.name === "down") {
        moveFocus(interactionId, 1);
      } else if (key.name === "home") {
        moveFocus(interactionId, "first");
      } else if (key.name === "end") {
        moveFocus(interactionId, "last");
      }
    },
    onPress: (details) => {
      toggle(item.value, details);
      item.onOpenChange?.(!item.open, details);
    },
  });

  React.useEffect(
    () =>
      registerTrigger({
        disabled: effectivelyDisabled,
        focus: interaction.focus,
        id: interactionId,
      }),
    [effectivelyDisabled, interaction.focus, interactionId, registerTrigger]
  );

  return (
    <box {...interaction.interactionProps} flexDirection="row" gap={1}>
      <text
        fg={
          interaction.isFocused ? theme.colors.focusRing : theme.colors.primary
        }
      >
        {item.open ? openMark : closedMark}
      </text>
      <text
        fg={
          effectivelyDisabled
            ? theme.colors.mutedForeground
            : theme.colors.foreground
        }
      >
        {interaction.isFocused ? <b>{label}</b> : label}
      </text>
    </box>
  );
};

export interface AccordionContentProps {
  children: React.ReactNode;
  keepMounted?: boolean;
  paddingLeft?: number;
}

export const AccordionContent = ({
  children,
  keepMounted = false,
  paddingLeft = 2,
}: AccordionContentProps) => {
  const item = useAccordionItem();
  if (!(item.open || keepMounted)) {
    return null;
  }
  return (
    <box
      display={item.open ? "flex" : "none"}
      flexDirection="column"
      paddingLeft={paddingLeft}
    >
      {children}
    </box>
  );
};

export const AccordionPanel = AccordionContent;
