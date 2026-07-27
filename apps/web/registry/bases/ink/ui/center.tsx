import { Box } from "ink";
import type { ReactNode } from "react";

export interface CenterProps {
  children: ReactNode;
  axis?: "both" | "horizontal" | "vertical";
}

export const Center = ({ children, axis = "both" }: CenterProps) => {
  const justifyContent =
    axis === "both" || axis === "horizontal" ? "center" : undefined;
  const alignItems =
    axis === "both" || axis === "vertical" ? "center" : undefined;

  return (
    <Box
      flexGrow={1}
      justifyContent={justifyContent as "center" | undefined}
      alignItems={alignItems as "center" | undefined}
    >
      {children}
    </Box>
  );
};
