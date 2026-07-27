"use client";

import { useCallback } from "react";

import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useTerminalTheme } from "@/hooks/use-terminal-theme";
import type { TerminalThemeKey } from "@/hooks/use-terminal-theme";
import { terminalThemeOptions } from "@/lib/terminal-themes";

export const TerminalTheme = () => {
  const [terminalThemeKey, setTerminalThemeKey] = useTerminalTheme();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as TerminalThemeKey;
      setTerminalThemeKey(value);
    },
    [setTerminalThemeKey]
  );

  return (
    <NativeSelect size="sm" value={terminalThemeKey} onChange={handleChange}>
      {terminalThemeOptions.map((theme) => (
        <NativeSelectOption key={theme.value} value={theme.value}>
          {theme.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
};
