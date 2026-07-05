/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface TimePickerProps {
  value?: {
    hours: number;
    minutes: number;
  };
  onChange?: (time: { hours: number; minutes: number }) => void;
  onSubmit?: (time: { hours: number; minutes: number }) => void;
  label?: string;
  format?: 12 | 24;
  autoFocus?: boolean;
  id?: string;
}

export const TimePicker = ({
  value: controlledValue,
  onChange,
  onSubmit,
  label,
  format = 24,
  autoFocus: _autoFocus = false,
  id: _id,
}: TimePickerProps) => {
  const theme = useTheme();
  const [isFocused] = useState(true);

  const now = new Date();
  const initialHours = controlledValue?.hours ?? now.getHours();
  const initialMinutes = controlledValue?.minutes ?? now.getMinutes();

  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [ampm, setAmPm] = useState<"AM" | "PM">(
    initialHours < 12 ? "AM" : "PM"
  );
  const [field, setField] = useState<"hours" | "minutes" | "ampm">("hours");

  const maxHours = format === 12 ? 12 : 23;
  const minHours = format === 12 ? 1 : 0;

  const notify = (h: number, m: number, ap: "AM" | "PM") => {
    let actualHours = h;
    if (format === 12) {
      if (ap === "AM" && h === 12) {
        actualHours = 0;
      } else if (ap === "PM" && h !== 12) {
        actualHours = h + 12;
      }
    }
    onChange?.({ hours: actualHours, minutes: m });
  };

  useKeyboard((key) => {
    if (!isFocused) {
      return;
    }
    if (key.name === "tab") {
      if (format === 12) {
        setField((f) => {
          if (f === "hours") {
            return "minutes";
          }
          if (f === "minutes") {
            return "ampm";
          }
          return "hours";
        });
      } else {
        setField((f) => (f === "hours" ? "minutes" : "hours"));
      }
      return;
    }
    if (key.name === "return") {
      let actualHours = hours;
      if (format === 12) {
        if (ampm === "AM" && hours === 12) {
          actualHours = 0;
        } else if (ampm === "PM" && hours !== 12) {
          actualHours = hours + 12;
        }
      }
      onSubmit?.({ hours: actualHours, minutes });
      return;
    }
    if (key.name === "up") {
      if (field === "hours") {
        const newH = hours >= maxHours ? minHours : hours + 1;
        setHours(newH);
        notify(newH, minutes, ampm);
      } else if (field === "minutes") {
        const newM = minutes >= 59 ? 0 : minutes + 1;
        setMinutes(newM);
        notify(hours, newM, ampm);
      } else if (field === "ampm") {
        const newAp: "AM" | "PM" = ampm === "AM" ? "PM" : "AM";
        setAmPm(newAp);
        notify(hours, minutes, newAp);
      }
    } else if (key.name === "down") {
      if (field === "hours") {
        const newH = hours <= minHours ? maxHours : hours - 1;
        setHours(newH);
        notify(newH, minutes, ampm);
      } else if (field === "minutes") {
        const newM = minutes <= 0 ? 59 : minutes - 1;
        setMinutes(newM);
        notify(hours, newM, ampm);
      } else if (field === "ampm") {
        const newAp: "AM" | "PM" = ampm === "AM" ? "PM" : "AM";
        setAmPm(newAp);
        notify(hours, minutes, newAp);
      }
    }
  });

  const fieldColor = (f: typeof field): string =>
    field === f && isFocused ? theme.colors.primary : theme.colors.foreground;

  const fieldBg = (f: typeof field): string | undefined =>
    field === f && isFocused ? theme.colors.selection : undefined;

  let displayHours: number;
  if (format !== 12) {
    displayHours = hours;
  } else if (hours === 0) {
    displayHours = 12;
  } else if (hours > 12) {
    displayHours = hours - 12;
  } else {
    displayHours = hours;
  }

  return (
    <box flexDirection="column">
      {label && (
        <text>
          <b>{label}</b>
        </text>
      )}
      <box
        gap={0}
        borderStyle="rounded"
        borderColor={isFocused ? theme.colors.focusRing : theme.colors.border}
        paddingLeft={1}
        paddingRight={1}
      >
        <box flexDirection="column" alignItems="center">
          <text fg={fieldColor("hours")}>▲</text>
          <text fg={fieldColor("hours")} bg={fieldBg("hours")}>
            {field === "hours" ? (
              <b>{String(displayHours).padStart(2, "0")}</b>
            ) : (
              String(displayHours).padStart(2, "0")
            )}
          </text>
          <text fg={fieldColor("hours")}>▼</text>
        </box>

        <box flexDirection="column" alignItems="center" justifyContent="center">
          <text fg={theme.colors.border}> </text>
          <text fg={theme.colors.foreground}>
            <b>:</b>
          </text>
          <text fg={theme.colors.border}> </text>
        </box>

        <box flexDirection="column" alignItems="center">
          <text fg={fieldColor("minutes")}>▲</text>
          <text fg={fieldColor("minutes")} bg={fieldBg("minutes")}>
            {field === "minutes" ? (
              <b>{String(minutes).padStart(2, "0")}</b>
            ) : (
              String(minutes).padStart(2, "0")
            )}
          </text>
          <text fg={fieldColor("minutes")}>▼</text>
        </box>

        {format === 12 && (
          <>
            <box
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <text fg={theme.colors.border}> </text>
              <text fg={theme.colors.border}> </text>
              <text fg={theme.colors.border}> </text>
            </box>
            <box flexDirection="column" alignItems="center">
              <text fg={fieldColor("ampm")}>▲</text>
              <text fg={fieldColor("ampm")} bg={fieldBg("ampm")}>
                {field === "ampm" ? <b>{ampm}</b> : ampm}
              </text>
              <text fg={fieldColor("ampm")}>▼</text>
            </box>
          </>
        )}
      </box>
      {isFocused && (
        <text fg="#666">↑↓: change · Tab: next field · Enter: confirm</text>
      )}
    </box>
  );
};
