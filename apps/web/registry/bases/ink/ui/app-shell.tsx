import { useCursor, Box, Text } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";
import {
  graphemeLength,
  removeGraphemeBefore,
  terminalWidth,
} from "@/registry/bases/ink/lib/terminal-text";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface AppShellProps {
  children: ReactNode;
  fullscreen?: boolean;
}

export interface AppShellHeaderProps {
  children: ReactNode;
}

export interface AppShellTipProps {
  children: ReactNode;
}

export interface AppShellInputProps extends InteractionProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  borderStyle?: BorderStyle;
  borderColor?: string;
  prefix?: string;
  readOnly?: boolean;
  required?: boolean;
  cursorOrigin?: { x: number; y: number };
  "aria-label"?: string;
}

export interface AppShellContentProps extends InteractionProps {
  children: ReactNode;
  autoscroll?: boolean;
  height?: number;
  "aria-label"?: string;
}

export interface AppShellHintsProps {
  items?: string[];
  children?: ReactNode;
}

const AppShellRoot = ({ children }: AppShellProps) => (
  <Box flexDirection="column" flexGrow={1} aria-role="list">
    {children}
  </Box>
);

const AppShellHeader = ({ children }: AppShellHeaderProps) => (
  <Box flexDirection="column">{children}</Box>
);

const AppShellTip = ({ children }: AppShellTipProps) => (
  <Box paddingLeft={2} paddingY={0}>
    <Text dimColor>{"  Tip: "}</Text>
    <Text dimColor>{children}</Text>
  </Box>
);

const AppShellInput = ({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onChange,
  onSubmit,
  placeholder = "Type something...",
  borderStyle = "single",
  borderColor,
  prefix = ">",
  readOnly,
  required,
  cursorOrigin,
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = "Command input",
}: AppShellInputProps) => {
  const unicode = useUnicode();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const theme = useTheme();
  const { setCursorPosition } = useCursor();
  const value = controlledValue ?? internalValue;

  const updateValue = (next: string) => {
    if (controlledValue === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
    onChange?.(next);
  };

  const { isFocused } = useInteraction(
    (input, key) => {
      if (key.return) {
        onSubmit?.(value);
        if (controlledValue === undefined) {
          updateValue("");
        }
        return;
      }
      if (readOnly) {
        return;
      }
      if (key.backspace || key.delete) {
        updateValue(removeGraphemeBefore(value, graphemeLength(value)).value);
        return;
      }
      if (key.escape || key.upArrow || key.downArrow || key.tab) {
        return;
      }
      if (input && !key.ctrl && !key.meta) {
        updateValue(value + input);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  React.useEffect(() => {
    if (isFocused && cursorOrigin) {
      setCursorPosition({
        x:
          cursorOrigin.x +
          terminalWidth(prefix ? `${prefix} ` : "") +
          terminalWidth(value),
        y: cursorOrigin.y,
      });
    }
  }, [cursorOrigin, isFocused, prefix, setCursorPosition, value]);

  return (
    <Box
      borderStyle={resolveBorderStyle(borderStyle, unicode)}
      borderColor={borderColor ?? theme.colors.border}
      flexDirection="row"
      paddingX={1}
      aria-role="textbox"
      aria-label={ariaLabel}
      aria-state={{
        disabled: disabled || undefined,
        readonly: readOnly || undefined,
        required: required || undefined,
      }}
    >
      {prefix && (
        <Text aria-hidden color={theme.colors.primary} bold>
          {`${prefix} `}
        </Text>
      )}
      <Text>{value || <Text dimColor>{placeholder}</Text>}</Text>
      {isFocused && !cursorOrigin && (
        <Text aria-hidden color={theme.colors.focusRing}>
          {unicode ? "█" : "|"}
        </Text>
      )}
    </Box>
  );
};

const AppShellContent = ({
  children,
  height = 20,
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = "Application content",
}: AppShellContentProps) => {
  const [scrollTop, setScrollTop] = useState(0);

  const { isFocused } = useInteraction(
    (_input, key) => {
      if (key.upArrow) {
        setScrollTop((s) => Math.max(0, s - 1));
      } else if (key.downArrow) {
        setScrollTop((s) => s + 1);
      } else if (key.home) {
        setScrollTop(0);
      } else if (key.pageUp) {
        setScrollTop((value) => Math.max(0, value - height));
      } else if (key.pageDown) {
        setScrollTop((value) => value + height);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  return (
    <Box
      flexDirection="row"
      height={height}
      overflow="hidden"
      aria-role="list"
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text
        aria-label={`${ariaLabel}. Offset ${scrollTop}.${isFocused ? " Focused." : ""}`}
      >
        {""}
      </Text>
      <Box flexGrow={1} flexDirection="column" marginTop={-scrollTop as number}>
        {children}
      </Box>
    </Box>
  );
};

const AppShellHints = ({ items, children }: AppShellHintsProps) => {
  const theme = useTheme();
  const content = items ? items.join(" | ") : children;
  return (
    <Box paddingX={1}>
      <Text dimColor color={theme.colors.mutedForeground}>
        {content as string}
      </Text>
    </Box>
  );
};

export const AppShell = Object.assign(AppShellRoot, {
  Content: AppShellContent,
  Header: AppShellHeader,
  Hints: AppShellHints,
  Input: AppShellInput,
  Tip: AppShellTip,
});
