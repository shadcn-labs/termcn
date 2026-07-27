import { Sparkline } from "@/registry/bases/ink/ui/dither-sparkline";

export default function DitherSparklineDemo() {
  return (
    <Sparkline
      bloom="low"
      color="blue"
      data={[18, 26, 23, 41, 37, 52, 49, 63, 58, 71, 68, 82]}
      height={5}
      markerIndex={9}
      title="Requests"
      variant="gradient"
      width={42}
    />
  );
}
