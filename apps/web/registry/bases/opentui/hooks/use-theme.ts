import * as React from "react";

import { defaultTheme } from "@/registry/bases/opentui/themes/default";
import type {
  Theme,
  ThemeContextValue,
} from "@/registry/bases/opentui/ui/types";

export const ThemeContext = React.createContext<ThemeContextValue>({
  setTheme: () => {
    // The default context keeps useTheme provider-optional.
  },
  theme: defaultTheme,
});

export const useTheme = (): Theme => React.useContext(ThemeContext).theme;

export const useThemeUpdater = (): ((theme: Theme) => void) =>
  React.useContext(ThemeContext).setTheme;
