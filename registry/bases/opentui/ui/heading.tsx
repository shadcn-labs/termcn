/* @jsxImportSource @opentui/react */
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export type HeadingLevel = 1 | 2 | 3 | 4;

export interface HeadingProps {
  level?: HeadingLevel;
  children: ReactNode;
  color?: string;
  prefix1?: string;
  prefix2?: string;
  prefix3?: string;
  uppercase?: boolean;
}

export const Heading = ({
  level = 1,
  children,
  color,
  prefix1 = "██ ",
  prefix2 = "▌ ",
  prefix3 = "› ",
  uppercase = true,
}: HeadingProps) => {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.primary;

  switch (level) {
    case 1: {
      return (
        <box>
          <text fg={resolvedColor}>
            <b>{prefix1}</b>
          </text>
          <text fg={resolvedColor}>
            <b>
              {uppercase && typeof children === "string"
                ? children.toUpperCase()
                : children}
            </b>
          </text>
        </box>
      );
    }
    case 2: {
      return (
        <box>
          <text fg={resolvedColor}>
            <b>{prefix2}</b>
          </text>
          <text fg={resolvedColor}>
            <b>{children}</b>
          </text>
        </box>
      );
    }
    case 3: {
      return (
        <box>
          <text>
            <b>{prefix3}</b>
          </text>
          <text>
            <b>{children}</b>
          </text>
        </box>
      );
    }
    case 4: {
      return (
        <box>
          <text fg="#666">
            <u>{children}</u>
          </text>
        </box>
      );
    }
    default: {
      return (
        <box>
          <text>{children}</text>
        </box>
      );
    }
  }
};
