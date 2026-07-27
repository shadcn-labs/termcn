/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface ConfirmProps {
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  defaultValue?: boolean;
  variant?: "default" | "danger";
}

export const Confirm = ({
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Yes",
  cancelLabel = "No",
  defaultValue = false,
  variant = "default",
}: ConfirmProps) => {
  const theme = useTheme();
  const [selected, setSelected] = useState<boolean>(defaultValue);

  useKeyboard((key) => {
    if (key.name === "left" || key.name === "right") {
      setSelected((s) => !s);
    } else if (key.name === "return") {
      if (selected) {
        onConfirm?.();
      } else {
        onCancel?.();
      }
    } else if (key.name === "y" || key.name === "Y") {
      onConfirm?.();
    } else if (key.name === "n" || key.name === "N") {
      onCancel?.();
    }
  });

  const yesColor =
    variant === "danger" ? theme.colors.error : theme.colors.primary;

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row">
        <text fg={theme.colors.primary}>{"? "}</text>
        <text>{message}</text>
      </box>
      <box gap={2} paddingLeft={2}>
        <box gap={1}>
          {selected ? (
            <text fg={yesColor}>
              <b>
                {"› "}
                {confirmLabel}
              </b>
            </text>
          ) : (
            <text fg={theme.colors.mutedForeground}>
              {"  "}
              {confirmLabel}
            </text>
          )}
        </box>
        <box gap={1}>
          {selected ? (
            <text fg={theme.colors.mutedForeground}>
              {"  "}
              {cancelLabel}
            </text>
          ) : (
            <text>
              <b>
                {"› "}
                {cancelLabel}
              </b>
            </text>
          )}
        </box>
      </box>
    </box>
  );
};
