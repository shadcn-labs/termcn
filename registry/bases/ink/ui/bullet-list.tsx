import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveTerminalSymbol } from "@/registry/bases/ink/lib/accessibility";

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
  <Box flexDirection="column" aria-role="list">
    {children}
  </Box>
);

const BulletListItem = ({
  label,
  bold: boldText = false,
  color,
  children,
}: BulletListItemProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  return (
    <Box flexDirection="column" aria-role="listitem">
      <Text aria-label={label}>{""}</Text>
      <Box flexDirection="row">
        <Text aria-hidden color={color ?? theme.colors.primary}>
          {resolveTerminalSymbol(unicode, "● ", "* ")}
        </Text>
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
  const unicode = useUnicode();
  return (
    <Box flexDirection="row" aria-role="listitem" aria-label={label}>
      <Text aria-hidden color={theme.colors.mutedForeground}>
        {resolveTerminalSymbol(unicode, "└ ", "`- ")}
      </Text>
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
  const unicode = useUnicode();
  const icon = done
    ? resolveTerminalSymbol(unicode, "■", "[x]")
    : resolveTerminalSymbol(unicode, "□", "[ ]");
  const resolvedColor =
    color ?? (done ? theme.colors.success : theme.colors.mutedForeground);
  return (
    <Box
      flexDirection="row"
      aria-role="listitem"
      aria-label={`${label}, ${done ? "completed" : "not completed"}`}
      aria-state={{ checked: done }}
    >
      <Text aria-hidden color={resolvedColor}>{`${icon} `}</Text>
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
