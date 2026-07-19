import { Box, Text } from "ink";
import React, { useEffect, useRef, useState } from "react";

import { useAnimation } from "@/hooks/use-animation";
import { isActivationKey, useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useInterval } from "@/hooks/use-interval";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  resolveStatusSymbol,
  resolveTerminalSymbol,
} from "@/registry/bases/ink/lib/accessibility";

export type ToolCallStatus = "pending" | "running" | "success" | "error";

export interface ToolCallProps extends InteractionProps {
  name: string;
  args?: Record<string, unknown>;
  status: ToolCallStatus;
  result?: unknown;
  duration?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  "aria-label"?: string;
}

export const ToolCall = ({
  name,
  args,
  status,
  result,
  duration,
  collapsible = true,
  defaultCollapsed = true,
  id,
  autoFocus,
  isActive = true,
  disabled,
  "aria-label": ariaLabel,
}: ToolCallProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const frame = useAnimation({
    intervalMs: 83,
    isActive: isActive && status === "running",
  });

  const spinnerFrames = unicode
    ? ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
    : ["-", "\\", "|", "/"];
  const spinnerIcon = spinnerFrames[frame % spinnerFrames.length] ?? "-";

  useEffect(() => {
    if (status === "running") {
      startRef.current = Date.now();
      setElapsed(0);
    }
  }, [status]);

  useInterval(() => setElapsed(Date.now() - startRef.current), 100, {
    isActive: isActive && status === "running",
  });

  const { isFocused } = useInteraction(
    (input, key) => {
      if (collapsible && isActivationKey(input, key)) {
        setCollapsed((c) => !c);
      }
    },
    { autoFocus, disabled, id, isActive: isActive && collapsible }
  );

  const statusIcon = () => {
    switch (status) {
      case "pending": {
        return (
          <Text aria-hidden dimColor>
            {resolveStatusSymbol(unicode, "pending")}
          </Text>
        );
      }
      case "running": {
        return (
          <Text aria-hidden color={theme.colors.primary}>
            {spinnerIcon}
          </Text>
        );
      }
      case "success": {
        return (
          <Text aria-hidden color={theme.colors.success ?? "green"}>
            {resolveStatusSymbol(unicode, "success")}
          </Text>
        );
      }
      case "error": {
        return (
          <Text aria-hidden color={theme.colors.error ?? "red"}>
            {resolveStatusSymbol(unicode, "error")}
          </Text>
        );
      }
      default: {
        break;
      }
    }
  };

  let durationText: string | null;
  if (duration === undefined) {
    durationText = status === "running" ? `${elapsed}ms` : null;
  } else {
    durationText = `${duration}ms`;
  }

  let nameColor: string;
  if (status === "error") {
    nameColor = theme.colors.error ?? "red";
  } else if (status === "success") {
    nameColor = theme.colors.success ?? "green";
  } else if (status === "running") {
    nameColor = theme.colors.primary;
  } else {
    nameColor = theme.colors.mutedForeground;
  }

  return (
    <Box
      flexDirection="column"
      aria-role={collapsible ? "button" : "listitem"}
      aria-state={{
        busy: status === "running",
        disabled: disabled || undefined,
        expanded: collapsible ? !collapsed : undefined,
      }}
    >
      <Text
        aria-label={
          ariaLabel ??
          `Tool call ${name}: ${status}${durationText ? `, ${durationText}` : ""}`
        }
      >
        {""}
      </Text>
      <Box gap={1}>
        {isFocused && collapsible && <Text aria-hidden>[</Text>}
        {statusIcon()}
        <Text color={nameColor} bold={status !== "pending"}>
          {name}
        </Text>
        {durationText && (
          <Text dimColor color={theme.colors.mutedForeground}>
            ({durationText})
          </Text>
        )}
        {collapsible && (
          <Text aria-hidden dimColor color={theme.colors.mutedForeground}>
            {collapsed
              ? resolveTerminalSymbol(unicode, "▶", ">")
              : resolveTerminalSymbol(unicode, "▼", "v")}
          </Text>
        )}
        {isFocused && collapsible && <Text aria-hidden>]</Text>}
      </Box>

      {!collapsed && (
        <Box flexDirection="column" paddingLeft={2}>
          {args && Object.keys(args).length > 0 && (
            <Box flexDirection="column">
              <Text dimColor color={theme.colors.mutedForeground}>
                Args:
              </Text>
              {Object.entries(args).map(([k, v]) => (
                <Box key={k} gap={1}>
                  <Text color={theme.colors.accent}>{k}:</Text>
                  <Text dimColor>{JSON.stringify(v)}</Text>
                </Box>
              ))}
            </Box>
          )}
          {result !== undefined && (
            <Box flexDirection="column">
              <Text dimColor color={theme.colors.mutedForeground}>
                Result:
              </Text>
              <Text dimColor>
                {typeof result === "string"
                  ? result
                  : JSON.stringify(result, null, 2)}
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
