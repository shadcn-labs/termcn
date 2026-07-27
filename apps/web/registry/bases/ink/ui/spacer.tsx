import { Box } from "ink";

export interface SpacerProps {
  size?: number;
  direction?: "horizontal" | "vertical";
}

export const Spacer = ({ size, direction = "horizontal" }: SpacerProps) => {
  if (size === undefined) {
    return <Box flexGrow={1} />;
  }

  if (direction === "vertical") {
    return <Box height={size} />;
  }

  return <Box width={size} />;
};
