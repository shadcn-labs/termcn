import { Box, Text, Transform } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";

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

  const transformOutput = (output: string): string => {
    if (hasSupport) {
      return wrapWithLink(output, href);
    }

    if (fallback === false) {
      return output;
    }

    if (typeof fallback === "function") {
      return fallback(output, href);
    }

    return `${output} (${href})`;
  };

  if (hasSupport) {
    return (
      <Box flexDirection="row">
        <Transform transform={transformOutput}>
          <Text color={resolvedColor} underline>
            {children}
          </Text>
        </Transform>
      </Box>
    );
  }

  return (
    <Box flexDirection="row">
      <Text color={resolvedColor} underline>
        {children}
      </Text>
      {(showHref || fallback === true) && <Text dimColor>{` (${href})`}</Text>}
    </Box>
  );
};
