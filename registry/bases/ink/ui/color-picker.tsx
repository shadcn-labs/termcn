import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";

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
  autoFocus = false,
  id,
}: ColorPickerProps) => {
  const theme = useTheme();
  const { isFocused } = useFocus({ autoFocus, id });
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

  useInput((input, key) => {
    if (!isFocused) {
      return;
    }

    if (key.tab) {
      setMode((m) => (m === "palette" ? "hex" : "palette"));
      return;
    }

    if (mode === "palette") {
      if (key.upArrow) {
        setPaletteRow((r) => Math.max(0, r - 1));
      } else if (key.downArrow) {
        setPaletteRow((r) => Math.min(rows - 1, r + 1));
      } else if (key.leftArrow) {
        setPaletteCol((c) => Math.max(0, c - 1));
      } else if (key.rightArrow) {
        setPaletteCol((c) => Math.min(COLS - 1, c + 1));
      } else if (key.return) {
        applyColor(currentPaletteColor);
        onSubmit?.(currentPaletteColor);
      }
    } else if (key.backspace || key.delete) {
      setHexInput((h) => h.slice(0, -1));
    } else if (key.return) {
      const hex = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        applyColor(hex);
        onSubmit?.(hex);
      }
    } else if (/^[0-9a-fA-F#]$/.test(input) && hexInput.length < 7) {
      setHexInput((h) => h + input);
    }
  });

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}

      <Box flexDirection="column">
        {Array.from({ length: rows }, (_, r) => (
          <Box key={r}>
            {Array.from({ length: COLS }, (_c, c) => {
              const idx = r * COLS + c;
              if (idx >= palette.length) {
                return null;
              }
              const paletteColor = palette[idx];
              const isActive =
                mode === "palette" && r === paletteRow && c === paletteCol;
              return (
                <Box key={c} marginRight={isActive ? 0 : 0}>
                  <Text
                    backgroundColor={paletteColor}
                    color={isActive ? "#ffffff" : paletteColor}
                    bold={isActive}
                  >
                    {isActive ? "[]" : "  "}
                  </Text>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      <Box marginTop={1} gap={1}>
        <Text color={theme.colors.mutedForeground}>Selected:</Text>
        <Text backgroundColor={currentColor} color={currentColor}>
          {"  "}
        </Text>
        <Text color={theme.colors.foreground}>{currentColor}</Text>
      </Box>

      <Box
        borderStyle="round"
        borderColor={
          mode === "hex" ? theme.colors.focusRing : theme.colors.border
        }
        paddingX={1}
        marginTop={1}
      >
        <Text color={theme.colors.mutedForeground}>#</Text>
        <Text color={theme.colors.foreground}>{hexInput || "------"}</Text>
        {mode === "hex" && isFocused && (
          <Text color={theme.colors.focusRing}>█</Text>
        )}
      </Box>

      <Text color={theme.colors.mutedForeground} dimColor>
        {mode === "palette"
          ? "↑↓←→: navigate · Enter: select · Tab: hex input"
          : "Type hex · Enter: apply · Tab: palette"}
      </Text>
    </Box>
  );
};
