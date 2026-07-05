import type { Theme } from "@/components/ui/ink-theme-provider";

export const nordTheme: Theme = {
  border: {
    color: "#4C566A",
    focusColor: "#88C0D0",
    style: "round",
  },
  colors: {
    accent: "#81A1C1",
    accentForeground: "#2E3440",
    background: "#2E3440",
    border: "#4C566A",
    error: "#BF616A",
    errorForeground: "#ECEFF4",

    focusRing: "#88C0D0",
    foreground: "#ECEFF4",
    info: "#5E81AC",
    infoForeground: "#ECEFF4",
    muted: "#3B4252",
    mutedForeground: "#4C566A",
    primary: "#88C0D0",
    primaryForeground: "#2E3440",

    secondary: "#4C566A",
    secondaryForeground: "#ECEFF4",
    selection: "#3B4252",
    selectionForeground: "#ECEFF4",
    success: "#A3BE8C",

    successForeground: "#2E3440",
    warning: "#EBCB8B",
    warningForeground: "#2E3440",
  },
  name: "nord",
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
