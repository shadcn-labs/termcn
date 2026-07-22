/* @jsxImportSource @opentui/react */
import React from "react";
import type { ReactNode } from "react";

export interface ColumnsProps {
  children: ReactNode;
  gap?: number;
  align?: "top" | "center" | "bottom";
}

const ALIGN_MAP: Record<
  NonNullable<ColumnsProps["align"]>,
  "flex-start" | "center" | "flex-end"
> = {
  bottom: "flex-end",
  center: "center",
  top: "flex-start",
};

export const Columns = ({ children, gap = 0, align = "top" }: ColumnsProps) => {
  const items = React.Children.toArray(children);

  return (
    <box flexDirection="row" gap={gap} alignItems={ALIGN_MAP[align]}>
      {items.map((child, index) => (
        <box key={index} flexGrow={1} flexDirection="column">
          {child}
        </box>
      ))}
    </box>
  );
};
