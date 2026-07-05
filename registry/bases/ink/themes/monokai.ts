import type { Theme } from "@/registry/bases/ink/ui/types";

export const monokaiTheme: Theme = {
  border: {
    color: "#75715E",
    focusColor: "#A6E22E",
    style: "round",
  },
  colors: {
    accent: "#FD971F",
    accentForeground: "#272822",
    background: "#272822",
    border: "#75715E",
    error: "#F92672",
    errorForeground: "#F8F8F2",

    focusRing: "#A6E22E",
    foreground: "#F8F8F2",
    info: "#66D9E8",
    infoForeground: "#272822",
    muted: "#3E3D32",
    mutedForeground: "#75715E",
    primary: "#A6E22E",
    primaryForeground: "#272822",

    secondary: "#66D9E8",
    secondaryForeground: "#272822",
    selection: "#49483E",
    selectionForeground: "#F8F8F2",
    success: "#A6E22E",

    successForeground: "#272822",
    warning: "#E6DB74",
    warningForeground: "#272822",
  },
  name: "monokai",
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
