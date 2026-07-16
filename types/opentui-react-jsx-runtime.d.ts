import type { ReactNode } from "react";

type OpenTUIStyle = Record<string, unknown>;

interface OpenTUIBoxProps {
  alignItems?: string;
  backgroundColor?: string;
  border?: boolean;
  borderBottom?: boolean;
  borderColor?: string;
  borderLeft?: boolean;
  borderRight?: boolean;
  borderStyle?: string;
  borderTop?: boolean;
  children?: ReactNode;
  flexDirection?: "row" | "column" | string;
  flexGrow?: number;
  flexShrink?: number;
  flexWrap?: string;
  gap?: number;
  height?: number | string;
  justifyContent?: string;
  key?: React.Key;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  minWidth?: number;
  overflow?: string;
  padding?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  style?: OpenTUIStyle;
  title?: string;
  width?: number | string;
}

interface OpenTUITextProps {
  bg?: string;
  children?: ReactNode;
  fg?: string;
  inverse?: boolean;
  key?: React.Key;
  marginLeft?: number;
  reverse?: boolean;
  style?: OpenTUIStyle;
  underline?: boolean;
}

interface OpenTUISpanProps {
  bg?: string;
  children?: ReactNode;
  fg?: string;
  key?: React.Key;
}

interface OpenTUIScrollBoxProps extends OpenTUIBoxProps {
  scrollX?: boolean;
  scrollY?: boolean;
}

declare module "@opentui/react/jsx-runtime" {
  export function jsx(
    type: unknown,
    props: unknown,
    key?: string | number | null
  ): unknown;
  export function jsxs(
    type: unknown,
    props: unknown,
    key?: string | number | null
  ): unknown;
  export function jsxDEV(
    type: unknown,
    props: unknown,
    key: string | number | null | undefined,
    isStaticChildren: boolean,
    source: unknown,
    self: unknown
  ): unknown;

  export namespace JSX {
    interface IntrinsicElements {
      a: { children?: ReactNode; href?: string };
      "ascii-font": Record<string, unknown>;
      b: { children?: ReactNode };
      box: OpenTUIBoxProps;
      br: Record<string, never>;
      code: Record<string, unknown>;
      diff: Record<string, unknown>;
      dim: { children?: ReactNode };
      em: { children?: ReactNode };
      i: { children?: ReactNode };
      input: Record<string, unknown>;
      "line-numbers": Record<string, unknown>;
      markdown: Record<string, unknown>;
      scrollbox: Record<string, unknown>;
      select: Record<string, unknown>;
      span: OpenTUISpanProps;
      strong: { children?: ReactNode };
      "tab-select": Record<string, unknown>;
      textarea: Record<string, unknown>;
      text: OpenTUITextProps;
      u: { children?: ReactNode };
    }
  }
}

declare module "@opentui/react/jsx-dev-runtime" {
  export function jsxDEV(
    type: unknown,
    props: unknown,
    key: string | number | null | undefined,
    isStaticChildren: boolean,
    source: unknown,
    self: unknown
  ): unknown;

  export namespace JSX {
    interface IntrinsicElements {
      a: { children?: ReactNode; href?: string };
      "ascii-font": Record<string, unknown>;
      b: { children?: ReactNode };
      box: OpenTUIBoxProps;
      br: Record<string, never>;
      code: Record<string, unknown>;
      diff: Record<string, unknown>;
      dim: { children?: ReactNode };
      em: { children?: ReactNode };
      i: { children?: ReactNode };
      input: Record<string, unknown>;
      "line-numbers": Record<string, unknown>;
      markdown: Record<string, unknown>;
      scrollbox: Record<string, unknown>;
      select: Record<string, unknown>;
      span: OpenTUISpanProps;
      strong: { children?: ReactNode };
      "tab-select": Record<string, unknown>;
      textarea: Record<string, unknown>;
      text: OpenTUITextProps;
      u: { children?: ReactNode };
    }
  }
}

declare module "react/jsx-runtime" {
  export namespace JSX {
    interface IntrinsicElements {
      b: { children?: ReactNode };
      box: OpenTUIBoxProps;
      dim: { children?: ReactNode };
      i: { children?: ReactNode };
      scrollbox: OpenTUIScrollBoxProps;
      text: OpenTUITextProps;
      u: { children?: ReactNode };
    }
  }
}

declare module "react/jsx-dev-runtime" {
  export namespace JSX {
    interface IntrinsicElements {
      b: { children?: ReactNode };
      box: OpenTUIBoxProps;
      dim: { children?: ReactNode };
      i: { children?: ReactNode };
      scrollbox: OpenTUIScrollBoxProps;
      text: OpenTUITextProps;
      u: { children?: ReactNode };
    }
  }
}
