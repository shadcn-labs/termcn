import { useIsScreenReaderEnabled, Box, Text } from "ink";
import React, { useState } from "react";

import { isActivationKey, useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

export interface ThinkingBlockProps extends InteractionProps {
  content: string;
  streaming?: boolean;
  defaultCollapsed?: boolean;
  label?: string;
  tokenCount?: number;
  duration?: number;
  "aria-label"?: string;
}

export const ThinkingBlock = ({
  content,
  streaming = false,
  defaultCollapsed = true,
  label = "Reasoning",
  tokenCount,
  duration,
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel,
}: ThinkingBlockProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const { isFocused } = useInteraction(
    (input, key) => {
      if (isActivationKey(input, key)) {
        setCollapsed((c) => !c);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const tokenStr =
    tokenCount === undefined ? null : `${tokenCount.toLocaleString()} tokens`;
  const durationStr =
    duration === undefined ? null : `${(duration / 1000).toFixed(1)}s`;

  const headerParts = [
    streaming ? "Thinking..." : label,
    tokenStr,
    durationStr,
  ].filter(Boolean);

  const headerText = headerParts.join(unicode ? " · " : " - ");

  return (
    <Box
      flexDirection="column"
      borderStyle={resolveBorderStyle(
        isScreenReaderEnabled ? undefined : "single",
        unicode
      )}
      borderColor={theme.colors.border}
      paddingX={1}
      aria-role="button"
      aria-state={{
        busy: streaming,
        disabled: disabled || undefined,
        expanded: !collapsed,
      }}
    >
      <Text
        aria-label={
          ariaLabel ?? `${headerText}. ${collapsed ? "Collapsed" : "Expanded"}.`
        }
      >
        {""}
      </Text>
      <Box gap={1}>
        <Text aria-hidden color={theme.colors.mutedForeground}>
          {isFocused ? "[" : ""}
          {collapsed ? (unicode ? "▶" : ">") : unicode ? "▼" : "v"}
          {isFocused ? "]" : ""}
        </Text>
        <Text
          color={
            streaming ? theme.colors.primary : theme.colors.mutedForeground
          }
          dimColor={!streaming}
        >
          {headerText}
        </Text>
      </Box>

      {!collapsed && (
        <Box flexDirection="column" paddingTop={1}>
          <Text color={theme.colors.mutedForeground} dimColor wrap="wrap">
            {content}
          </Text>
        </Box>
      )}
    </Box>
  );
};
