import { Box } from "ink";
import type { BoxProps } from "ink";
import type { ReactNode } from "react";
import React from "react";

export interface ColumnsProps extends Omit<
  BoxProps,
  "alignItems" | "children" | "flexDirection"
> {
  children: ReactNode;
  gap?: number;
  align?: "top" | "center" | "bottom";
}

const ALIGN_MAP: Record<
  NonNullable<ColumnsProps["align"]>,
  "flex-start" | "center" | "flex-end"
> = {
  bottom: "flex-end",
  center: "center",
  top: "flex-start",
};

export const Columns = ({
  children,
  gap = 0,
  align = "top",
  ...props
}: ColumnsProps) => {
  const items = React.Children.toArray(children);

  return (
    <Box {...props} flexDirection="row" gap={gap} alignItems={ALIGN_MAP[align]}>
      {items.map((child, index) => (
        <Box key={index} flexGrow={1} flexDirection="column">
          {child}
        </Box>
      ))}
    </Box>
  );
};
