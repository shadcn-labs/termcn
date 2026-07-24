/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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
  autoFocus: _autoFocus = false,
  id: _id,
}: DatePickerProps) => {
  const theme = useTheme();
  const [isFocused] = useState(true);

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

  useKeyboard((key) => {
    if (!isFocused) {
      return;
    }
    if (key.name === "tab") {
      setField((f) => getNextField(f));
      return;
    }
    if (key.name === "return") {
      const date = buildDate(month, day, year);
      onSubmit?.(date);
      return;
    }
    if (key.name === "up") {
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
    } else if (key.name === "down") {
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
    <box flexDirection="column">
      {label && (
        <text>
          <b>{label}</b>
        </text>
      )}
      <box
        gap={1}
        borderStyle="rounded"
        borderColor={isFocused ? theme.colors.focusRing : theme.colors.border}
        paddingLeft={1}
        paddingRight={1}
      >
        <box flexDirection="column" alignItems="center">
          <text fg={fieldColor("month")}>▲</text>
          <text fg={fieldColor("month")} bg={fieldBg("month")}>
            {field === "month" ? (
              <b>{(MONTHS[month] ?? "").slice(0, 3)}</b>
            ) : (
              (MONTHS[month] ?? "").slice(0, 3)
            )}
          </text>
          <text fg={fieldColor("month")}>▼</text>
        </box>

        <text fg={theme.colors.border}>/</text>

        <box flexDirection="column" alignItems="center">
          <text fg={fieldColor("day")}>▲</text>
          <text fg={fieldColor("day")} bg={fieldBg("day")}>
            {field === "day" ? (
              <b>{String(day).padStart(2, "0")}</b>
            ) : (
              String(day).padStart(2, "0")
            )}
          </text>
          <text fg={fieldColor("day")}>▼</text>
        </box>

        <text fg={theme.colors.border}>/</text>

        <box flexDirection="column" alignItems="center">
          <text fg={fieldColor("year")}>▲</text>
          <text fg={fieldColor("year")} bg={fieldBg("year")}>
            {field === "year" ? <b>{String(year)}</b> : String(year)}
          </text>
          <text fg={fieldColor("year")}>▼</text>
        </box>
      </box>
      {isFocused && (
        <text fg="#666">↑↓: change · Tab: next field · Enter: confirm</text>
      )}
    </box>
  );
};
