import type { Theme } from "@/components/ui/opentui-theme-provider";

export const draculaTheme: Theme = {
  border: {
    color: "#6272A4",
    focusColor: "#BD93F9",
    style: "rounded",
  },
  colors: {
    accent: "#FF79C6",
    accentForeground: "#282A36",
    background: "#282A36",
    border: "#6272A4",
    error: "#FF5555",
    errorForeground: "#F8F8F2",

    focusRing: "#BD93F9",
    foreground: "#F8F8F2",
    info: "#8BE9FD",
    infoForeground: "#282A36",
    muted: "#44475A",
    mutedForeground: "#6272A4",
    primary: "#BD93F9",
    primaryForeground: "#282A36",

    secondary: "#6272A4",
    secondaryForeground: "#F8F8F2",
    selection: "#44475A",
    selectionForeground: "#F8F8F2",
    success: "#50FA7B",

    successForeground: "#282A36",
    warning: "#F1FA8C",
    warningForeground: "#282A36",
  },
  name: "dracula",
  spacing: {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    6: 6,
    8: 8,
  },
  typography: {
    base: "",
    bold: true,
    lg: "bold",
    sm: "dim",
    xl: "bold",
  },
};
