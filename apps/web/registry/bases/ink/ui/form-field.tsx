import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";

export interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  gap?: number;
  errorIcon?: string;
  labelColor?: string;
}

export const FormField = ({
  label,
  children,
  error,
  hint,
  required,
  gap = 0,
  errorIcon = "✗",
  labelColor,
}: FormFieldProps) => {
  const theme = useTheme();
  const resolvedLabelColor = labelColor ?? theme.colors.foreground;

  return (
    <Box flexDirection="column" gap={gap}>
      <Box gap={0}>
        <Text bold color={resolvedLabelColor}>
          {label}
        </Text>
        {required && <Text color={theme.colors.error}> *</Text>}
      </Box>
      <Box>{children}</Box>
      {hint && !error && (
        <Text color={theme.colors.mutedForeground} dimColor>
          {hint}
        </Text>
      )}
      {error && (
        <Text color={theme.colors.error}>
          {errorIcon} {error}
        </Text>
      )}
    </Box>
  );
};
