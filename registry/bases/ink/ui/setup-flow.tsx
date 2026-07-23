import { Box, Text } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useAnimation } from "@/hooks/use-animation";
import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";

import { BigText } from "./big-text";
import type { BigTextFont } from "./big-text";

export interface SetupFlowProps {
  title?: string;
  titleFont?: BigTextFont;
  titleColor?: string;
  titleColorAlt?: string;
  connectorChar?: string;
  connectorColor?: string;
  children: ReactNode;
}

export interface SetupFlowBadgeProps {
  label: string;
  bg?: string;
  color?: string;
}

export type SetupFlowStepStatus =
  | "done"
  | "active"
  | "pending"
  | "success"
  | "error";

export interface SetupFlowStepProps {
  icon?: string;
  iconColor?: string;
  status?: SetupFlowStepStatus;
  children: ReactNode;
}

export interface SetupFlowSpinnerProps {
  label: string;
  onComplete?: () => void;
  isActive?: boolean;
}

export interface SetupFlowMultiSelectProps extends InteractionProps {
  label: string;
  hint?: string;
  options: { value: string; label: string; description?: string }[];
  values?: string[];
  defaultValue?: string[];
  onValueChange?: (values: string[]) => void;
  onChange?: (values: string[]) => void;
  onSubmit?: (values: string[]) => void;
  checkedChar?: string;
  uncheckedChar?: string;
  checkedColor?: string;
  "aria-label"?: string;
}

const STATUS_ICONS: Record<
  SetupFlowStepStatus,
  { asciiIcon: string; icon: string; color: string; dim: boolean }
> = {
  active: { asciiIcon: "*", color: "cyan", dim: false, icon: "◆" },
  done: { asciiIcon: "o", color: "white", dim: false, icon: "◇" },
  error: { asciiIcon: "x", color: "red", dim: false, icon: "✗" },
  pending: { asciiIcon: "o", color: "white", dim: true, icon: "◇" },
  success: { asciiIcon: "v", color: "green", dim: false, icon: "✓" },
};

