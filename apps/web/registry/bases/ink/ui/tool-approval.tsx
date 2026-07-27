import { useIsScreenReaderEnabled, Box, Text } from "ink";
import React, { useState, useEffect, useRef } from "react";

import { isActivationKey, useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useInterval } from "@/hooks/use-interval";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

export type RiskLevel = "low" | "medium" | "high";

export interface ToolApprovalProps extends InteractionProps {
  name: string;
  description?: string;
  args?: Record<string, unknown>;
  risk?: RiskLevel;
  onApprove?: () => void;
  onDeny?: () => void;
  onAlwaysAllow?: () => void;
  timeout?: number;
  "aria-label"?: string;
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
  id,
  autoFocus,
  isActive = true,
  disabled,
  "aria-label": ariaLabel,
}: ToolApprovalProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
  const [remaining, setRemaining] = useState(timeout ?? 0);
  const [activeAction, setActiveAction] = useState(0);
  const onDenyRef = useRef(onDeny);

  useEffect(() => {
    onDenyRef.current = onDeny;
  }, [onDeny]);

  useEffect(() => {
    if (!timeout || !isActive || disabled) {
      return;
    }
    setRemaining(timeout);
    const id = setTimeout(() => onDenyRef.current?.(), timeout * 1000);
    return () => clearTimeout(id);
  }, [disabled, isActive, timeout]);

  useInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000, {
    isActive: Boolean(timeout && remaining > 0 && isActive && !disabled),
  });

  const actions = [
    { label: "Approve", run: onApprove, shortcut: "y" },
    { label: "Deny", run: onDeny, shortcut: "n" },
    ...(onAlwaysAllow
      ? [{ label: "Always allow", run: onAlwaysAllow, shortcut: "a" }]
      : []),
  ];

  const { isFocused } = useInteraction(
    (input, key) => {
      if (input === "y" || input === "Y") {
        onApprove?.();
      } else if (input === "n" || input === "N") {
        onDeny?.();
      } else if ((input === "a" || input === "A") && onAlwaysAllow) {
        onAlwaysAllow();
      } else if (key.leftArrow || key.upArrow) {
        setActiveAction((index) => Math.max(0, index - 1));
      } else if (key.rightArrow || key.downArrow) {
        setActiveAction((index) => Math.min(actions.length - 1, index + 1));
      } else if (key.home) {
        setActiveAction(0);
      } else if (key.end) {
        setActiveAction(actions.length - 1);
      } else if (isActivationKey(input, key)) {
        actions[activeAction]?.run?.();
      }
    },
    { autoFocus, disabled, id, isActive }
  );

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
      borderStyle={resolveBorderStyle(
        isScreenReaderEnabled ? undefined : "round",
        unicode
      )}
      borderColor={borderColor}
      paddingX={1}
      paddingY={0}
      aria-role="toolbar"
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text
        aria-label={
          ariaLabel ??
          `Tool approval: ${name}. ${riskLabel[risk]} risk.${timeout ? ` Auto-deny in ${timeout} seconds.` : ""}`
        }
      >
        {""}
      </Text>
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
        {actions.map((action, index) => {
          const focused = isFocused && activeAction === index;
          const color =
            action.shortcut === "y"
              ? (theme.colors.success ?? "green")
              : action.shortcut === "n"
                ? (theme.colors.error ?? "red")
                : (theme.colors.warning ?? "yellow");
          return (
            <Box
              key={action.shortcut}
              aria-role="button"
              aria-label={action.label}
              aria-state={{ disabled: disabled || undefined }}
            >
              <Text color={color} bold inverse={focused}>
                {focused ? "> " : ""}[{action.shortcut}] {action.label}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
