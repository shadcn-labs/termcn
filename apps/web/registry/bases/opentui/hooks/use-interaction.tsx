import { useKeyboard } from "@opentui/react";
import * as React from "react";

export interface InteractionProps {
  autoFocus?: boolean;
  disabled?: boolean;
  id?: string;
  isActive?: boolean;
}

export interface KeyEvent {
  ctrl?: boolean;
  defaultPrevented?: boolean;
  eventType?: "press" | "release" | "repeat" | string;
  hyper?: boolean;
  meta?: boolean;
  name: string;
  option?: boolean;
  raw?: string;
  repeated?: boolean;
  sequence?: string;
  shift?: boolean;
  super?: boolean;
}

export type PressDetails =
  | Readonly<{ source: "imperative" }>
  | Readonly<{ key: "enter" | "space"; source: "keyboard" }>
  | Readonly<{ button: 0; source: "pointer" }>;

interface MouseEventLike {
  button?: number;
  defaultPrevented?: boolean;
}

export interface PasteEventLike {
  bytes: Uint8Array;
  defaultPrevented?: boolean;
  preventDefault?: () => void;
}

export interface FocusableRenderable {
  blur: () => void;
  focus: () => void;
  focused?: boolean;
  isFocused?: () => boolean;
  on?: (event: string, listener: () => void) => void;
  off?: (event: string, listener: () => void) => void;
  addEventListener?: (event: string, listener: () => void) => void;
  removeEventListener?: (event: string, listener: () => void) => void;
}

export interface UseInteractionOptions extends InteractionProps {
  onFocusChange?: (focused: boolean) => void;
  onInput?: (key: KeyEvent) => void;
  onPaste?: (event: PasteEventLike) => void;
  onPress?: (details: PressDetails) => void;
}

export interface InteractionBindings {
  focusable: boolean;
  focused: boolean;
  id: string;
  onMouseDown: (event: MouseEventLike) => void;
  onMouseOut: () => void;
  onMouseUp: (event: MouseEventLike) => void;
  onPaste: (event: PasteEventLike) => void;
  ref: React.RefCallback<FocusableRenderable>;
}

export interface UseInteractionResult {
  focus: () => void;
  id: string;
  interactionProps: InteractionBindings;
  isFocused: boolean;
  isPressed: boolean;
  press: () => void;
}

const isModified = (key: KeyEvent): boolean =>
  Boolean(
    key.ctrl || key.meta || key.option || key.shift || key.super || key.hyper
  );

export const activationKey = (key: KeyEvent): "enter" | "space" | undefined => {
  if (key.defaultPrevented || key.eventType === "release" || isModified(key)) {
    return;
  }
  if (key.name === "return" || key.name === "enter") {
    return "enter";
  }
  if (key.name === "space" || key.name === " ") {
    return "space";
  }
};

export const printableKey = (key: KeyEvent): string | undefined => {
  if (
    key.defaultPrevented ||
    key.eventType === "release" ||
    key.ctrl ||
    key.meta ||
    key.option ||
    key.super ||
    key.hyper
  ) {
    return;
  }
  if (key.name === "space" || key.name === " ") {
    return " ";
  }
  if (key.sequence && !key.sequence.startsWith("\u001B")) {
    return key.sequence;
  }
  if (key.name.length !== 1) {
    return;
  }
  return key.shift ? key.name.toUpperCase() : key.name;
};

/**
 * Focus-gated OpenTUI keyboard and pointer interaction.
 *
 * OpenTUI's useKeyboard hook is renderer-global, so reusable controls must
 * gate their handlers on actual focus. The returned bindings belong on the
 * control's focusable root box.
 */
