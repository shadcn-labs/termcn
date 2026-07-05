import type { Theme } from "@/components/ui/ink-theme-provider";

export const solarizedTheme: Theme = {
  border: {
    color: "#586E75",
    focusColor: "#268BD2",
    style: "round",
  },
  colors: {
    accent: "#CB4B16",
    accentForeground: "#FDF6E3",
    background: "#002B36",
    border: "#586E75",
    error: "#DC322F",
    errorForeground: "#FDF6E3",

    focusRing: "#268BD2",
    foreground: "#839496",
    info: "#2AA198",
    infoForeground: "#FDF6E3",
    muted: "#073642",
    mutedForeground: "#586E75",
    primary: "#268BD2",
    primaryForeground: "#FDF6E3",

    secondary: "#2AA198",
    secondaryForeground: "#FDF6E3",
    selection: "#073642",
    selectionForeground: "#93A1A1",
    success: "#859900",

    successForeground: "#FDF6E3",
    warning: "#B58900",
    warningForeground: "#FDF6E3",
  },
  name: "solarized",
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
