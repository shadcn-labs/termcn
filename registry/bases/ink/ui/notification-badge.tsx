import { Text } from "ink";

import { useTheme } from "@/hooks/use-theme";

export interface NotificationBadgeProps {
  count: number;
  color?: string;
  "aria-label"?: string;
}

export const NotificationBadge = ({
  count,
  color,
  "aria-label": ariaLabel,
}: NotificationBadgeProps) => {
  const theme = useTheme();
  if (count === 0) {
    return null;
  }
  const resolvedColor = color ?? theme.colors.error;
  return (
    <Text
      aria-label={ariaLabel ?? `${count} notifications`}
      color={resolvedColor}
    >
      [{count}]
    </Text>
  );
};
