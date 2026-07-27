import { Text } from "ink";

import { useTheme } from "@/components/ui/ink-theme-provider";

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
  return <Text color={resolvedColor}>[{count}]</Text>;
};
