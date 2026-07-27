import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import type { terminalThemeMap } from "@/lib/terminal-themes";

export type TerminalThemeKey = keyof typeof terminalThemeMap;

const terminalThemeAtom = atomWithStorage<TerminalThemeKey>(
  "terminal-theme",
  "default"
);

export const useTerminalTheme = () => useAtom(terminalThemeAtom);
