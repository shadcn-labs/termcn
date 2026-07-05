import type { Theme } from "@/registry/bases/ink/ui/types";

export const catppuccinTheme: Theme = {
  border: {
    color: "#45475A",
    focusColor: "#CBA6F7",
    style: "round",
  },
  colors: {
    accent: "#F38BA8",
    accentForeground: "#1E1E2E",
    background: "#1E1E2E",
    border: "#45475A",
    error: "#F38BA8",
    errorForeground: "#1E1E2E",

    focusRing: "#CBA6F7",
    foreground: "#CDD6F4",
    info: "#89B4FA",
    infoForeground: "#1E1E2E",
    muted: "#313244",
    mutedForeground: "#6C7086",
    primary: "#CBA6F7",
    primaryForeground: "#1E1E2E",

    secondary: "#89B4FA",
    secondaryForeground: "#1E1E2E",
    selection: "#313244",
    selectionForeground: "#CDD6F4",
    success: "#A6E3A1",

    successForeground: "#1E1E2E",
    warning: "#F9E2AF",
    warningForeground: "#1E1E2E",
  },
  name: "catppuccin",
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
