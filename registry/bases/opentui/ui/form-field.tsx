/* @jsxImportSource @opentui/react */
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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
    <box flexDirection="column">
      <box gap={0}>
        <text fg={resolvedLabelColor}>
          <b>{label}</b>
        </text>
        {required && <text fg={theme.colors.error}>{" *"}</text>}
      </box>
      <box>{children}</box>
      {hint && !error && <text fg="#666">{hint}</text>}
      {error && (
        <text fg={theme.colors.error}>
          {errorIcon} {error}
        </text>
      )}
    </box>
  );
};
