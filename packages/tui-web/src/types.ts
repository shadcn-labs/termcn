import type {
  ComponentType,
  CSSProperties,
  PropsWithChildren,
  ReactElement,
  ReactNode,
} from "react";

export interface TuiWebTheme {
  colors: {
    background: string;
    foreground: string;
    selection?: string;
    selectionForeground?: string;
  };
}

export type TuiThemeProvider<TTheme extends TuiWebTheme> = ComponentType<
  PropsWithChildren<{ theme: TTheme }>
>;

export interface InkComponentDescriptor {
  node: ReactElement;
  runtime: "ink";
}

export interface OpenTuiComponentDescriptor {
  node: ReactNode;
  runtime: "opentui";
}

export type TuiComponentDescriptor =
  | InkComponentDescriptor
  | OpenTuiComponentDescriptor;

export interface TuiWebProps<TTheme extends TuiWebTheme = TuiWebTheme> {
  className?: string;
  component: TuiComponentDescriptor;
  onReady?: () => void;
  rows?: number;
  style?: CSSProperties;
  theme: TTheme;
  themeProvider?: TuiThemeProvider<TTheme>;
}
