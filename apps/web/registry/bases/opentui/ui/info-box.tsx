/* @jsxImportSource @opentui/react */
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

export interface InfoBoxProps {
  borderStyle?: BorderStyle;
  borderColor?: string;
  padding?: [number, number];
  width?: number | "full";
  children: ReactNode;
}

export interface InfoBoxHeaderProps {
  icon?: string;
  iconColor?: string;
  label: string;
  description?: string;
  version?: string;
  versionColor?: string;
}

export interface InfoBoxRowProps {
  label: string;
  value?: string;
  valueDetail?: string;
  valueColor?: string;
  bold?: boolean;
  tree?: boolean;
  color?: string;
}

const InfoBoxRoot = ({
  borderStyle = "single",
  borderColor,
  padding = [0, 1],
  width,
  children,
}: InfoBoxProps) => {
  const theme = useTheme();
  const resolvedBorderColor = borderColor ?? theme.colors.border;

  return (
    <box
      borderStyle={borderStyle}
      borderColor={resolvedBorderColor}
      flexDirection="column"
      paddingLeft={padding[1]}
      paddingRight={padding[1]}
      paddingTop={padding[0]}
      paddingBottom={padding[0]}
      width={width === "full" ? undefined : width}
      flexGrow={width === "full" ? 1 : undefined}
    >
      {children}
    </box>
  );
};

const InfoBoxHeader = ({
  icon,
  iconColor = "green",
  label,
  description,
  version,
  versionColor = "cyan",
}: InfoBoxHeaderProps) => (
  <box flexDirection="row" gap={1}>
    {icon ? <text fg={iconColor}>{icon}</text> : null}
    <text>
      <b>{label}</b>
    </text>
    {description ? <text fg="#666">{description}</text> : null}
    {version ? <text fg={versionColor}>{version}</text> : null}
  </box>
);

const InfoBoxRow = ({
  label,
  value,
  valueDetail,
  valueColor,
  bold: boldValue = false,
  tree = false,
  color,
}: InfoBoxRowProps) => {
  const theme = useTheme();
  const prefix = tree ? "└ " : "";

  return (
    <box flexDirection="row">
      <text
        fg={color ?? theme.colors.mutedForeground}
      >{`${prefix}${label}${value ? ":" : ""}`}</text>
      {value ? (
        boldValue ? (
          <text fg={color}>
            <b>{`  ${value}`}</b>
          </text>
        ) : (
          <text fg={color}>{`  ${value}`}</text>
        )
      ) : null}
      {valueDetail ? (
        <text fg={valueColor ?? "cyan"}>{`  ${valueDetail}`}</text>
      ) : null}
    </box>
  );
};

const InfoBoxTreeRow = (props: Omit<InfoBoxRowProps, "tree">) => (
  <InfoBoxRow {...props} tree={true} />
);

export const InfoBox = Object.assign(InfoBoxRoot, {
  Header: InfoBoxHeader,
  Row: InfoBoxRow,
  TreeRow: InfoBoxTreeRow,
});
