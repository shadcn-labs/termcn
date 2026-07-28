/* @jsxImportSource @opentui/react */
import { useTheme } from "@/registry/bases/opentui/hooks/use-theme";

export interface NotificationBadgeProps {
  count: number;
  color?: string;
}

export const NotificationBadge = ({ count, color }: NotificationBadgeProps) => {
  const theme = useTheme();
  if (count === 0) {
    return null;
  }
  const resolvedColor = color ?? theme.colors.error;
  return <text fg={resolvedColor}>{`[${count}]`}</text>;
};
