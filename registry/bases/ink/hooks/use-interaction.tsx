import { useFocus, useFocusManager, useInput, useStdout } from "ink";
import type { Key } from "ink";
import * as React from "react";

export type { Key } from "ink";

export interface InteractionProps {
  id?: string;
  autoFocus?: boolean;
  isActive?: boolean;
  disabled?: boolean;
}

export interface UseInteractionOptions extends InteractionProps {
  onInput?: (input: string, key: Key) => void;
}

export interface UseInteractionResult {
  isFocused: boolean;
  focus: () => void;
  id: string;
}

interface RegisteredControl {
  disabled: boolean;
  id: string;
}

interface FocusScopeContextValue {
  active: boolean;
  focus: (id: string) => void;
  focusedId?: string;
  isTopmost: boolean;
  register: (control: RegisteredControl) => () => void;
  setNestedActive: (scopeId: string, active: boolean) => void;
}

const FocusScopeContext = React.createContext<FocusScopeContextValue | null>(
  null
);

const lastFocusedByStdout = new WeakMap<object, string>();
const activeScopesByStdout = new WeakMap<object, Set<string>>();

const getEnabledControlIds = (controls: readonly RegisteredControl[]) =>
  controls.filter(({ disabled }) => !disabled).map(({ id }) => id);

export interface FocusScopeProps {
  active: boolean;
  initialFocusId?: string;
  returnFocusId?: string;
  loop?: boolean;
  onEscapeKey?: () => void;
  children: React.ReactNode;
}

export const FocusScope = ({
  active,
  initialFocusId,
  returnFocusId,
  loop = true,
  onEscapeKey,
  children,
}: FocusScopeProps) => {
  const generatedId = React.useId();
  const scopeId = `termcn-scope-${generatedId}`;
  const parentScope = React.useContext(FocusScopeContext);
  const parentIsActive = parentScope?.active ?? false;
  const setParentNestedActive = parentScope?.setNestedActive;
  const { stdout } = useStdout();
  const { disableFocus, enableFocus, focus: focusById } = useFocusManager();
  const controlsRef = React.useRef<RegisteredControl[]>([]);
  const nestedScopesRef = React.useRef(new Set<string>());
  const restoreFocusIdRef = React.useRef<string | null>(null);
  const [focusedId, setFocusedId] = React.useState<string>();
  const [registrationVersion, setRegistrationVersion] = React.useState(0);
  const [nestedScopeCount, setNestedScopeCount] = React.useState(0);
  const isTopmost = nestedScopeCount === 0;

  const register = React.useCallback((control: RegisteredControl) => {
    const existingIndex = controlsRef.current.findIndex(
      ({ id }) => id === control.id
    );
    if (existingIndex === -1) {
      controlsRef.current.push(control);
    } else {
      controlsRef.current[existingIndex] = control;
    }
    setRegistrationVersion((version) => version + 1);

    return () => {
      controlsRef.current = controlsRef.current.filter(
        ({ id }) => id !== control.id
      );
      setRegistrationVersion((version) => version + 1);
    };
  }, []);

  const setNestedActive = React.useCallback(
    (nestedScopeId: string, nestedActive: boolean) => {
      if (nestedActive) {
        nestedScopesRef.current.add(nestedScopeId);
      } else {
        nestedScopesRef.current.delete(nestedScopeId);
      }
      setNestedScopeCount(nestedScopesRef.current.size);
    },
    []
  );

  React.useEffect(() => {
    if (!(active && parentIsActive && setParentNestedActive)) {
      return;
    }

    setParentNestedActive(scopeId, true);
    return () => setParentNestedActive(scopeId, false);
  }, [active, parentIsActive, scopeId, setParentNestedActive]);

  React.useEffect(() => {
    if (!active) {
      return;
    }

    if (parentIsActive) {
      return;
    }

    restoreFocusIdRef.current =
      returnFocusId ?? lastFocusedByStdout.get(stdout) ?? null;
    disableFocus();

    const activeScopes = activeScopesByStdout.get(stdout) ?? new Set<string>();
    if (
      process.env.NODE_ENV !== "production" &&
      activeScopes.size > 0 &&
      !activeScopes.has(scopeId)
    ) {
      console.warn(
        "Termcn Ink: multiple non-nested focus scopes are active; only nested overlays are supported."
      );
    }
    activeScopes.add(scopeId);
    activeScopesByStdout.set(stdout, activeScopes);

    return () => {
      activeScopes.delete(scopeId);
      if (activeScopes.size === 0) {
        activeScopesByStdout.delete(stdout);
      }

      enableFocus();
      const restoreId = returnFocusId ?? restoreFocusIdRef.current;
      if (restoreId) {
        focusById(restoreId);
      }
    };
  }, [
    active,
    disableFocus,
    enableFocus,
    focusById,
    parentIsActive,
    returnFocusId,
    scopeId,
    stdout,
  ]);

  React.useEffect(() => {
    if (!active) {
      setFocusedId(undefined);
      return;
    }

    const enabledIds = getEnabledControlIds(controlsRef.current);
    if (enabledIds.length === 0) {
      setFocusedId(undefined);
      return;
    }

    setFocusedId((currentId) => {
      if (currentId && enabledIds.includes(currentId)) {
        return currentId;
      }

      return initialFocusId && enabledIds.includes(initialFocusId)
        ? initialFocusId
        : enabledIds[0];
    });
  }, [active, initialFocusId, registrationVersion]);

  useInput(
    (input, key) => {
      if (key.eventType === "release") {
        return;
      }

      if (key.escape) {
        onEscapeKey?.();
        return;
      }

      if (!(key.tab || input === "\t")) {
        return;
      }

      const enabledIds = getEnabledControlIds(controlsRef.current);
      if (enabledIds.length === 0) {
        return;
      }

      const currentIndex = focusedId ? enabledIds.indexOf(focusedId) : -1;
      const direction = key.shift ? -1 : 1;
      let nextIndex = currentIndex + direction;

      nextIndex = loop
        ? (nextIndex + enabledIds.length) % enabledIds.length
        : Math.max(0, Math.min(nextIndex, enabledIds.length - 1));

      setFocusedId(enabledIds[nextIndex]);
    },
    { isActive: active && isTopmost }
  );

  const contextValue = React.useMemo<FocusScopeContextValue>(
    () => ({
      active,
      focus: setFocusedId,
      focusedId,
      isTopmost,
      register,
      setNestedActive,
    }),
    [active, focusedId, isTopmost, register, setNestedActive]
  );

  return (
    <FocusScopeContext.Provider value={contextValue}>
      {children}
    </FocusScopeContext.Provider>
  );
};

