import type { ReactNode } from "react";

import type { TuiThemeProvider, TuiWebTheme } from "./types.js";

interface ThemeBoundaryProps<TTheme extends TuiWebTheme> {
  children: ReactNode;
  provider?: TuiThemeProvider<TTheme>;
  theme: TTheme;
}

export const ThemeBoundary = <TTheme extends TuiWebTheme>({
  children,
  provider: Provider,
  theme,
}: ThemeBoundaryProps<TTheme>) =>
  Provider ? <Provider theme={theme}>{children}</Provider> : children;
