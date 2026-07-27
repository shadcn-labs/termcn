import { Box, Text } from "ink";
import React, { useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

export interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date) => void;
  onChange?: (date: Date) => void;
  onSubmit?: (date: Date) => void;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  autoFocus?: boolean;
  id?: string;
  isActive?: boolean;
  disabled?: boolean;
  required?: boolean;
  "aria-label"?: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const daysInMonth = (month: number, year: number): number =>
  new Date(year, month + 1, 0).getDate();

const clamp = (val: number, min: number, max: number): number =>
  Math.min(Math.max(val, min), max);

const buildDate = (m: number, d: number, y: number): Date => new Date(y, m, d);

const getNextField = (
  f: "month" | "day" | "year"
): "month" | "day" | "year" => {
  if (f === "month") {
    return "day";
  }
  if (f === "day") {
    return "year";
  }
  return "month";
};

export const DatePicker = ({
  value: controlledValue,
  defaultValue,
  onValueChange,
  onChange,
  onSubmit,
  label,
  minDate,
  maxDate,
  autoFocus = false,
  id,
  isActive = true,
  disabled = false,
  required = false,
  "aria-label": ariaLabel,
}: DatePickerProps) => {
  const unicode = useUnicode();
  const theme = useTheme();

  const now = new Date();
  const initial = controlledValue ?? defaultValue ?? now;

  const [month, setMonth] = useState(initial.getMonth());
  const [day, setDay] = useState(initial.getDate());
  const [year, setYear] = useState(initial.getFullYear());
  const [field, setField] = useState<"month" | "day" | "year">("month");

  const notify = (m: number, d: number, y: number) => {
    const date = buildDate(m, d, y);
    if (minDate && date < minDate) {
      return;
    }
    if (maxDate && date > maxDate) {
      return;
    }
    (onValueChange ?? onChange)?.(date);
  };

  const { isFocused } = useInteraction(
    (input, key) => {
      if (key.leftArrow || key.rightArrow) {
        setField((currentField) => {
          if (key.rightArrow) {
            return getNextField(currentField);
          }
          return currentField === "month"
            ? "year"
            : currentField === "day"
              ? "month"
              : "day";
        });
        return;
      }

      if (key.return) {
        const date = buildDate(month, day, year);
        onSubmit?.(date);
        return;
      }

      if (key.upArrow) {
        if (field === "month") {
          const newMonth = (month + 1) % 12;
          const maxDay = daysInMonth(newMonth, year);
          const newDay = clamp(day, 1, maxDay);
          setMonth(newMonth);
          setDay(newDay);
          notify(newMonth, newDay, year);
        } else if (field === "day") {
          const maxDay = daysInMonth(month, year);
          const newDay = day >= maxDay ? 1 : day + 1;
          setDay(newDay);
          notify(month, newDay, year);
        } else {
          const newYear = year + 1;
          const maxDay = daysInMonth(month, newYear);
          const newDay = clamp(day, 1, maxDay);
          setYear(newYear);
          setDay(newDay);
          notify(month, newDay, newYear);
        }
      } else if (key.downArrow) {
        if (field === "month") {
          const newMonth = month === 0 ? 11 : month - 1;
          const maxDay = daysInMonth(newMonth, year);
          const newDay = clamp(day, 1, maxDay);
          setMonth(newMonth);
          setDay(newDay);
          notify(newMonth, newDay, year);
        } else if (field === "day") {
          const maxDay = daysInMonth(month, year);
          const newDay = day <= 1 ? maxDay : day - 1;
          setDay(newDay);
          notify(month, newDay, year);
        } else {
          const newYear = year - 1;
          const maxDay = daysInMonth(month, newYear);
          const newDay = clamp(day, 1, maxDay);
          setYear(newYear);
          setDay(newDay);
          notify(month, newDay, newYear);
        }
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const fieldColor = (f: typeof field): string =>
    field === f && isFocused ? theme.colors.primary : theme.colors.foreground;

  const fieldBg = (f: typeof field): string | undefined =>
    field === f && isFocused ? theme.colors.selection : undefined;
  const incrementIcon = unicode ? "▲" : "^";
  const decrementIcon = unicode ? "▼" : "v";

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box
        aria-label={
          ariaLabel ??
          `${label ?? "Date"}: ${MONTHS[month]} ${day}, ${year}. Editing ${field}`
        }
        aria-role="textbox"
        aria-state={{ disabled, required }}
        gap={1}
        borderStyle={resolveBorderStyle("round", unicode)}
        borderColor={isFocused ? theme.colors.focusRing : theme.colors.border}
        paddingX={1}
      >
        <Box aria-hidden flexDirection="column" alignItems="center">
          <Text color={fieldColor("month")}>{incrementIcon}</Text>
          <Text
            color={fieldColor("month")}
            backgroundColor={fieldBg("month")}
            bold={field === "month"}
          >
            {(MONTHS[month] ?? "").slice(0, 3)}
          </Text>
          <Text color={fieldColor("month")}>{decrementIcon}</Text>
        </Box>

        <Text aria-hidden color={theme.colors.border}>
          /
        </Text>

        <Box aria-hidden flexDirection="column" alignItems="center">
          <Text color={fieldColor("day")}>{incrementIcon}</Text>
          <Text
            color={fieldColor("day")}
            backgroundColor={fieldBg("day")}
            bold={field === "day"}
          >
            {String(day).padStart(2, "0")}
          </Text>
          <Text color={fieldColor("day")}>{decrementIcon}</Text>
        </Box>

        <Text aria-hidden color={theme.colors.border}>
          /
        </Text>

        <Box aria-hidden flexDirection="column" alignItems="center">
          <Text color={fieldColor("year")}>{incrementIcon}</Text>
          <Text
            color={fieldColor("year")}
            backgroundColor={fieldBg("year")}
            bold={field === "year"}
          >
            {year}
          </Text>
          <Text color={fieldColor("year")}>{decrementIcon}</Text>
        </Box>
      </Box>
      {isFocused && (
        <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
          {unicode
            ? "↑↓: change · ←→: field · Enter: confirm"
            : "up/down: change - left/right: field - Enter: confirm"}
        </Text>
      )}
    </Box>
  );
};