export function useInteraction(
  options: UseInteractionOptions
): UseInteractionResult;
export function useInteraction(
  onInput: (input: string, key: Key) => void,
  options?: InteractionProps
): UseInteractionResult;
export function useInteraction(
  optionsOrHandler: UseInteractionOptions | ((input: string, key: Key) => void),
  legacyOptions: InteractionProps = {}
): UseInteractionResult {
  const options =
    typeof optionsOrHandler === "function"
      ? { ...legacyOptions, onInput: optionsOrHandler }
      : optionsOrHandler;
  const {
    id: providedId,
    autoFocus = false,
    isActive = true,
    disabled = false,
    onInput,
  } = options;
  const reactId = React.useId();
  const id = providedId ?? `termcn-control-${reactId}`;
  const scope = React.useContext(FocusScopeContext);
  const scopeRegister = scope?.register;
  const { stdout } = useStdout();
  const enabled = isActive && !disabled;
  const nativeFocus = useFocus({
    autoFocus: scope ? false : autoFocus,
    id,
    isActive: scope ? false : enabled,
  });
  const isFocused = scope
    ? scope.active && scope.isTopmost && scope.focusedId === id
    : nativeFocus.isFocused;

  React.useEffect(() => {
    if (!scopeRegister) {
      return;
    }

    return scopeRegister({ disabled: !enabled, id });
  }, [enabled, id, scopeRegister]);

  React.useEffect(() => {
    if (isFocused && !scope) {
      lastFocusedByStdout.set(stdout, id);
    }
  }, [id, isFocused, scope, stdout]);

  useInput(
    (input, key) => {
      if (key.eventType === "release") {
        return;
      }
      onInput?.(input, key);
    },
    { isActive: enabled && isFocused && Boolean(onInput) }
  );

  const focus = React.useCallback(() => {
    if (!enabled) {
      return;
    }

    if (scope) {
      scope.focus(id);
    } else {
      nativeFocus.focus(id);
    }
  }, [enabled, id, nativeFocus, scope]);

  return { focus, id, isFocused };
}

export const isActivationKey = (input: string, key: Key): boolean =>
  key.eventType !== "release" && (key.return || input === " ");
