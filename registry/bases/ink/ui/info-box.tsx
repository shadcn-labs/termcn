import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import type { BorderStyle } from "@/components/ui/ink-theme-provider";

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
    <Box
      borderStyle={borderStyle}
      borderColor={resolvedBorderColor}
      flexDirection="column"
      paddingX={padding[1]}
      paddingY={padding[0]}
      width={width === "full" ? undefined : width}
      flexGrow={width === "full" ? 1 : undefined}
    >
      {children}
    </Box>
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
  <Box flexDirection="row" gap={1}>
    {icon && <Text color={iconColor}>{icon}</Text>}
    <Text bold>{label}</Text>
    {description && <Text dimColor>{description}</Text>}
    {version && <Text color={versionColor}>{version}</Text>}
  </Box>
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
    <Box flexDirection="row">
      <Text color={color ?? theme.colors.mutedForeground}>
        {prefix}
        {label}
        {value ? ":" : ""}
      </Text>
      {value && (
        <Text bold={boldValue} color={color}>
          {"  "}
          {value}
        </Text>
      )}
      {valueDetail && (
        <Text color={valueColor ?? "cyan"}>{`  ${valueDetail}`}</Text>
      )}
    </Box>
  );
};

const InfoBoxTreeRow = (props: Omit<InfoBoxRowProps, "tree">) => (
  <InfoBoxRow {...props} tree />
);

export const InfoBox = Object.assign(InfoBoxRoot, {
  Header: InfoBoxHeader,
  Row: InfoBoxRow,
  TreeRow: InfoBoxTreeRow,
});
