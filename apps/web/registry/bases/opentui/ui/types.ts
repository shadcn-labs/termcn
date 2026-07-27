import type { ReactNode } from "react";

export type BorderStyle = "single" | "double" | "rounded" | "heavy";

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

export interface ThemeContextValue {
  setTheme: (theme: Theme) => void;
  theme: Theme;
}

export interface ThemeProviderProps {
  children: ReactNode;
  noUnicode?: boolean;
  reducedMotion?: boolean;
  theme?: Theme;
}

export interface AutoThemeProviderProps {
  children: ReactNode;
  darkTheme: Theme;
  lightTheme: Theme;
}
