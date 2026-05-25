/* @jsxImportSource @opentui/react */
import * as React from "react";

import { defaultTheme } from "@/lib/terminal-themes/default";

type BorderStyle =
  | "single"
  | "double"
  | "round"
  | "bold"
  | "singleDouble"
  | "doubleSingle"
  | "classic";

export interface ColorTokens {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  error: string;
  errorForeground: string;
  info: string;
  infoForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  focusRing: string;
  selection: string;
  selectionForeground: string;
}

export interface SpacingTokens {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
  6: number;
  8: number;
}

export interface TypographyTokens {
  bold: boolean;
  sm: string;
  base: string;
  lg: string;
  xl: string;
}

export interface BorderTokens {
  style: BorderStyle;
  color: string;
  focusColor: string;
}

export interface Theme {
  name: string;
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  border: BorderTokens;
}

export interface MotionContextValue {
  reduced: boolean;
}

export interface UnicodeContextValue {
  unicode: boolean;
}

const getEnv = (name: string): string | undefined =>
  typeof process !== "undefined" && process.env ? process.env[name] : undefined;

export const isReducedMotion = (): boolean =>
  getEnv("NO_MOTION") === "1" || getEnv("CI") === "true";

const detectUnicodeSupport = (): boolean => {
  if (typeof window !== "undefined") {
    return true;
  }

  if (getEnv("NO_UNICODE") === "1" || getEnv("NO_UNICODE") === "true") {
    return false;
  }

  const platform =
    typeof process !== "undefined" && process.platform
      ? process.platform
      : "browser";

  if (getEnv("WSL_DISTRO_NAME")) {
    return true;
  }
  if (getEnv("WT_SESSION")) {
    return true;
  }
  if (getEnv("TERM_PROGRAM") === "vscode") {
    return true;
  }
  if (getEnv("MSYSTEM")) {
    return false;
  }
  if (platform === "darwin" || platform === "linux") {
    return true;
  }

  return true;
};

export const isNoUnicode = (): boolean => !detectUnicodeSupport();

export const MotionContext = React.createContext<MotionContextValue>({
  reduced: isReducedMotion(),
});

export const UnicodeContext = React.createContext<UnicodeContextValue>({
  unicode: !isNoUnicode(),
});

export const useMotion = (): MotionContextValue =>
  React.useContext(MotionContext);

export const useUnicode = (): boolean =>
  React.useContext(UnicodeContext).unicode;

interface ThemeContextValue {
  setTheme: (theme: Theme) => void;
  theme: Theme;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  setTheme: () => {
    /* noop */
  },
  theme: defaultTheme,
});

export interface ThemeProviderProps {
  children: React.ReactNode;
  noUnicode?: boolean;
  reducedMotion?: boolean;
  theme?: Theme;
}

export const detectColorScheme = (): "dark" | "light" => {
  const colorFgBg = getEnv("COLORFGBG");
  if (colorFgBg) {
    const parts = colorFgBg.split(";");
    const background = Number.parseInt(parts.at(-1) ?? "0", 10);
    if (!Number.isNaN(background)) {
      return background <= 6 ? "dark" : "light";
    }
  }

  const termBackground = getEnv("TERM_BACKGROUND");
  if (termBackground === "light") {
    return "light";
  }
  if (termBackground === "dark") {
    return "dark";
  }

  return "dark";
};

export interface AutoThemeProviderProps {
  children: React.ReactNode;
  darkTheme: Theme;
  lightTheme: Theme;
}

export const ThemeProvider = ({
  children,
  noUnicode,
  reducedMotion,
  theme = defaultTheme,
}: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = React.useState(theme);

  React.useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  const motionValue = React.useMemo(
    () => ({ reduced: reducedMotion ?? isReducedMotion() }),
    [reducedMotion]
  );

  const unicodeValue = React.useMemo(
    () => ({
      unicode: noUnicode === undefined ? !isNoUnicode() : !noUnicode,
    }),
    [noUnicode]
  );

  const themeValue = React.useMemo(
    () => ({ setTheme: setCurrentTheme, theme: currentTheme }),
    [currentTheme]
  );

  return (
    <MotionContext.Provider value={motionValue}>
      <UnicodeContext.Provider value={unicodeValue}>
        <ThemeContext.Provider value={themeValue}>
          {children}
        </ThemeContext.Provider>
      </UnicodeContext.Provider>
    </MotionContext.Provider>
  );
};

export const AutoThemeProvider = ({
  children,
  darkTheme,
  lightTheme,
}: AutoThemeProviderProps) => {
  const scheme = detectColorScheme();
  return (
    <ThemeProvider theme={scheme === "dark" ? darkTheme : lightTheme}>
      {children}
    </ThemeProvider>
  );
};

export const useTheme = (): Theme => React.useContext(ThemeContext).theme;

export const useThemeUpdater = (): ((theme: Theme) => void) =>
  React.useContext(ThemeContext).setTheme;

export const createTheme = (
  overrides: Partial<Theme> & { name: string }
): Theme => ({
  ...defaultTheme,
  ...overrides,
  border: {
    ...defaultTheme.border,
    ...overrides.border,
  },
  colors: {
    ...defaultTheme.colors,
    ...overrides.colors,
  },
  spacing: {
    ...defaultTheme.spacing,
    ...overrides.spacing,
  },
  typography: {
    ...defaultTheme.typography,
    ...overrides.typography,
  },
});
