/* @jsxImportSource @opentui/react */

import { Sparkline } from "@/registry/bases/opentui/ui/dither-sparkline";

const data = [18, 26, 23, 41, 37, 52, 49, 63];
const variants = ["gradient", "dotted", "hatched", "solid"] as const;

export default function DitherSparklineVariants() {
  return (
    <box flexDirection="column" gap={1}>
      {[variants.slice(0, 2), variants.slice(2)].map((row, rowIndex) => (
        <box gap={2} key={rowIndex}>
          {row.map((variant, index) => (
            <box key={variant}>
              <Sparkline
                color={rowIndex === 0 ? "blue" : "green"}
                data={data}
                height={4}
                markerIndex={(rowIndex + index) % 2 === 0 ? 5 : null}
                title={variant}
                variant={variant}
                width={27}
              />
            </box>
          ))}
        </box>
      ))}
    </box>
  );
}
