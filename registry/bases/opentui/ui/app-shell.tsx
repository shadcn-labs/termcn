/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/components/ui/opentui-theme-provider";

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

export interface AppShellInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  borderStyle?: BorderStyle;
  borderColor?: string;
  prefix?: string;
}

export interface AppShellContentProps {
  children: ReactNode;
  autoscroll?: boolean;
  height?: number;
}

export interface AppShellHintsProps {
  items?: string[];
  children?: ReactNode;
}

const AppShellRoot = ({ children }: AppShellProps) => (
  <box flexDirection="column" flexGrow={1}>
    {children}
  </box>
);

const AppShellHeader = ({ children }: AppShellHeaderProps) => (
  <box flexDirection="column">{children}</box>
);

const AppShellTip = ({ children }: AppShellTipProps) => (
  <box paddingLeft={2} paddingTop={0} paddingBottom={0}>
    <text fg="#666">{"  Tip: "}</text>
    <text fg="#666">{children}</text>
  </box>
);

const AppShellInput = ({
  value: controlledValue,
  onChange,
  onSubmit,
  placeholder = "Type something...",
  borderStyle = "single",
  borderColor,
  prefix = ">",
}: AppShellInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const theme = useTheme();
  const value = controlledValue ?? internalValue;

  useKeyboard((key) => {
    if (key.name === "return") {
      onSubmit?.(value);
      if (!controlledValue) {
        setInternalValue("");
      }
      return;
    }
    if (key.name === "backspace" || key.name === "delete") {
      const next = value.slice(0, -1);
      if (onChange) {
        onChange(next);
      } else {
        setInternalValue(next);
      }
      return;
    }
    if (
      key.name === "escape" ||
      key.name === "up" ||
      key.name === "down" ||
      key.name === "tab"
    ) {
      return;
    }
    if (key.name.length > 1) {
      return;
    }
    const next = value + key.name;
    if (onChange) {
      onChange(next);
    } else {
      setInternalValue(next);
    }
  });

  return (
    <box
      borderColor={borderColor ?? theme.colors.border}
      flexDirection="row"
      paddingLeft={1}
      paddingRight={1}
    >
      {prefix && (
        <text fg={theme.colors.primary}>
          <b>{`${prefix} `}</b>
        </text>
      )}
      <text>{value || <text fg="#666">{placeholder}</text>}</text>
      <text fg={theme.colors.focusRing}>█</text>
    </box>
  );
};

const AppShellContent = ({ children, height = 20 }: AppShellContentProps) => {
  const [scrollTop, setScrollTop] = useState(0);

  useKeyboard((key) => {
    if (key.name === "up") {
      setScrollTop((s) => Math.max(0, s - 1));
    } else if (key.name === "down") {
      setScrollTop((s) => s + 1);
    }
  });

  return (
    <box flexDirection="row" overflow="hidden">
      <box flexGrow={1} flexDirection="column" marginTop={-scrollTop as number}>
        {children}
      </box>
    </box>
  );
};

const AppShellHints = ({ items, children }: AppShellHintsProps) => {
  const theme = useTheme();
  const content = items ? items.join(" | ") : children;
  return (
    <box paddingLeft={1} paddingRight={1}>
      <text fg={theme.colors.mutedForeground}>{content as string}</text>
    </box>
  );
};

export const AppShell = Object.assign(AppShellRoot, {
  Content: AppShellContent,
  Header: AppShellHeader,
  Hints: AppShellHints,
  Input: AppShellInput,
  Tip: AppShellTip,
});
