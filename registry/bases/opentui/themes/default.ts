import type { Theme } from "@/registry/bases/opentui/ui/types";

export const defaultTheme: Theme = {
  border: {
    color: "#4B5563",
    focusColor: "#8B5CF6",
    style: "rounded",
  },
  colors: {
    accent: "#8B5CF6",
    accentForeground: "#FFFFFF",
    background: "#000000",
    border: "#4B5563",
    error: "#EF4444",
    errorForeground: "#FFFFFF",

    focusRing: "#8B5CF6",
    foreground: "#FFFFFF",
    info: "#3B82F6",
    infoForeground: "#FFFFFF",
    muted: "#374151",
    mutedForeground: "#9CA3AF",
    primary: "#7C3AED",
    primaryForeground: "#FFFFFF",

    secondary: "#6B7280",
    secondaryForeground: "#FFFFFF",
    selection: "#7C3AED",
    selectionForeground: "#FFFFFF",
    success: "#10B981",

    successForeground: "#FFFFFF",
    warning: "#F59E0B",
    warningForeground: "#000000",
  },
  name: "default",
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
