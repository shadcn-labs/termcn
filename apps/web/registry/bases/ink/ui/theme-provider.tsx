import * as React from "react";

import { MotionContext, isReducedMotion } from "@/hooks/use-motion";
import { ThemeContext } from "@/hooks/use-theme";
import { UnicodeContext, isNoUnicode } from "@/hooks/use-unicode";
import { defaultTheme } from "@/registry/bases/ink/themes/default";
import type {
  AutoThemeProviderProps,
  Theme,
  ThemeProviderProps,
} from "@/registry/bases/ink/ui/types";

export type {
  AutoThemeProviderProps,
  BorderStyle,
  BorderTokens,
  ColorTokens,
  SpacingTokens,
  Theme,
  ThemeProviderProps,
  TypographyTokens,
} from "@/registry/bases/ink/ui/types";

const getEnv = (name: string): string | undefined =>
  typeof process !== "undefined" && process.env ? process.env[name] : undefined;

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
