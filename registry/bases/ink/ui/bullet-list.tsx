import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";

export interface BulletListItemProps {
  label: string;
  bold?: boolean;
  color?: string;
  children?: ReactNode;
}

export interface BulletListTreeItemProps {
  label: string;
  color?: string;
}

export interface BulletListCheckItemProps {
  label: string;
  done?: boolean;
  color?: string;
}

const BulletListRoot = ({ children }: { children: ReactNode }) => (
  <Box flexDirection="column">{children}</Box>
);

const BulletListItem = ({
  label,
  bold: boldText = false,
  color,
  children,
}: BulletListItemProps) => {
  const theme = useTheme();
  return (
    <Box flexDirection="column">
      <Box flexDirection="row">
        <Text color={color ?? theme.colors.primary}>{"● "}</Text>
        <Text bold={boldText} color={color}>
          {label}
        </Text>
      </Box>
      {children}
    </Box>
  );
};

const BulletListSub = ({ children }: { children: ReactNode }) => (
  <Box flexDirection="column" paddingLeft={2}>
    {children}
  </Box>
);

const BulletListTreeItem = ({ label, color }: BulletListTreeItemProps) => {
  const theme = useTheme();
  return (
    <Box flexDirection="row">
      <Text color={theme.colors.mutedForeground}>{"└ "}</Text>
      <Text color={color}>{label}</Text>
    </Box>
  );
};

const BulletListCheckItem = ({
  label,
  done = false,
  color,
}: BulletListCheckItemProps) => {
  const theme = useTheme();
  const icon = done ? "■" : "□";
  const resolvedColor =
    color ?? (done ? theme.colors.success : theme.colors.mutedForeground);
  return (
    <Box flexDirection="row">
      <Text color={resolvedColor}>{`${icon} `}</Text>
      <Text color={done ? undefined : color}>{label}</Text>
    </Box>
  );
};

export const BulletList = Object.assign(BulletListRoot, {
  CheckItem: BulletListCheckItem,
  Item: BulletListItem,
  Sub: BulletListSub,
  TreeItem: BulletListTreeItem,
});
