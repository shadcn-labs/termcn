import { Spacer as InkSpacer, Box } from "ink";
import type { BoxProps } from "ink";

export interface SpacerProps extends Omit<BoxProps, "height" | "width"> {
  size?: number;
  direction?: "horizontal" | "vertical";
}

export const Spacer = ({
  size,
  direction = "horizontal",
  ...props
}: SpacerProps) => {
  if (size === undefined) {
    return <InkSpacer />;
  }

  if (direction === "vertical") {
    return <Box {...props} aria-hidden height={size} />;
  }

  return <Box {...props} aria-hidden width={size} />;
};
