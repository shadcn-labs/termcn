/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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
}

export interface SetupFlowMultiSelectProps {
  label: string;
  hint?: string;
  options: {
    value: string;
    label: string;
    description?: string;
  }[];
  values?: string[];
  onChange?: (values: string[]) => void;
  onSubmit?: (values: string[]) => void;
  checkedChar?: string;
  uncheckedChar?: string;
  checkedColor?: string;
}

const STATUS_ICONS: Record<
  SetupFlowStepStatus,
  {
    icon: string;
    color: string;
    dim: boolean;
  }
> = {
  active: { color: "cyan", dim: false, icon: "◆" },
  done: { color: "white", dim: false, icon: "◇" },
  error: { color: "red", dim: false, icon: "✗" },
  pending: { color: "white", dim: true, icon: "◇" },
  success: { color: "green", dim: false, icon: "✓" },
};

const SetupFlowRoot = ({
  title,
  titleFont = "block",
  titleColor = "#888888",
  connectorChar = "│",
  connectorColor,
  children,
}: SetupFlowProps) => {
  const theme = useTheme();

  return (
    <box flexDirection="column" paddingLeft={2}>
      {title && (
        <box marginBottom={1}>
          <BigText font={titleFont} color={titleColor}>
            {title}
          </BigText>
        </box>
      )}
      {React.Children.toArray(children).map((child, i, arr) => {
        const childKey =
          React.isValidElement(child) && child.key !== null ? child.key : i;

        return (
          <box key={childKey} flexDirection="column">
            {child}
            {i < arr.length - 1 && (
              <box paddingLeft={0}>
                <text fg={connectorColor || "#666"}>{connectorChar}</text>
              </box>
            )}
          </box>
        );
      })}
    </box>
  );
};

const SetupFlowBadge = ({
  label,
  bg = "cyan",
  color = "black",
}: SetupFlowBadgeProps) => (
  <box marginBottom={1}>
    <text fg={color}>{` ┌ ${label} ┐ `}</text>
  </box>
);

const SetupFlowStep = ({
  icon,
  iconColor,
  status = "done",
  children,
}: SetupFlowStepProps) => {
  const { icon: defaultIcon, color, dim } = STATUS_ICONS[status];
  const resolvedIcon = icon ?? defaultIcon;
  const resolvedColor = iconColor ?? color;

  return (
    <box flexDirection="row" gap={1}>
      <text fg={dim ? "#666" : resolvedColor}>{resolvedIcon}</text>
      <text fg={dim ? "#666" : undefined}>{children}</text>
    </box>
  );
};

const SetupFlowSpinner = ({ label }: SetupFlowSpinnerProps) => {
  const theme = useTheme();
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => f + 1), Math.round(1000 / 12));
    return () => clearInterval(id);
  }, []);
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  const icon = frames[frame % frames.length];

  return (
    <box flexDirection="row" gap={1}>
      <text fg={theme.colors.primary}>◆</text>
      <text fg={theme.colors.primary}>{icon}</text>
      <text>{label}</text>
    </box>
  );
};

const SetupFlowMultiSelect = ({
  label,
  hint,
  options,
  values: controlledValues,
  onChange,
  onSubmit,
  checkedChar = "■",
  uncheckedChar = "□",
  checkedColor = "green",
}: SetupFlowMultiSelectProps) => {
  const theme = useTheme();
  const [internalValues, setInternalValues] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);

  const selectedValues = controlledValues ?? internalValues;

  useKeyboard((key) => {
    if (key.name === "up") {
      setCursor((c) => Math.max(0, c - 1));
    } else if (key.name === "down") {
      setCursor((c) => Math.min(options.length - 1, c + 1));
    } else if (key.name === " ") {
      const val = options[cursor].value;
      const next = selectedValues.includes(val)
        ? selectedValues.filter((v) => v !== val)
        : [...selectedValues, val];
      if (onChange) {
        onChange(next);
      } else {
        setInternalValues(next);
      }
    } else if (key.name === "return") {
      onSubmit?.(selectedValues);
    }
  });

  return (
    <box flexDirection="column">
      <box flexDirection="row" gap={1}>
        <text fg="cyan">◆</text>
        <text>
          <b>{label}</b>
        </text>
        {hint && <text fg="#666">{`(${hint})`}</text>}
      </box>
      {options.map((opt, i) => {
        const isChecked = selectedValues.includes(opt.value);
        const isCursor = i === cursor;
        return (
          <box key={opt.value} flexDirection="row" paddingLeft={2} gap={1}>
            <text fg={theme.colors.mutedForeground}>│</text>
            <text fg={isChecked ? checkedColor : theme.colors.mutedForeground}>
              {isChecked ? checkedChar : uncheckedChar}
            </text>
            <text fg={isCursor ? "white" : undefined}>
              {isCursor ? <b>{opt.label}</b> : opt.label}
            </text>
            {opt.description && <text fg="#666">{`  ${opt.description}`}</text>}
          </box>
        );
      })}
    </box>
  );
};

export const SetupFlow = Object.assign(SetupFlowRoot, {
  Badge: SetupFlowBadge,
  MultiSelect: SetupFlowMultiSelect,
  Spinner: SetupFlowSpinner,
  Step: SetupFlowStep,
});
