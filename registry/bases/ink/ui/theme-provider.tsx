import * as React from "react";

import { defaultTheme } from "@/registry/bases/ink/themes/default";
import type {
  AutoThemeProviderProps,
  MotionContextValue,
  Theme,
  ThemeContextValue,
  ThemeProviderProps,
  UnicodeContextValue,
} from "@/registry/bases/ink/ui/types";

export type {
  AutoThemeProviderProps,
  BorderStyle,
  BorderTokens,
  ColorTokens,
  MotionContextValue,
  SpacingTokens,
  Theme,
  ThemeContextValue,
  ThemeProviderProps,
  TypographyTokens,
  UnicodeContextValue,
} from "@/registry/bases/ink/ui/types";

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

export const ThemeContext = React.createContext<ThemeContextValue>({
  setTheme: () => {
    /* noop */
  },
  theme: defaultTheme,
});

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
