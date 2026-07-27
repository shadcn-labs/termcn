import { Box } from "ink";
import type { BoxProps } from "ink";
import type { ReactNode } from "react";

export interface AspectRatioProps extends Omit<
  BoxProps,
  "children" | "height" | "width"
> {
  children: ReactNode;
  ratio?: number;
  width?: number;
}

export const AspectRatio = ({
  children,
  ratio = 16 / 9,
  width = 80,
  ...props
}: AspectRatioProps) => {
  const height = Math.round(width / ratio / 2);

  return (
    <Box {...props} width={width} height={height} overflow="hidden">
      {children}
    </Box>
  );
};
