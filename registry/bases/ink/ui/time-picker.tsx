import { Box, Text } from "ink";
import React, { useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

export interface TimePickerProps {
  value?: { hours: number; minutes: number };
  defaultValue?: { hours: number; minutes: number };
  onValueChange?: (time: { hours: number; minutes: number }) => void;
  onChange?: (time: { hours: number; minutes: number }) => void;
  onSubmit?: (time: { hours: number; minutes: number }) => void;
  label?: string;
  format?: 12 | 24;
  autoFocus?: boolean;
  id?: string;
  isActive?: boolean;
  disabled?: boolean;
  required?: boolean;
  "aria-label"?: string;
}

export const TimePicker = ({
  value: controlledValue,
  defaultValue,
  onValueChange,
  onChange,
  onSubmit,
  label,
  format = 24,
  autoFocus = false,
  id,
  isActive = true,
  disabled = false,
  required = false,
  "aria-label": ariaLabel,
}: TimePickerProps) => {
  const unicode = useUnicode();
  const theme = useTheme();

  const now = new Date();
  const initialHours =
    controlledValue?.hours ?? defaultValue?.hours ?? now.getHours();
  const initialMinutes =
    controlledValue?.minutes ?? defaultValue?.minutes ?? now.getMinutes();

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
    (onValueChange ?? onChange)?.({ hours: actualHours, minutes: m });
  };

  const { isFocused } = useInteraction(
    (_input, key) => {
      if (key.leftArrow || key.rightArrow) {
        if (format === 12) {
          setField((f) => {
            if (key.rightArrow && f === "hours") {
              return "minutes";
            }
            if (key.rightArrow && f === "minutes") {
              return "ampm";
            }
            if (key.rightArrow) {
              return "hours";
            }
            if (f === "hours") {
              return "ampm";
            }
            return f === "minutes" ? "hours" : "minutes";
          });
        } else {
          setField((f) => (f === "hours" ? "minutes" : "hours"));
        }
        return;
      }

      if (key.return) {
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

      if (key.upArrow) {
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
      } else if (key.downArrow) {
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
    },
    { autoFocus, disabled, id, isActive }
  );

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
  const incrementIcon = unicode ? "▲" : "^";
  const decrementIcon = unicode ? "▼" : "v";

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box
        aria-label={
          ariaLabel ??
          `${label ?? "Time"}: ${String(displayHours).padStart(2, "0")}:${String(
            minutes
          ).padStart(
            2,
            "0"
          )}${format === 12 ? ` ${ampm}` : ""}. Editing ${field}`
        }
        aria-role="textbox"
        aria-state={{ disabled, required }}
        gap={0}
        borderStyle={resolveBorderStyle("round", unicode)}
        borderColor={isFocused ? theme.colors.focusRing : theme.colors.border}
        paddingX={1}
      >
        <Box aria-hidden flexDirection="column" alignItems="center">
          <Text color={fieldColor("hours")}>{incrementIcon}</Text>
          <Text
            color={fieldColor("hours")}
            backgroundColor={fieldBg("hours")}
            bold={field === "hours"}
          >
            {String(displayHours).padStart(2, "0")}
          </Text>
          <Text color={fieldColor("hours")}>{decrementIcon}</Text>
        </Box>

        <Box
          aria-hidden
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Text color={theme.colors.border}> </Text>
          <Text color={theme.colors.foreground} bold>
            :
          </Text>
          <Text color={theme.colors.border}> </Text>
        </Box>

        <Box aria-hidden flexDirection="column" alignItems="center">
          <Text color={fieldColor("minutes")}>{incrementIcon}</Text>
          <Text
            color={fieldColor("minutes")}
            backgroundColor={fieldBg("minutes")}
            bold={field === "minutes"}
          >
            {String(minutes).padStart(2, "0")}
          </Text>
          <Text color={fieldColor("minutes")}>{decrementIcon}</Text>
        </Box>

        {format === 12 && (
          <>
            <Box
              aria-hidden
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Text color={theme.colors.border}> </Text>
              <Text color={theme.colors.border}> </Text>
              <Text color={theme.colors.border}> </Text>
            </Box>
            <Box aria-hidden flexDirection="column" alignItems="center">
              <Text color={fieldColor("ampm")}>{incrementIcon}</Text>
              <Text
                color={fieldColor("ampm")}
                backgroundColor={fieldBg("ampm")}
                bold={field === "ampm"}
              >
                {ampm}
              </Text>
              <Text color={fieldColor("ampm")}>{decrementIcon}</Text>
            </Box>
          </>
        )}
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
