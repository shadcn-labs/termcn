/* @jsxImportSource @opentui/react */
import * as React from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import { useInteraction } from "@/registry/bases/opentui/hooks/use-interaction";
import type {
  InteractionProps,
  PressDetails,
} from "@/registry/bases/opentui/hooks/use-interaction";

interface ItemRegistration {
  disabled: boolean;
  focus: () => void;
  id: string;
}

interface ToggleGroupContextValue {
  disabled: boolean;
  isPressed: (value: string) => boolean;
  moveFocus: (currentId: string, target: -1 | 1 | "first" | "last") => void;
  orientation: "horizontal" | "vertical";
  registerItem: (item: ItemRegistration) => () => void;
  toggle: (value: string, details: PressDetails) => void;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(
  null
);

const useToggleGroup = () => {
  const value = React.useContext(ToggleGroupContext);
  if (!value) {
    throw new Error("ToggleGroupItem must be rendered inside <ToggleGroup>.");
  }
  return value;
};

export interface ToggleGroupProps {
  children: React.ReactNode;
  defaultValue?: readonly string[];
  disabled?: boolean;
  loopFocus?: boolean;
  multiple?: boolean;
  onValueChange?: (value: readonly string[], details: PressDetails) => void;
  orientation?: "horizontal" | "vertical";
  value?: readonly string[];
}

export const ToggleGroup = ({
  children,
  defaultValue = [],
  disabled = false,
  loopFocus = true,
  multiple = false,
  onValueChange,
  orientation = "horizontal",
  value: controlledValue,
}: ToggleGroupProps) => {
  const [internalValue, setInternalValue] = React.useState(() =>
    multiple ? [...new Set(defaultValue)] : defaultValue.slice(0, 1)
  );
  const value = controlledValue ?? internalValue;
  const itemsRef = React.useRef<ItemRegistration[]>([]);

  const registerItem = React.useCallback((item: ItemRegistration) => {
    const existing = itemsRef.current.findIndex(
      (entry) => entry.id === item.id
    );
    if (existing === -1) {
      itemsRef.current.push(item);
    } else {
      itemsRef.current[existing] = item;
    }
    return () => {
      itemsRef.current = itemsRef.current.filter(
        (entry) => entry.id !== item.id
      );
    };
  }, []);

  const moveFocus = React.useCallback(
    (currentId: string, target: -1 | 1 | "first" | "last") => {
      const enabled = itemsRef.current.filter((item) => !item.disabled);
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
      const currentIndex = enabled.findIndex((item) => item.id === currentId);
      const candidate = currentIndex + target;
      if (!loopFocus && (candidate < 0 || candidate >= enabled.length)) {
        return;
      }
      enabled[(candidate + enabled.length) % enabled.length]?.focus();
    },
    [loopFocus]
  );

  const toggle = React.useCallback(
    (itemValue: string, details: PressDetails) => {
      if (disabled) {
        return;
      }
      const pressed = value.includes(itemValue);
      const next = pressed
        ? value.filter((entry) => entry !== itemValue)
        : multiple
          ? [...value, itemValue]
          : [itemValue];
      if (controlledValue === undefined) {
        setInternalValue(next);
      }
      onValueChange?.(next, details);
    },
    [controlledValue, disabled, multiple, onValueChange, value]
  );

  const contextValue = React.useMemo<ToggleGroupContextValue>(
    () => ({
      disabled,
      isPressed: (itemValue) => value.includes(itemValue),
      moveFocus,
      orientation,
      registerItem,
      toggle,
    }),
    [disabled, moveFocus, orientation, registerItem, toggle, value]
  );

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <box
        flexDirection={orientation === "vertical" ? "column" : "row"}
        gap={1}
      >
        {children}
      </box>
    </ToggleGroupContext.Provider>
  );
};

export interface ToggleGroupItemProps extends InteractionProps {
  label: string;
  onPressedChange?: (pressed: boolean, details: PressDetails) => void;
  value: string;
}

export const ToggleGroupItem = ({
  autoFocus = false,
  disabled = false,
  id,
  isActive = true,
  label,
  onPressedChange,
  value,
}: ToggleGroupItemProps) => {
  const group = useToggleGroup();
  const { moveFocus, orientation, registerItem, toggle } = group;
  const theme = useTheme();
  const generatedId = React.useId();
  const interactionId = id ?? `toggle-group-item-${generatedId}`;
  const effectivelyDisabled = group.disabled || disabled;
  const pressed = group.isPressed(value);
  const interaction = useInteraction({
    autoFocus,
    disabled: effectivelyDisabled,
    id: interactionId,
    isActive,
    onInput: (key) => {
      const previousKey = orientation === "horizontal" ? "left" : "up";
      const nextKey = orientation === "horizontal" ? "right" : "down";
      if (key.name === previousKey) {
        moveFocus(interactionId, -1);
      } else if (key.name === nextKey) {
        moveFocus(interactionId, 1);
      } else if (key.name === "home") {
        moveFocus(interactionId, "first");
      } else if (key.name === "end") {
        moveFocus(interactionId, "last");
      }
    },
    onPress: (details) => {
      toggle(value, details);
      onPressedChange?.(!pressed, details);
    },
  });

  React.useEffect(
    () =>
      registerItem({
        disabled: effectivelyDisabled,
        focus: interaction.focus,
        id: interactionId,
      }),
    [effectivelyDisabled, interaction.focus, interactionId, registerItem]
  );

  const backgroundColor = pressed
    ? theme.colors.primary
    : interaction.isFocused
      ? theme.colors.muted
      : undefined;
  const foregroundColor = effectivelyDisabled
    ? theme.colors.mutedForeground
    : pressed
      ? theme.colors.primaryForeground
      : theme.colors.foreground;

  return (
    <box
      {...interaction.interactionProps}
      backgroundColor={backgroundColor}
      paddingLeft={1}
      paddingRight={1}
    >
      <text fg={foregroundColor}>
        {interaction.isFocused ? <b>{label}</b> : label}
      </text>
    </box>
  );
};
