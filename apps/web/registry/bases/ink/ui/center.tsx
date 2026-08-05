import { Box } from "ink";
import type { BoxProps } from "ink";
import type { ReactNode } from "react";

export interface CenterProps extends Omit<
  BoxProps,
  "alignItems" | "children" | "justifyContent"
> {
  children: ReactNode;
  axis?: "both" | "horizontal" | "vertical";
}

export const Center = ({ children, axis = "both", ...props }: CenterProps) => {
  const justifyContent =
    axis === "both" || axis === "horizontal" ? "center" : undefined;
  const alignItems =
    axis === "both" || axis === "vertical" ? "center" : undefined;

  return (
    <Box
      {...props}
      flexGrow={1}
      justifyContent={justifyContent as "center" | undefined}
      alignItems={alignItems as "center" | undefined}
    >
      {children}
    </Box>
  );
};