export const useInteraction = ({
  autoFocus = false,
  disabled = false,
  id: providedId,
  isActive = true,
  onFocusChange,
  onInput,
  onPaste,
  onPress,
}: UseInteractionOptions): UseInteractionResult => {
  const reactId = React.useId();
  const id = providedId ?? `termcn-control-${reactId}`;
  const renderableRef = React.useRef<FocusableRenderable>(null);
  const focusSubscriptionRef = React.useRef<(() => void) | null>(null);
  const onFocusChangeRef = React.useRef(onFocusChange);
  const pointerPressedRef = React.useRef(false);
  const enabled = isActive && !disabled;
  const [isFocused, setIsFocused] = React.useState(autoFocus && enabled);
  const [isPressed, setIsPressed] = React.useState(false);
  onFocusChangeRef.current = onFocusChange;

  const clearPointerPress = React.useCallback(() => {
    pointerPressedRef.current = false;
    setIsPressed(false);
  }, []);

  const setRenderableRef = React.useCallback(
    (renderable: FocusableRenderable | null) => {
      focusSubscriptionRef.current?.();
      focusSubscriptionRef.current = null;
      renderableRef.current = renderable;

      if (!renderable) {
        setIsFocused(false);
        return;
      }

      const handleFocus = () => {
        setIsFocused(true);
        onFocusChangeRef.current?.(true);
      };
      const handleBlur = () => {
        setIsFocused(false);
        clearPointerPress();
        onFocusChangeRef.current?.(false);
      };

      if (renderable.on && renderable.off) {
        renderable.on("focused", handleFocus);
        renderable.on("blurred", handleBlur);
        focusSubscriptionRef.current = () => {
          renderable.off?.("focused", handleFocus);
          renderable.off?.("blurred", handleBlur);
        };
      } else if (
        renderable.addEventListener &&
        renderable.removeEventListener
      ) {
        renderable.addEventListener("focus", handleFocus);
        renderable.addEventListener("blur", handleBlur);
        focusSubscriptionRef.current = () => {
          renderable.removeEventListener?.("focus", handleFocus);
          renderable.removeEventListener?.("blur", handleBlur);
        };
      }

      setIsFocused(
        renderable.isFocused?.() ?? renderable.focused ?? (autoFocus && enabled)
      );
    },
    [autoFocus, clearPointerPress, enabled]
  );

  const focus = React.useCallback(() => {
    if (!enabled) {
      return;
    }
    renderableRef.current?.focus();
    setIsFocused(
      renderableRef.current?.isFocused?.() ??
        renderableRef.current?.focused ??
        true
    );
  }, [enabled]);

  const press = React.useCallback(() => {
    if (!enabled) {
      return;
    }
    onPress?.(Object.freeze({ source: "imperative" }));
  }, [enabled, onPress]);

  React.useEffect(() => {
    if (!(enabled && autoFocus)) {
      return;
    }
    focus();
  }, [autoFocus, enabled, focus]);

  React.useEffect(() => {
    if (enabled) {
      return;
    }
    renderableRef.current?.blur();
    setIsFocused(false);
    clearPointerPress();
  }, [clearPointerPress, enabled]);

  React.useEffect(
    () => () => {
      focusSubscriptionRef.current?.();
      focusSubscriptionRef.current = null;
    },
    []
  );

  useKeyboard((key: KeyEvent) => {
    if (!(enabled && isFocused) || key.eventType === "release") {
      return;
    }

    const activation = activationKey(key);
    if (activation && onPress) {
      onPress(
        Object.freeze({
          key: activation,
          source: "keyboard",
        })
      );
      return;
    }

    if (!key.defaultPrevented) {
      onInput?.(key);
    }
  });

  const onMouseDown = React.useCallback(
    (event: MouseEventLike) => {
      if (
        !enabled ||
        event.defaultPrevented ||
        (event.button !== undefined && event.button !== 0)
      ) {
        return;
      }
      pointerPressedRef.current = true;
      setIsPressed(true);
      focus();
    },
    [enabled, focus]
  );

  const onMouseUp = React.useCallback(
    (event: MouseEventLike) => {
      const shouldPress =
        enabled &&
        pointerPressedRef.current &&
        !event.defaultPrevented &&
        (event.button === undefined || event.button === 0);
      clearPointerPress();
      if (!shouldPress) {
        return;
      }
      focus();
      onPress?.(Object.freeze({ button: 0, source: "pointer" }));
    },
    [clearPointerPress, enabled, focus, onPress]
  );

  const handlePaste = React.useCallback(
    (event: PasteEventLike) => {
      if (enabled && isFocused && !event.defaultPrevented) {
        onPaste?.(event);
      }
    },
    [enabled, isFocused, onPaste]
  );

  const interactionProps = React.useMemo<InteractionBindings>(
    () => ({
      focusable: enabled,
      focused: enabled && isFocused,
      id,
      onMouseDown,
      onMouseOut: clearPointerPress,
      onMouseUp,
      onPaste: handlePaste,
      ref: setRenderableRef,
    }),
    [
      clearPointerPress,
      enabled,
      id,
      isFocused,
      handlePaste,
      onMouseDown,
      onMouseUp,
      setRenderableRef,
    ]
  );

  return {
    focus,
    id,
    interactionProps,
    isFocused,
    isPressed,
    press,
  };
};
