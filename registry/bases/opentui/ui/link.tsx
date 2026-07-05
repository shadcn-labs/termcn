/* @jsxImportSource @opentui/react */
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

const OSC = "\u001B]";
const SEP = ";";
const BEL = "\u0007";

const supportsHyperlinks = (): boolean => {
  const term = process.env["TERM_PROGRAM"] ?? "";
  if (
    term === "iTerm.app" ||
    term === "WezTerm" ||
    term === "Hyper" ||
    term === "vscode"
  ) {
    return true;
  }
  if (process.env["TERM"]?.startsWith("xterm")) {
    return true;
  }
  return false;
};

const wrapWithLink = (text: string, url: string): string =>
  `${OSC}8${SEP}${SEP}${url}${BEL}${text}${OSC}8${SEP}${SEP}${BEL}`;

export interface LinkProps {
  children: ReactNode;
  href: string;
  color?: string;
  showHref?: boolean;
  fallback?: boolean | ((text: string, url: string) => string);
}

export const Link = ({
  children,
  href,
  color,
  showHref = false,
  fallback = true,
}: LinkProps) => {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.info;
  const hasSupport = supportsHyperlinks();

  if (hasSupport) {
    const text = typeof children === "string" ? children : String(children);

    return (
      <box flexDirection="row">
        <text fg={resolvedColor} underline={true}>
          {wrapWithLink(text, href)}
        </text>
      </box>
    );
  }

  return (
    <box flexDirection="row">
      <text fg={resolvedColor} underline={true}>
        {children}
      </text>
      {showHref || fallback === true ? (
        <text fg="#666">{` (${href})`}</text>
      ) : null}
    </box>
  );
};
