import { Box } from "ink";
import type { BoxProps } from "ink";
import type { ReactNode } from "react";

export interface StackProps extends Omit<
  BoxProps,
  "children" | "flexDirection"
> {
  direction?: "vertical" | "horizontal";
  gap?: number;
  children: ReactNode;
}

export const Stack = ({
  direction = "vertical",
  gap = 0,
  children,
  width,
  height,
  alignItems,
  justifyContent,
  ...props
}: StackProps) => (
  <Box
    {...props}
    flexDirection={direction === "vertical" ? "column" : "row"}
    gap={gap}
    width={width}
    height={height}
    alignItems={alignItems}
    justifyContent={justifyContent}
  >
    {children}
  </Box>
);
