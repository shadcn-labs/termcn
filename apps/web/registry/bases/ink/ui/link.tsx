import { Transform, Box, Text } from "ink";
import type { ReactNode } from "react";

import { isActivationKey, useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";

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

export interface LinkProps extends InteractionProps {
  children: ReactNode;
  href: string;
  color?: string;
  showHref?: boolean;
  fallback?: boolean | ((text: string, url: string) => string);
  onOpen?: (href: string) => void;
  "aria-label"?: string;
}

export const Link = ({
  children,
  href,
  color,
  showHref = false,
  fallback = true,
  onOpen,
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel,
}: LinkProps) => {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.info;
  const hasSupport = supportsHyperlinks();
  const { isFocused } = useInteraction(
    (input, key) => {
      if (isActivationKey(input, key)) {
        onOpen?.(href);
      }
    },
    { autoFocus, disabled, id, isActive: isActive && Boolean(onOpen) }
  );
  const accessibleLabel =
    ariaLabel ?? `${typeof children === "string" ? children : "Link"}: ${href}`;

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
      <Box
        flexDirection="row"
        aria-role={onOpen ? "button" : undefined}
        aria-label={accessibleLabel}
        aria-state={{ disabled: disabled || undefined }}
      >
        <Transform transform={transformOutput}>
          <Text color={resolvedColor} underline>
            {isFocused && "["}
            {children}
            {isFocused && "]"}
          </Text>
        </Transform>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="row"
      aria-role={onOpen ? "button" : undefined}
      aria-label={accessibleLabel}
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text color={resolvedColor} underline>
        {children}
      </Text>
      {(showHref || fallback === true) && <Text dimColor>{` (${href})`}</Text>}
    </Box>
  );
};
