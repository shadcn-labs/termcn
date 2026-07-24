/* @jsxImportSource @opentui/react */
import { useState, useEffect } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface SkeletonProps {
  width?: number;
  height?: number;
  animated?: boolean;
}

export const Skeleton = ({
  width = 20,
  height = 1,
  animated = true,
}: SkeletonProps) => {
  const theme = useTheme();
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!animated) {
      return;
    }
    const id = setInterval(() => {
      setFrame((f) => f + 1);
    }, 80);
    return () => clearInterval(id);
  }, [animated]);

  const rows = Array.from({ length: height }, (_, rowIndex) => {
    const rowOffset = animated ? (frame + rowIndex * 2) % (width + 6) : -1;
    let row = "";
    for (let i = 0; i < width; i += 1) {
      const inHighlight = i >= rowOffset - 3 && i <= rowOffset + 3;
      row += inHighlight ? "█" : "░";
    }
    return row;
  });

  return (
    <box flexDirection="column">
      {rows.map((row, i) => (
        <box key={i} flexDirection="row">
          {[...row].map((char, j) => (
            <text
              key={j}
              fg={
                char === "█" ? theme.colors.mutedForeground : theme.colors.muted
              }
            >
              {char}
            </text>
          ))}
        </box>
      ))}
    </box>
  );
};
