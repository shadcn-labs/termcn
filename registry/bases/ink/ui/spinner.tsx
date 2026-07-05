import cliSpinners from "cli-spinners";
import type { SpinnerName } from "cli-spinners";
import { Text } from "ink";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useAnimation } from "@/hooks/use-animation";

export type SpinnerType = SpinnerName;

export const spinnerNames = Object.keys(cliSpinners) as SpinnerName[];

export interface SpinnerProps {
  type?: SpinnerType;
  label?: string;
  color?: string;
  fps?: number;
  frames?: string[];
}

export const Spinner = ({
  type: spinnerType = "dots",
  label,
  color,
  fps = 12,
  frames: customFrames,
}: SpinnerProps) => {
  const theme = useTheme();
  const builtin = cliSpinners[spinnerType] ?? cliSpinners.dots;
  const useCustomFrames = customFrames !== undefined;
  const frames = useCustomFrames ? customFrames : builtin.frames;
  const frame = useAnimation(
    useCustomFrames ? fps : { intervalMs: builtin.interval }
  );
  const icon = frames[frame % frames.length];
  const resolvedColor = color ?? theme.colors.primary;

  return (
    <Text>
      <Text color={resolvedColor}>{icon}</Text>
      {label && <Text> {label}</Text>}
    </Text>
  );
};
