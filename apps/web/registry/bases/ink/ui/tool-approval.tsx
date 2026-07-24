import { Box, Text } from "ink";
import React, { useState, useEffect, useRef } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export type RiskLevel = "low" | "medium" | "high";

export interface ToolApprovalProps {
  name: string;
  description?: string;
  args?: Record<string, unknown>;
  risk?: RiskLevel;
  onApprove?: () => void;
  onDeny?: () => void;
  onAlwaysAllow?: () => void;
  timeout?: number;
}

export const ToolApproval = ({
  name,
  description,
  args,
  risk = "low",
  onApprove,
  onDeny,
  onAlwaysAllow,
  timeout,
}: ToolApprovalProps) => {
  const theme = useTheme();
  const [remaining, setRemaining] = useState(timeout ?? 0);
  const onDenyRef = useRef(onDeny);

  useEffect(() => {
    onDenyRef.current = onDeny;
  }, [onDeny]);

  useEffect(() => {
    if (!timeout) {
      return;
    }
    setRemaining(timeout);
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          onDenyRef.current?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timeout]);

  useInput((input) => {
    if (input === "y" || input === "Y") {
      onApprove?.();
    } else if (input === "n" || input === "N") {
      onDeny?.();
    } else if ((input === "a" || input === "A") && onAlwaysAllow) {
      onAlwaysAllow();
    }
  });

  const riskBorderColor: Record<RiskLevel, string> = {
    high: theme.colors.error ?? "red",
    low: theme.colors.success ?? "green",
    medium: theme.colors.warning ?? "yellow",
  };

  const riskLabel: Record<RiskLevel, string> = {
    high: "HIGH",
    low: "LOW",
    medium: "MEDIUM",
  };

  const riskLabelColor: Record<RiskLevel, string> = {
    high: theme.colors.error ?? "red",
    low: theme.colors.success ?? "green",
    medium: theme.colors.warning ?? "yellow",
  };

  const borderColor = riskBorderColor[risk];

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={borderColor}
      paddingX={1}
      paddingY={0}
    >
      <Box gap={2}>
        <Text bold color={theme.colors.foreground}>
          Tool Approval Required
        </Text>
        <Text bold color={riskLabelColor[risk]}>
          [{riskLabel[risk]} RISK]
        </Text>
        {timeout && remaining > 0 && (
          <Text color={theme.colors.warning ?? "yellow"} dimColor>
            Auto-deny in {remaining}s
          </Text>
        )}
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Box gap={1}>
          <Text color={theme.colors.mutedForeground}>Tool:</Text>
          <Text bold color={theme.colors.primary}>
            {name}
          </Text>
        </Box>
        {description && (
          <Box gap={1}>
            <Text color={theme.colors.mutedForeground}>Description:</Text>
            <Text dimColor>{description}</Text>
          </Box>
        )}
      </Box>

      {args && Object.keys(args).length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color={theme.colors.mutedForeground} dimColor>
            Arguments:
          </Text>
          {Object.entries(args).map(([k, v]) => (
            <Box key={k} gap={1} paddingLeft={2}>
              <Text color={theme.colors.accent}>{k}:</Text>
              <Text dimColor>{JSON.stringify(v)}</Text>
            </Box>
          ))}
        </Box>
      )}

      <Box gap={2} marginTop={1}>
        <Text color={theme.colors.success ?? "green"} bold>
          [y] Approve
        </Text>
        <Text color={theme.colors.error ?? "red"} bold>
          [n] Deny
        </Text>
        {onAlwaysAllow && (
          <Text color={theme.colors.warning ?? "yellow"} bold>
            [a] Always Allow
          </Text>
        )}
      </Box>
    </Box>
  );
};
