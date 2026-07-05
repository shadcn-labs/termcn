import type { Theme } from "@/registry/bases/opentui/ui/types";

export const tokyoNightTheme: Theme = {
  border: {
    color: "#3B4261",
    focusColor: "#7AA2F7",
    style: "rounded",
  },
  colors: {
    accent: "#BB9AF7",
    accentForeground: "#1A1B26",
    background: "#24283B",
    border: "#3B4261",
    error: "#F7768E",
    errorForeground: "#1A1B26",

    focusRing: "#7AA2F7",
    foreground: "#C0CAF5",
    info: "#7DCFFF",
    infoForeground: "#1A1B26",
    muted: "#1F2335",
    mutedForeground: "#565F89",
    primary: "#7AA2F7",
    primaryForeground: "#1A1B26",

    secondary: "#BB9AF7",
    secondaryForeground: "#1A1B26",
    selection: "#364A82",
    selectionForeground: "#C0CAF5",
    success: "#9ECE6A",

    successForeground: "#1A1B26",
    warning: "#E0AF68",
    warningForeground: "#1A1B26",
  },
  name: "tokyo-night",
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
