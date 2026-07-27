import cliSpinners from "cli-spinners";
import type { SpinnerName } from "cli-spinners";
import { Box, Text } from "ink";

import { useAnimation } from "@/hooks/use-animation";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";

export type SpinnerType = SpinnerName;

export const spinnerNames = Object.keys(cliSpinners) as SpinnerName[];

export interface SpinnerProps {
  type?: SpinnerType;
  label?: string;
  color?: string;
  fps?: number;
  frames?: string[];
  isActive?: boolean;
  "aria-label"?: string;
}

export const Spinner = ({
  type: spinnerType = "dots",
  label,
  color,
  fps = 12,
  frames: customFrames,
  isActive = true,
  "aria-label": ariaLabel,
}: SpinnerProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const builtin = cliSpinners[spinnerType] ?? cliSpinners.dots;
  const useCustomFrames = customFrames !== undefined;
  let frames = ["-", "\\", "|", "/"];
  if (useCustomFrames) {
    frames = customFrames;
  } else if (unicode) {
    ({ frames } = builtin);
  }
  const frame = useAnimation({
    intervalMs: useCustomFrames ? Math.round(1000 / fps) : builtin.interval,
    isActive,
  });
  const icon = frames[frame % frames.length];
  const resolvedColor = color ?? theme.colors.primary;

  return (
    <Box
      aria-role="progressbar"
      aria-label={ariaLabel ?? label ?? "Loading"}
      aria-state={{ busy: isActive }}
    >
      <Text aria-hidden color={resolvedColor}>
        {icon}
      </Text>
      {label && <Text> {label}</Text>}
    </Box>
  );
};
