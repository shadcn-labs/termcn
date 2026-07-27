import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveTerminalSymbol } from "@/registry/bases/ink/lib/accessibility";

export interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  gap?: number;
  errorIcon?: string;
  labelColor?: string;
  "aria-label"?: string;
}

export const FormField = ({
  label,
  children,
  error,
  hint,
  required,
  gap = 0,
  errorIcon,
  labelColor,
  "aria-label": ariaLabel,
}: FormFieldProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedLabelColor = labelColor ?? theme.colors.foreground;
  const resolvedErrorIcon =
    errorIcon ?? resolveTerminalSymbol(unicode, "✗", "x");

  return (
    <Box flexDirection="column" gap={gap} aria-role="listitem">
      <Text
        aria-label={
          ariaLabel ??
          `${label}${required ? ", required" : ""}${error ? `, error: ${error}` : hint ? `, hint: ${hint}` : ""}`
        }
      >
        {""}
      </Text>
      <Box gap={0}>
        <Text bold color={resolvedLabelColor}>
          {label}
        </Text>
        {required && (
          <Text aria-hidden color={theme.colors.error}>
            {" "}
            *
          </Text>
        )}
      </Box>
      <Box>{children}</Box>
      {hint && !error && (
        <Text color={theme.colors.mutedForeground} dimColor>
          {hint}
        </Text>
      )}
      {error && (
        <Text color={theme.colors.error} aria-label={`Error: ${error}`}>
          <Text aria-hidden>{resolvedErrorIcon} </Text>
          {error}
        </Text>
      )}
    </Box>
  );
};
