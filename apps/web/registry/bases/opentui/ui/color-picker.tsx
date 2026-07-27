/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

const DEFAULT_PALETTE = [
  "#000000",
  "#800000",
  "#008000",
  "#808000",
  "#000080",
  "#800080",
  "#008080",
  "#c0c0c0",
  "#808080",
  "#ff0000",
  "#00ff00",
  "#ffff00",
  "#0000ff",
  "#ff00ff",
  "#00ffff",
  "#ffffff",
];

const COLS = 8;

export interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  onSubmit?: (color: string) => void;
  label?: string;
  palette?: string[];
  autoFocus?: boolean;
  id?: string;
}

export const ColorPicker = ({
  value: controlledValue,
  onChange,
  onSubmit,
  label,
  palette = DEFAULT_PALETTE,
  autoFocus: _autoFocus = false,
  id: _id,
}: ColorPickerProps) => {
  const theme = useTheme();
  const [isFocused] = useState(true);
  const [paletteRow, setPaletteRow] = useState(0);
  const [paletteCol, setPaletteCol] = useState(0);
  const [hexInput, setHexInput] = useState("");
  const [mode, setMode] = useState<"palette" | "hex">("palette");
  const [internalValue, setInternalValue] = useState(palette[0] ?? "#000000");

  const rows = Math.ceil(palette.length / COLS);
  const currentPaletteColor =
    palette[paletteRow * COLS + paletteCol] ?? palette[0] ?? "#000000";
  const currentColor = controlledValue ?? internalValue;

  const applyColor = (color: string) => {
    if (onChange) {
      onChange(color);
    } else {
      setInternalValue(color);
    }
  };

  useKeyboard((key) => {
    if (!isFocused) {
      return;
    }
    if (key.name === "tab") {
      setMode((m) => (m === "palette" ? "hex" : "palette"));
      return;
    }
    if (mode === "palette") {
      if (key.name === "up") {
        setPaletteRow((r) => Math.max(0, r - 1));
      } else if (key.name === "down") {
        setPaletteRow((r) => Math.min(rows - 1, r + 1));
      } else if (key.name === "left") {
        setPaletteCol((c) => Math.max(0, c - 1));
      } else if (key.name === "right") {
        setPaletteCol((c) => Math.min(COLS - 1, c + 1));
      } else if (key.name === "return") {
        applyColor(currentPaletteColor);
        onSubmit?.(currentPaletteColor);
      }
    } else if (key.name === "backspace" || key.name === "delete") {
      setHexInput((h) => h.slice(0, -1));
    } else if (key.name === "return") {
      const hex = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        applyColor(hex);
        onSubmit?.(hex);
      }
    } else if (/^[0-9a-fA-F#]$/.test(key.name) && hexInput.length < 7) {
      setHexInput((h) => h + key.name);
    }
  });

  return (
    <box flexDirection="column">
      {label && (
        <text>
          <b>{label}</b>
        </text>
      )}

      <box flexDirection="column">
        {Array.from({ length: rows }, (_, r) => (
          <box key={r}>
            {Array.from({ length: COLS }, (_c, c) => {
              const idx = r * COLS + c;
              if (idx >= palette.length) {
                return null;
              }
              const paletteColor = palette[idx];
              const isActive =
                mode === "palette" && r === paletteRow && c === paletteCol;
              return (
                <box key={c} marginRight={0}>
                  <text
                    bg={paletteColor}
                    fg={isActive ? "#ffffff" : paletteColor}
                  >
                    {isActive ? <b>[]</b> : "  "}
                  </text>
                </box>
              );
            })}
          </box>
        ))}
      </box>

      <box marginTop={1} gap={1}>
        <text fg={theme.colors.mutedForeground}>Selected:</text>
        <text bg={currentColor} fg={currentColor}>
          {"  "}
        </text>
        <text fg={theme.colors.foreground}>{currentColor}</text>
      </box>

      <box
        borderStyle="rounded"
        borderColor={
          mode === "hex" ? theme.colors.focusRing : theme.colors.border
        }
        paddingLeft={1}
        paddingRight={1}
        marginTop={1}
      >
        <text fg={theme.colors.mutedForeground}>#</text>
        <text fg={theme.colors.foreground}>{hexInput || "------"}</text>
        {mode === "hex" && isFocused && (
          <text fg={theme.colors.focusRing}>█</text>
        )}
      </box>

      <text fg="#666">
        {mode === "palette"
          ? "↑↓←→: navigate · Enter: select · Tab: hex input"
          : "Type hex · Enter: apply · Tab: palette"}
      </text>
    </box>
  );
};
