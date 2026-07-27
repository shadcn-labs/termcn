import { Box } from "ink";
import type { ReactNode } from "react";

export interface StackProps {
  direction?: "vertical" | "horizontal";
  gap?: number;
  children: ReactNode;
  width?: number | string;
  height?: number | string;
  alignItems?: "flex-start" | "center" | "flex-end";
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around";
}

export const Stack = ({
  direction = "vertical",
  gap = 0,
  children,
  width,
  height,
  alignItems,
  justifyContent,
}: StackProps) => (
  <Box
    flexDirection={direction === "vertical" ? "column" : "row"}
    gap={gap}
    width={width as number}
    height={height as number}
    alignItems={alignItems}
    justifyContent={justifyContent}
  >
    {children}
  </Box>
);
