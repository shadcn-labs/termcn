import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
}

export const Popover = ({
  trigger,
  children,
  isOpen = false,
  onClose,
  title,
}: PopoverProps) => {
  const theme = useTheme();

  useInput(
    (_input, key) => {
      if (!isOpen) {
        return;
      }
      if (key.escape) {
        onClose?.();
      }
    },
    { isActive: isOpen }
  );

  return (
    <Box flexDirection="column" alignItems="flex-start">
      <Box>{trigger}</Box>
      {isOpen && (
        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor={theme.colors.border}
          paddingX={1}
          paddingY={0}
          marginTop={0}
        >
          {title && (
            <Box marginBottom={1}>
              <Text bold color={theme.colors.primary}>
                {title}
              </Text>
            </Box>
          )}
          <Box flexDirection="column">{children}</Box>
          <Box marginTop={1}>
            <Text color={theme.colors.mutedForeground} dimColor>
              Press Esc to close
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};
