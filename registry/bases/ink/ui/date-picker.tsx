import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  onSubmit?: (date: Date) => void;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  autoFocus?: boolean;
  id?: string;
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
  onChange,
  onSubmit,
  label,
  minDate,
  maxDate,
  autoFocus = false,
  id,
}: DatePickerProps) => {
  const theme = useTheme();
  const { isFocused } = useFocus({ autoFocus, id });

  const now = new Date();
  const initial = controlledValue ?? now;

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
    onChange?.(date);
  };

  useInput((input, key) => {
    if (!isFocused) {
      return;
    }

    if (key.tab) {
      setField((f) => getNextField(f));
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
  });

  const fieldColor = (f: typeof field): string =>
    field === f && isFocused ? theme.colors.primary : theme.colors.foreground;

  const fieldBg = (f: typeof field): string | undefined =>
    field === f && isFocused ? theme.colors.selection : undefined;

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box
        gap={1}
        borderStyle="round"
        borderColor={isFocused ? theme.colors.focusRing : theme.colors.border}
        paddingX={1}
      >
        <Box flexDirection="column" alignItems="center">
          <Text color={fieldColor("month")}>▲</Text>
          <Text
            color={fieldColor("month")}
            backgroundColor={fieldBg("month")}
            bold={field === "month"}
          >
            {(MONTHS[month] ?? "").slice(0, 3)}
          </Text>
          <Text color={fieldColor("month")}>▼</Text>
        </Box>

        <Text color={theme.colors.border}>/</Text>

        <Box flexDirection="column" alignItems="center">
          <Text color={fieldColor("day")}>▲</Text>
          <Text
            color={fieldColor("day")}
            backgroundColor={fieldBg("day")}
            bold={field === "day"}
          >
            {String(day).padStart(2, "0")}
          </Text>
          <Text color={fieldColor("day")}>▼</Text>
        </Box>

        <Text color={theme.colors.border}>/</Text>

        <Box flexDirection="column" alignItems="center">
          <Text color={fieldColor("year")}>▲</Text>
          <Text
            color={fieldColor("year")}
            backgroundColor={fieldBg("year")}
            bold={field === "year"}
          >
            {year}
          </Text>
          <Text color={fieldColor("year")}>▼</Text>
        </Box>
      </Box>
      {isFocused && (
        <Text color={theme.colors.mutedForeground} dimColor>
          ↑↓: change · Tab: next field · Enter: confirm
        </Text>
      )}
    </Box>
  );
};