const SetupFlowRoot = ({
  title,
  titleFont = "block",
  titleColor = "#888888",
  connectorChar,
  connectorColor,
  children,
}: SetupFlowProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedConnectorChar = connectorChar ?? (unicode ? "│" : "|");

  return (
    <Box flexDirection="column" paddingLeft={2} aria-role="list">
      {title && (
        <Box marginBottom={1}>
          <BigText font={titleFont} color={titleColor}>
            {title}
          </BigText>
        </Box>
      )}
      {React.Children.map(children, (child, i) => (
        <React.Fragment key={i}>
          {child}
          {i < React.Children.count(children) - 1 && (
            <Box paddingLeft={0}>
              <Text
                color={connectorColor ?? theme.colors.mutedForeground}
                dimColor={!connectorColor}
              >
                {resolvedConnectorChar}
              </Text>
            </Box>
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};

const SetupFlowBadge = ({
  label,
  bg = "cyan",
  color = "black",
}: SetupFlowBadgeProps) => {
  const unicode = useUnicode();
  return (
    <Box marginBottom={1}>
      <Text backgroundColor={bg} color={color}>
        {unicode ? ` ┌ ${label} ┐ ` : ` + ${label} + `}
      </Text>
    </Box>
  );
};

const SetupFlowStep = ({
  icon,
  iconColor,
  status = "done",
  children,
}: SetupFlowStepProps) => {
  const unicode = useUnicode();
  const { asciiIcon, icon: defaultIcon, color, dim } = STATUS_ICONS[status];
  const resolvedIcon = icon ?? (unicode ? defaultIcon : asciiIcon);
  const resolvedColor = iconColor ?? color;

  return (
    <Box
      flexDirection="row"
      gap={1}
      aria-role="listitem"
      aria-label={`${status}: ${typeof children === "string" ? children : "setup step"}`}
    >
      <Text aria-hidden color={resolvedColor} dimColor={dim}>
        {resolvedIcon}
      </Text>
      <Text dimColor={dim}>{children}</Text>
    </Box>
  );
};

const SetupFlowSpinner = ({
  label,
  isActive = true,
}: SetupFlowSpinnerProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const frame = useAnimation({ intervalMs: 83, isActive });
  const frames = unicode
    ? ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
    : ["-", "\\", "|", "/"];
  const icon = frames[frame % frames.length];

  return (
    <Box
      flexDirection="row"
      gap={1}
      aria-role="progressbar"
      aria-label={label}
      aria-state={{ busy: isActive }}
    >
      <Text aria-hidden color={theme.colors.primary}>
        {unicode ? "◆" : "*"}
      </Text>
      <Text aria-hidden color={theme.colors.primary}>
        {icon}
      </Text>
      <Text>{label}</Text>
    </Box>
  );
};

const SetupFlowMultiSelect = ({
  label,
  hint,
  options,
  values: controlledValues,
  defaultValue = [],
  onValueChange,
  onChange,
  onSubmit,
  checkedChar,
  uncheckedChar,
  checkedColor = "green",
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = label,
}: SetupFlowMultiSelectProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedCheckedChar = checkedChar ?? (unicode ? "■" : "[x]");
  const resolvedUncheckedChar = uncheckedChar ?? (unicode ? "□" : "[ ]");
  const [internalValues, setInternalValues] = useState<string[]>(defaultValue);
  const [cursor, setCursor] = useState(0);

  const selectedValues = controlledValues ?? internalValues;

  const { isFocused } = useInteraction(
    (input, key) => {
      if (key.upArrow) {
        setCursor((c) => Math.max(0, c - 1));
      } else if (key.downArrow) {
        setCursor((c) => Math.min(options.length - 1, c + 1));
      } else if (key.home) {
        setCursor(0);
      } else if (key.end) {
        setCursor(Math.max(0, options.length - 1));
      } else if (input === " ") {
        const val = options[cursor].value;
        const next = selectedValues.includes(val)
          ? selectedValues.filter((v) => v !== val)
          : [...selectedValues, val];
        if (controlledValues === undefined) {
          setInternalValues(next);
        }
        onValueChange?.(next);
        onChange?.(next);
      } else if (key.return) {
        onSubmit?.(selectedValues);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  return (
    <Box
      flexDirection="column"
      aria-role="listbox"
      aria-state={{ disabled: disabled || undefined, multiselectable: true }}
    >
      <Text aria-label={ariaLabel}>{""}</Text>
      <Box flexDirection="row" gap={1}>
        <Text color="cyan">{unicode ? "◆" : "*"}</Text>
        <Text bold>{label}</Text>
        {hint && <Text dimColor>{`(${hint})`}</Text>}
      </Box>
      {options.map((opt, i) => {
        const isChecked = selectedValues.includes(opt.value);
        const isCursor = i === cursor;
        return (
          <Box
            key={opt.value}
            flexDirection="row"
            paddingLeft={2}
            gap={1}
            aria-role="option"
            aria-label={`${opt.label}${opt.description ? `. ${opt.description}` : ""}`}
            aria-state={{ selected: isChecked }}
          >
            <Text aria-hidden color={theme.colors.mutedForeground}>
              {unicode ? "│" : "|"}
            </Text>
            <Text
              color={isChecked ? checkedColor : theme.colors.mutedForeground}
            >
              {isChecked ? resolvedCheckedChar : resolvedUncheckedChar}
            </Text>
            <Text
              color={isCursor && isFocused ? "white" : undefined}
              bold={isCursor && isFocused}
            >
              {isCursor && isFocused ? `[${opt.label}]` : opt.label}
            </Text>
            {opt.description && <Text dimColor>{`  ${opt.description}`}</Text>}
          </Box>
        );
      })}
    </Box>
  );
};

export const SetupFlow = Object.assign(SetupFlowRoot, {
  Badge: SetupFlowBadge,
  MultiSelect: SetupFlowMultiSelect,
  Spinner: SetupFlowSpinner,
  Step: SetupFlowStep,
});
