import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface InfoBoxProps {
  borderStyle?: BorderStyle;
  borderColor?: string;
  padding?: [number, number];
  width?: number | "full";
  children: ReactNode;
  "aria-label"?: string;
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
  "aria-label": ariaLabel = "Information",
}: InfoBoxProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const resolvedBorderColor = borderColor ?? theme.colors.border;

  return (
    <Box
      borderStyle={resolveBorderStyle(borderStyle, unicode)}
      borderColor={resolvedBorderColor}
      flexDirection="column"
      paddingX={padding[1]}
      paddingY={padding[0]}
      width={width === "full" ? undefined : width}
      flexGrow={width === "full" ? 1 : undefined}
      aria-role="list"
    >
      <Text aria-label={ariaLabel}>{""}</Text>
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
  <Box
    flexDirection="row"
    gap={1}
    aria-role="listitem"
    aria-label={`${label}${description ? `. ${description}` : ""}${version ? `. Version ${version}` : ""}`}
  >
    {icon && (
      <Text aria-hidden color={iconColor}>
        {icon}
      </Text>
    )}
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
  const unicode = useUnicode();
  const prefix = tree ? (unicode ? "└ " : "`- ") : "";

  return (
    <Box
      flexDirection="row"
      aria-role="listitem"
      aria-label={`${label}${value ? `: ${value}` : ""}${valueDetail ? `. ${valueDetail}` : ""}`}
    >
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
